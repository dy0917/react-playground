import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime'
import { Buffer } from 'node:buffer'
import process from 'node:process'

const maxGeneratedBytes = 512 * 1024
const client = new BedrockRuntimeClient({})

function createHttpError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export async function generatePageWithBedrock(requirement, systemPrompt) {
  const modelId = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0'
  let response

  try {
    response = await client.send(
      new ConverseCommand({
        modelId,
        system: [{ text: systemPrompt }],
        messages: [{ role: 'user', content: [{ text: requirement }] }],
        inferenceConfig: { maxTokens: 4096 },
      }),
      { abortSignal: AbortSignal.timeout(90_000) },
    )
  } catch (cause) {
    if (cause && typeof cause === 'object' && '$metadata' in cause) {
      const statusCode = cause.$metadata?.httpStatusCode === 429 ? 429 : 502
      const message = cause instanceof Error ? cause.message : 'Unknown AWS SDK error'
      throw createHttpError(statusCode, `Amazon Bedrock request failed: ${message}`)
    }
    throw cause
  }

  const responseText = response.output?.message?.content
    ?.map((block) => ('text' in block ? block.text : ''))
    .join('')
    .trim()

  if (!responseText) {
    throw new Error('Amazon Bedrock returned an empty page. Please try a more specific requirement.')
  }

  let files
  try {
    files = JSON.parse(responseText)
  } catch {
    throw new Error('Amazon Bedrock returned an invalid page response. Please try again.')
  }

  if (
    !files ||
    typeof files !== 'object' ||
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

  return { html: files.html, css: files.css, js: files.js }
}
