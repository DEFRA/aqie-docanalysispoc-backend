import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { createLogger } from '../common/helpers/logging/logger.js'
const logger = createLogger()
export async function summarizeText(text) {
  try {
    // Initialize the Bedrock client
    const client = new BedrockRuntimeClient({
      region: 'us-east-1'
    })

    // Get model configuration
    const modelId = 'anthropic.claude-3-sonnet-20240229-v1:0'
    const maxTokens = 128000
    const temperature = 0.1

    logger.info(`Using AWS Bedrock model: ${modelId}`)

    // Format the prompt based on the model
    let body = {}

    // Claude models use a specific prompt format
    const systemPrompt = 'You are an assistant that summarizes policy documents.'
    const userPrompt = `Summarize the following document in a concise way, highlighting the key points:\n\n${text}`
    const prompt = `\n\nSystem: ${systemPrompt}\n\nUser:${userPrompt}\n\nAssistant:`

    body = {
      anthropic_version: 'bedrock-2023-05-31',
      prompt,
      max_tokens_to_sample: maxTokens,
      temperature,
      stop_sequences: ["\n\nAssistant:"]
    }

    const input = {
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body)
    }

    logger.info(`Before invoking Bedrock`)

    // Invoke the model
    const command = new InvokeModelCommand(input)

    const response = await client.send(command)

    logger.info(`After invoking Bedrock`)

    // Parse the response
    const responseBody = JSON.parse(await response.body.transformToString())

    logger.info(`Before Read response`)
    // Extract the generated text based on model type
    let summary = responseBody.completion
    logger.info(`After Read response`)

    return summary
  } catch (error) {
    logger.info(`Error summarizing text with Bedrock: ${error.message}`)
    logger.error(`Error summarizing text with Bedrock: ${error.message}`)
    throw new Error(`Failed to summarize text with Bedrock: ${error.message}`)
  }
}