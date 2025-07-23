import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from '@aws-sdk/client-bedrock-runtime'
import { createLogger } from '../../common/helpers/logging/logger.js'

const logger = createLogger()
const client = new BedrockRuntimeClient({ region: 'eu-west-2' })

async function summarizeText(text) {
  try {
    console.log('summarise entered')
    logger.info(`Summarizing text: ${'summarise entered'}`)
    const systemPrompt =
      'You are an assistant working in air quality policy documents.'
    const userPrompt = 'Explain air quality in simple terms'
    logger.info(`User prompt: ${userPrompt}`)
    console.log('userPrompt:', userPrompt)
    const prompt = `${systemPrompt}\n\n${userPrompt}`
    const result = await getClaudeResponseAsJson(prompt)

    return result.output
  } catch (error) {
    logger.error(`Error summarizing text with Bedrock: ${error.message}`)
    throw new Error(`Failed to summarize text with Bedrock: ${error.message}`)
  }
}

async function getClaudeResponseAsJson(prompt) {
  const input = {
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  }

  const command = new InvokeModelCommand(input)
  const response = await client.send(command)

  const responseBody = JSON.parse(new TextDecoder().decode(response.body))
  logger.info(`Response from Bedrock: ${JSON.stringify(responseBody)}`)
  return {
    success: true,
    output: responseBody.content
  }
}

export { summarizeText }
