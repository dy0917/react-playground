import OpenAI from 'openai'
import { Buffer } from 'node:buffer'
import process from 'node:process'

const maxGeneratedBytes = 512 * 1024

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

function parseGeneratedFiles(responseText) {
  try {
    return JSON.parse(responseText)
  } catch {
    const files = {}
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
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw createHttpError(503, 'Set OPENAI_API_KEY in backend/.env to use Amazon Bedrock.')
  }

  const workspaceId = process.env.OPENAI_WORKSPACE_ID || process.env.ANTHROPIC_WORKSPACE_ID
  const client = new OpenAI({
    apiKey,
    baseURL: getBedrockBaseURL(),
    timeout: 90_000,
    ...(workspaceId
      ? { defaultHeaders: { 'openai-project': workspaceId } }
      : {}),
  })
  const model = process.env.OPENAI_MODEL || process.env.ANTHROPIC_MODEL || 'openai.gpt-oss-120b'
  let responseText = ''

  try {
    const stream = await client.responses.create(
      {
        model,
        instructions: systemPrompt,
        input: requirement,
        max_output_tokens: 4096,
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

  let files
  try {
    files = parseGeneratedFiles(responseText)
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unknown response format'
    throw new Error(`Amazon Bedrock returned an invalid page response: ${message}`)
  }

  if (
    !files ||
    typeof files !== 'object' ||
    Array.isArray(files) ||
    ['html', 'css', 'js'].some((field) => typeof files[field] !== 'string')
  ) {
    throw new Error('Amazon Bedrock did not return all required page files. Please try again.')
  }

  const generatedBytes = Buffer.byteLength(files.html) +
    Buffer.byteLength(files.css) +
    Buffer.byteLength(files.js)
  if (generatedBytes > maxGeneratedBytes) {
    throw new Error('The generated page is too large. Please use a shorter requirement.')
  }

  const html = files.html
    .replace(/(\bhref\s*=\s*)(["'])\.?\/?style\.css\2/gi, '$1$2./styles.css$2')
    .replace(/(\bsrc\s*=\s*)(["'])\.?\/?script\.js\2/gi, '$1$2./app.js$2')

  return { html, css: files.css, js: files.js }
}
