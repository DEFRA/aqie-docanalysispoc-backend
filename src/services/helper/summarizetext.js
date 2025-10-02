import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from '@aws-sdk/client-bedrock-runtime'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { config } from '../../config.js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import fetch from 'node-fetch'

const logger = createLogger()

// const bedrock = new BedrockRuntimeClient({ region: 'eu-north-1' });
const s3 = new S3Client({ region: `${process.env.AWS_REGION}` })
// const { v4: uuidv4 } = require('uuid')

// const client = new BedrockRuntimeClient({ region: 'eu-west-2' })
// ⏱️ Custom timeout settings
const client = new BedrockRuntimeClient({
  region: 'eu-west-2',
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 10000, // 10 seconds to establish connection
    socketTimeout: 300000 // 5 minutes to wait for response
  })
})

/**
 * Common function to upload response data to S3
 * @param {string} requestId - Unique request identifier
 * @param {Buffer|string|object} responseBody - The response body to upload
 * @returns {Promise<void>}
 */
async function uploadResponseToS3(requestId, responseBody) {
  try {
    logger.info(`Uploading to S3 bucket in region: ${process.env.AWS_REGION}`)
    logger.info('S3 upload started')

    const s3Command = new PutObjectCommand({
      Bucket: config.get('aws.s3BucketName'),
      Key: `responses/${requestId}.json`,
      Body: responseBody, // S3 handles Buffer, string, and Uint8Array automatically
      ContentType: 'application/json'
    })

    await s3.send(s3Command)
    logger.info('S3 upload ended')
  } catch (error) {
    logger.error(`Error uploading to S3: ${error.message}`)
    throw error
  }
}

async function summarizeText(request) {
  try {
    logger.info(`Summarizing text: ${'summarise entered'}`)

    const parsedPayload = JSON.parse(request.payload)
    const systemPrompt = parsedPayload.systemprompt
    const userPrompt = parsedPayload.userprompt
    const useDirectApi = process.env.USE_DIRECT_API === 'true'

    const prompt = `${systemPrompt}\n\n${userPrompt}`
    logger.info(`Input prompt: ${prompt}`)
    const requestId = uuidv4()
    logger.info(`Generated request ID: ${requestId}`)

    /*eslint-disable no-unused-vars */
    const result = useDirectApi
      ? await processWithDirectBedrockAndWriteToS3(requestId, systemPrompt, userPrompt)
      : await processWithBedrockAndWriteToS3(requestId, prompt)
    /*eslint-enable*/

    return requestId
  } catch (error) {
    logger.error(`Error summarizing text with Bedrock: ${error.message}`)
    throw new Error(`Failed to summarize text with Bedrock: ${error.message}`)
  }
}
/**
 * Process with Bedrock using AWS SDK and write response to S3
 * @param {string} requestId - Unique request identifier
 * @param {string} prompt - The prompt to send to Bedrock
 * @returns {Promise<Object>} - Response object with success status and output
 */
async function processWithBedrockAndWriteToS3(requestId, prompt) {
  // Using DEFRA CDP Bedrock configuration
  // Reference: https://portal.cdp-int.defra.cloud/documentation/how-to/bedrock-ai.md
  const input = {
    modelId: 'arn:aws:bedrock:eu-west-2:332499610595:application-inference-profile/e4amybi3as0i',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 3500,
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }]
    }),
    guardrailIdentifier: 'arn:aws:bedrock:eu-west-2:332499610595:guardrail/eqs44398uvjn',
    guardrailVersion: '4',
    trace: 'ENABLED'
  }

  try {
    logger.info(`Processing with Bedrock SDK`)
    const command = new InvokeModelCommand(input)
    logger.info(`Command created for Bedrock`)
    const response = await client.send(command)
    logger.info(`Response received from Bedrock`)

    const responseBodyParsed = JSON.parse(new TextDecoder().decode(response.body))
    logger.info(`Response from Bedrock success`)
    logger.info(`Response body: ${JSON.stringify(responseBodyParsed, null, 2)}`)

    if (!responseBodyParsed || !responseBodyParsed.content) {
      throw new Error(
        `Invalid response structure from Bedrock: ${JSON.stringify(responseBodyParsed)}`
      )
    }

    await uploadResponseToS3(requestId, response.body)

    return {
      success: true,
      output: responseBodyParsed.content
    }
  } catch (error) {
    logger.error(
      `Error processing with Bedrock SDK or writing to S3: ${error.message}`
    )
    return {
      success: false,
      output: null,
      error: error.message
    }
  }
}

/**
 * Process with Bedrock using direct REST API with Bearer token and write response to S3
 * @param {string} requestId - Unique request identifier
 * @param {string} systemPrompt - The system prompt to send to Bedrock
 * @param {string} userPrompt - The user prompt to send to Bedrock
 * @returns {Promise<Object>} - Response object with success status and output
 */
async function processWithDirectBedrockAndWriteToS3(requestId, systemPrompt, userPrompt) {
  const bearerToken = process.env.BEARER_TOKEN_BEDROCK || ''
  const apiUrl = process.env.BEDROCK_API_URL || ''
  if (!bearerToken) {
    throw new Error('Bearer token is required for direct API calls')
  }
  if (!apiUrl) {
    throw new Error('Bedrock API URL is required for direct API calls')
  }

  const requestBody = JSON.stringify({
    system: systemPrompt,
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 3500,
    temperature: 0.0,
    messages: [{ role: 'user', content: userPrompt }]
  })

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${bearerToken}`,
  }

  try {
    logger.info(`Processing with Bedrock Direct API`)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: requestBody,
      timeout: 300000 // 5 minutes timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const responseText = await response.text()
    logger.info(`Response received from Bedrock Direct API`)

    const responseBodyParsed = JSON.parse(responseText)
    logger.info(`Response from Bedrock Direct API success`)
    logger.info(`Response body: ${JSON.stringify(responseBodyParsed, null, 2)}`)

    if (!responseBodyParsed || !responseBodyParsed.content) {
      throw new Error(
        `Invalid response structure from Bedrock Direct API: ${JSON.stringify(responseBodyParsed)}`
      )
    }

    await uploadResponseToS3(requestId, responseText)

    return {
      success: true,
      output: responseBodyParsed.content
    }
  } catch (error) {
    logger.error(
      `Error processing with Bedrock Direct API or writing to S3: ${error.message}`
    )
    return {
      success: false,
      output: null,
      error: error.message
    }
  }
}

export { summarizeText }
