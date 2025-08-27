import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from '@aws-sdk/client-bedrock-runtime'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import { createLogger } from '../../common/helpers/logging/logger.js'
import { config } from '../../config.js'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

const logger = createLogger()

// const bedrock = new BedrockRuntimeClient({ region: 'eu-north-1' });
const s3 = new S3Client({ region: `${process.env.AWS_REGION}` });
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
// const modelIdrequest = ''

async function summarizeText(request) {
  try {
    // console.log('summarise entered')
    logger.info(`Summarizing text: ${'summarise entered'}`)
    // const systemPrompt = 'You are an assistant working in air quality policy documents.'
    // const userPrompt = 'Explain air quality in simple terms'
    // const requestdata = text.params.prompt
    // const promptrequest = requestdata.split('&')
    // const systemPrompt = promptrequest[0]
    // const userPrompt = promptrequest[1]
    // const { systemPromptValue, userPromptValue } = request.payload;
    // const systemPrompt = systemPromptValue;
    // const userPrompt = userPromptValue;

    const parsedPayload = JSON.parse(request.payload)
    const systemPrompt = parsedPayload.systemprompt
    const userPrompt = parsedPayload.userprompt
    // modelIdrequest = parsedPayload.modelid

    // logger.info(`User prompt: ${userPrompt}`)
    // console.log('userPrompt:', userPrompt)

    // const prompt = JSON.stringify({
    //     prompt: `${systemPrompt}\n\n${userPrompt}`
    // });

    const prompt = `${systemPrompt}\n\n${userPrompt}`
    const requestId = uuidv4();
    logger.info(`Generated request ID: ${requestId}`)
    const result =  processWithBedrockAndWriteToS3(requestId, prompt);

    // const prompt = `${systemPrompt}\n\n${userPrompt}`
    // const result = await getClaudeResponseAsJson(prompt)

    // if (!result || !result.success || !result.output) {
    //   throw new Error(`Bedrock response missing output. Full result: ${JSON.stringify(result)}`);
    // }

    // return result.output
    return requestId

  } catch (error) {
    logger.error(`Error summarizing text with Bedrock: ${error.message}`)
    throw new Error(`Failed to summarize text with Bedrock: ${error.message}`)
  }
}

async function getClaudeResponseAsJson(prompt) {
  try {
    const input = {
      // modelId: modelIdrequest, //
      modelId: 'anthropic.claude-3-7-sonnet-20250219-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 15000, //4096,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }]
      })
    }

    //for API call
    // const awsTempApiUrl = config.get('AWSTempApiUrl')
    // const awsTempApiKey = config.get('AWSTempApiKey')

    const command = new InvokeModelCommand(input)
    const response = await client.send(command)

    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    //   logger.info(`Response from Bedrock: ${JSON.stringify(responseBody)}`)
    
    logger.info('Response from Bedrock summarizeText Success')
    // if (!responseBody.ok) {
    //   throw new Error(
    //     `Bedrock response error: ${responseBody.error || 'Unknown error'}`
    //   )
    // }
    return {
      success: true,
      output: responseBody.content
    }
  } catch (error) {
    logger.error(`Error getClaudeResponseAsJson with Bedrock: ${error.message}`)
    throw new Error(
      `Failed getClaudeResponseAsJson with Bedrock: ${error.message}`
    )
  }
}

async function processWithBedrockAndWriteToS3(requestId, prompt) {
  const input = {
    modelId: 'anthropic.claude-3-7-sonnet-20250219-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 3500, //4096,
      temperature: 0.1,
      messages: [{ role: 'user', content: prompt }]
    })
  };

  try {
    logger.info(`Processing with Bedrock`)
    const command = new InvokeModelCommand(input);
    logger.info(`Command created for Bedrock`)
    const response = await client.send(command);
    logger.info(`Response received from Bedrock`)
    
    // const startTime = Date.now();
    const responseBodynew = JSON.parse(new TextDecoder().decode(response.body))
    logger.info(`Response from Bedrock success`)
    // const duration = Date.now() - startTime;
    // logger.info(`Bedrock processing duration: ${duration}ms`);

      if (!responseBodynew || !responseBodynew.content) {
        throw new Error(`Invalid response structure from Bedrock: ${responseBodynew}`);
      }
      logger.info(`Uploading to S3 bucket in region: ${process.env.AWS_REGION}`);
      logger.info('S3 upload started')
    const s3Command = new PutObjectCommand({
      Bucket: 'dev-aqie-docanalysis-c63f2',
      Key: `responses/${requestId}.json`,
      Body: response.body,
      ContentType: 'application/json'
    });
    await s3.send(s3Command)
    logger.info('S3 upload ended')
    
    return {
      success: true,
      output: responseBodynew.content
    }
  } 
  // catch (error) {
  //   console.error('Error processing with Bedrock or writing to S3:', error);
  // }  
catch (error) {
  logger.error(`Error processing with Bedrock or writing to S3: ${error.message}`);
  return {
    success: false,
    output: null,
    error: error.message
  };
}

}

export { summarizeText }