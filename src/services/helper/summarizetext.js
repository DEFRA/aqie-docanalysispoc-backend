import {
  BedrockRuntimeClient,
  StartAsyncInvokeCommand
} from '@aws-sdk/client-bedrock-runtime'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { v4 as uuidv4 } from 'uuid'

const logger = createLogger()
const client = new BedrockRuntimeClient({
  region: 'eu-west-2',
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 10000,
    socketTimeout: 300000
  })
})

async function summarizeText(request) {
  try {
    logger.info('Summarizing text')
    
    const parsedPayload = JSON.parse(request.payload)
    const systemPrompt = parsedPayload.systemprompt
    const userPrompt = parsedPayload.userprompt
    const prompt = `${systemPrompt}\n\n${userPrompt}`
    
    const requestId = uuidv4()
    logger.info(`Generated request ID: ${requestId}`)
    
    await processWithBedrockAndWriteToS3(requestId, prompt)
    return requestId
    
  } catch (error) {
    logger.error(`Error summarizing text with Bedrock: ${error.message}`)
    throw new Error(`Failed to summarize text with Bedrock: ${error.message}`)
  }
}

async function processWithBedrockAndWriteToS3(requestId, prompt) {
  const command = new StartAsyncInvokeCommand({
    clientRequestToken: requestId,
    modelId: 'anthropic.claude-3-7-sonnet-20250219-v1:0',
    modelInput: {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 15000,
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }]
    },
    outputDataConfig: {
      s3OutputDataConfig: {
        s3Uri: `s3://dev-aqie-docanalysis-c63f2/responses/${requestId}.json`
      }
    }
  })

  try {

    logger.info(`Async invoke started`)

    const response = await client.send(command)
    
    logger.info(`Async invoke completed`)
    
    return {
      success: true,
      invocationArn: response.invocationArn,
      requestId: requestId
    }
  } catch (error) {
    logger.error(`Error starting Bedrock async invoke command: ${error.message}`)
    return {
      success: false,
      error: error.message
    }
  }
}

export { summarizeText }