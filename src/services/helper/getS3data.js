import { createLogger } from '../../common/helpers/logging/logger.js'
import { Readable } from 'stream'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

const logger = createLogger()
async function getS3(requestId) {
    try { 

    logger.info(`Retrieving data from S3 for request ID: ${requestId}`)
    try {
      const getCommand = new GetObjectCommand({
        Bucket: 'dev-aqie-docanalysis-c63f2',
        Key: `responses/${requestId}.json`
      });  
      const response = await s3.send(getCommand);
      const bodyString = await streamToString(response.Body);
      if (bodyString === 'No data found') {
        return {
          success: false,
          message: 'No data found'
        };
      } 
      const parsedData = JSON.parse(bodyString);
      return {
        success: true,
        data: parsedData
      };
    } catch (error) {
      console.error('Error reading from S3:', error);
      return {
        success: false,
        error: error.message
      };
    }
    } catch (error) {
    logger.error(`Error getting the data from getS3: ${error.message}`)
    throw new Error(`Failed to get the data from getS3: ${error.message}`)
  }
}

 async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }  
    if (chunks.length === 0) {
      return 'No data found';
    }  
    return Buffer.concat(chunks).toString('utf-8');
  }

  async function readResponseFromS3new(requestId) {
    try {
      const getCommand = new GetObjectCommand({
        Bucket: 'dev-aqie-docanalysis-c63f2',
        Key: `responses/${requestId}.json`
      });  
      const response = await s3.send(getCommand);  
      const chunks = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }  
      if (chunks.length === 0) {
        return {
          success: false,
          message: 'No data found'
        };
      }  
      const bodyString = new TextDecoder('utf-8').decode(Buffer.concat(chunks));
      const parsedData = JSON.parse(bodyString);  
      if (!parsedData || Object.keys(parsedData).length === 0) {
        return {
          success: false,
          message: 'No data found'
        };
      }  
      return {
        success: true,
        data: parsedData
      };
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return {
          success: false,
          message: 'No data found'
        };
      }  
      console.error('Error reading from S3:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  
export { getS3 }