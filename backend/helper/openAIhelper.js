import OpenAI from 'openai'
import { bedrock } from 'openai/providers/bedrock/aws'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import { normalizeGeneratedFiles } from './generatedFiles.js'

function createHttpError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function getBedrockBaseURL() {
  if (process.env.OPENAI_BASE_URL) return process.env.OPENAI_BASE_URL

  const legacyAnthropicBaseURL = process.env.ANTHROPIC_BASE_URL
  if (legacyAnthropicBaseURL) {
    return legacyAnthropicBaseURL.replace(/\/anthropic\/?$/, '/v1')
  }

  const region = process.env.AWS_REGION
  if (!region) {
    throw createHttpError(503, 'Set AWS_REGION or OPENAI_BASE_URL to configure Amazon Bedrock.')
  }

  return `https://bedrock-mantle.${region}.api.aws/v1`
}

function getProfileBedrockBaseURL() {
  const legacyAnthropicBaseURL = process.env.ANTHROPIC_BASE_URL
  const configuredBaseURL = process.env.OPENAI_BASE_URL
    || (legacyAnthropicBaseURL
      ? legacyAnthropicBaseURL.replace(/\/anthropic\/?$/, '/v1')
      : undefined)
  if (!configuredBaseURL) return undefined

  const url = new URL(configuredBaseURL)
  if (url.hostname.startsWith('bedrock-mantle.') && url.pathname.replace(/\/$/, '') === '/v1') {
    url.pathname = '/openai/v1'
  }
  return url.toString().replace(/\/$/, '')
}

function parseGeneratedFiles(responseText) {
  const trimmedResponse = responseText.trim()
  console.log('Raw response from Amazon Bedrock:', trimmedResponse)
  const rawResponsePrefix = 'Raw response from Amazon Bedrock:'
  const jsonText = trimmedResponse.startsWith(rawResponsePrefix)
    ? trimmedResponse.slice(rawResponsePrefix.length).trim()
    : trimmedResponse

  try {

    const parsed = JSON.parse(jsonText)
    console.log(parsed)
    return parsed
  } catch {
    const files = {}
    const fileHeadingPattern = /^\s*#{1,6}\s*.*?(?:\*\*)?`?(index\.html|style\.css|styles\.css|script\.js|app\.js)`?(?:\*\*)?\s*$/gim
    const headings = [...responseText.matchAll(fileHeadingPattern)]

    for (let index = 0; index < headings.length; index += 1) {
      const heading = headings[index]
      const sectionStart = heading.index + heading[0].length
      const sectionEnd = headings[index + 1]?.index ?? responseText.length
      const section = responseText.slice(sectionStart, sectionEnd)
      const codeBlock = section.match(/```(?:html|css|javascript|js)?\s*\r?\n([\s\S]*?)\r?\n```/i)
      if (!codeBlock) continue

      const fileName = heading[1].toLowerCase()
      const field = fileName === 'index.html'
        ? 'html'
        : fileName === 'style.css' || fileName === 'styles.css'
          ? 'css'
          : 'js'
      if (files[field] !== undefined) {
        throw new Error(`The response contains multiple ${field.toUpperCase()} file sections.`)
      }
      files[field] = codeBlock[1]
    }

    if (['html', 'css', 'js'].every((field) => typeof files[field] === 'string')) {
      return files
    }

    const codeBlockPattern = /```(html|css|javascript|js)\s*\r?\n([\s\S]*?)\r?\n```/gi
    let match

    while ((match = codeBlockPattern.exec(responseText)) !== null) {
      const fileType = match[1].toLowerCase()
      const field = fileType === 'html' ? 'html' : fileType === 'css' ? 'css' : 'js'
      if (files[field] !== undefined) {
        throw new Error(`The response contains multiple ${field.toUpperCase()} code blocks.`)
      }
      files[field] = match[2]
    }

    if (['html', 'css', 'js'].some((field) => typeof files[field] !== 'string')) {
      throw new Error('The response must contain JSON or fenced HTML, CSS, and JavaScript code blocks.')
    }

    return files
  }
}

export async function generatePageWithOpenAI(requirement, systemPrompt) {
  const awsProfile = process.env.AWS_PROFILE?.trim()
  const model = process.env.OPENAI_MODEL || process.env.ANTHROPIC_MODEL || 'openai.gpt-oss-120b'
  const usesGlobalInferenceProfile = model.startsWith('global.')
  let authentication
  if (awsProfile) {
    authentication = {
      provider: bedrock({
        profile: awsProfile,
        region: process.env.AWS_REGION,
        ...(usesGlobalInferenceProfile
          ? { endpoint: 'runtime', baseURL: null }
          : { baseURL: getProfileBedrockBaseURL() }),
      }),
    }
  } else {
    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw createHttpError(503, 'Set OPENAI_API_KEY in backend/.env to use Amazon Bedrock.')
    }
    authentication = { apiKey, baseURL: getBedrockBaseURL() }
  }

  const workspaceId = process.env.OPENAI_WORKSPACE_ID || process.env.ANTHROPIC_WORKSPACE_ID
  const client = new OpenAI({
    ...authentication,
    timeout: 90_000,
    ...(workspaceId
      ? { defaultHeaders: { 'openai-project': workspaceId } }
      : {}),
  })
  let responseText = ''

  try {
    const stream = await client.responses.create(
      {
        model,
        instructions: systemPrompt,
        input: requirement,
        max_output_tokens: 16384,
        stream: true,
      },
      { signal: AbortSignal.timeout(90_000) },
    )

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        responseText += event.delta
      } else if (event.type === 'error') {
        throw createHttpError(502, `Amazon Bedrock request failed: ${event.message}`)
      } else if (event.type === 'response.failed') {
        const message = event.response.error?.message || 'The model response failed.'
        throw createHttpError(502, `Amazon Bedrock request failed: ${message}`)
      } else if (event.type === 'response.incomplete') {
        const reason = event.response.incomplete_details?.reason
        const detail = reason ? ` (${reason})` : ''
        throw createHttpError(502, `Amazon Bedrock returned an incomplete response${detail}. Please retry.`)
      }
    }
  } catch (cause) {
    if (cause && typeof cause === 'object' && 'statusCode' in cause) throw cause
    if (cause && typeof cause === 'object' && 'status' in cause) {
      const statusCode = cause.status === 429 ? 429 : 502
      const message = cause instanceof Error ? cause.message : 'Unknown OpenAI SDK error'
      throw createHttpError(statusCode, `Amazon Bedrock request failed: ${message}`)
    }
    throw cause
  }

  responseText = responseText.trim()

  if (!responseText) {
    throw new Error('Amazon Bedrock returned an empty page. Please try a more specific requirement.')
  }

  let generatedFiles
  try {
    generatedFiles = normalizeGeneratedFiles(parseGeneratedFiles(responseText))
    console.log('Raw response from Amazon Bedrock:', responseText)
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unknown response format'
    throw new Error(`Amazon Bedrock returned an invalid page response: ${message}`, { cause })
  }
  console.log('Parsed response from Amazon Bedrock:', generatedFiles)

  return generatedFiles.map((file) => {
    if (file.path !== 'index.html') return file
    return {
      ...file,
      content: file.content
        .replace(/(\bhref\s*=\s*)(["'])\.?\/?style\.css\2/gi, '$1$2./styles.css$2')
        .replace(/(\bsrc\s*=\s*)(["'])\.?\/?script\.js\2/gi, '$1$2./app.js$2'),
    }
  })
}
