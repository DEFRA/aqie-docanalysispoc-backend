import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { PromptTemplate } from 'langchain/prompts'
import { StringOutputParser } from 'langchain/schema/output_parser'
import { config } from '../config.js'
import { createLogger } from '../common/helpers/logging/logger.js'
const logger = createLogger()
export async function summarizeText(text) {
  try {
    // Initialize the Bedrock client
    const client = new BedrockRuntimeClient({ 
      region: 'us-east-1'
    })
    
    // Get model configuration
    const modelId = 'anthropic.claude-v2'
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
        prompt,
        max_tokens_to_sample: maxTokens,
        temperature,
        top_k: 250,
        top_p: 1,
        stop_sequences: ["\n\nAssistant:"]
      }
    
    const input = {
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(body)
    }
    
    // Invoke the model
    const command = new InvokeModelCommand(input)
    const response = await client.send(command)
    
    // Parse the response
    const responseBody = JSON.parse(await response.body.transformToString())
    
    // Extract the generated text based on model type
    let summary = responseBody.completion
    
    return summary
  } catch (error) {
    logger.error(`Error summarizing text with Bedrock: ${error.message}`)
    throw new Error(`Failed to summarize text with Bedrock: ${error.message}`)
  }
}