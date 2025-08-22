import { createLogger } from '../../common/helpers/logging/logger.js'
import { Readable } from 'stream'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

const logger = createLogger()
async function getS3(requestId) {
    try { 
        // const parsedPayload = JSON.parse(request.payload)
        // const userrequestId = parsedPayload.requestId
        logger.info(`Retrieving data before from S3 for request ID: ${userrequestId}`)
        const userrequestId = request.params.requestId
        const s3 = new S3Client({ region: `${process.env.AWS_REGION}` });
        
    logger.info(`Retrieving data after from S3 for request ID: ${userrequestId}`)
    try {
        logger.info('S3 read started')
      const getCommand = new GetObjectCommand({
        Bucket: 'dev-aqie-docanalysis-c63f2',
        Key: `responses/${userrequestId}.json`
      });  
      const response = await s3.send(getCommand);
      logger.info('S3 read ended')
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

  async function readResponseFromS3new(userrequestId) {
    try {
      const getCommand = new GetObjectCommand({
        Bucket: 'dev-aqie-docanalysis-c63f2',
        Key: `responses/${userrequestId}.json`
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