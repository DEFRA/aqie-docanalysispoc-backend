import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand
} from '@aws-sdk/client-bedrock-runtime'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()
const client = new BedrockRuntimeClient({ region: 'eu-west-2' })

export async function summarizeText(text) {
  try {
    console.log('summarise entered')

    const systemPrompt =
      'You are an assistant that summarizes policy documents.'
    //const userPrompt = `Summarize the following document in a concise way, highlighting the key points:\n\n${text}`
    const userPrompt = 'Explain air quality in simple terms'
    console.log('userPrompt:', userPrompt)
    const prompt = `${systemPrompt}\n\n${userPrompt}`
    const result = await getClaudeResponseAsJson(prompt)

    return result.output
  } catch (error) {
    logger.error(`Error summarizing text with Bedrock: ${error.message}`)
    throw new Error(`Failed to summarize text with Bedrock: ${error.message}`)
  }
}

export async function getClaudeResponseAsJson(prompt) {
  const input = {
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    contentType: 'application/json',
    accept: '*/*',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  }

  const command = new InvokeModelWithResponseStreamCommand(input)
  const response = await client.send(command)

  let fullText = ''

  for await (const event of response.body) {
    if (event.bytes) {
      const chunk = JSON.parse(new TextDecoder().decode(event.bytes))
      fullText += chunk?.delta?.text || ''
    }
  }

  // Return as JSON
  return {
    success: true,
    output: fullText
    // console.log(fullText);
  }
}
