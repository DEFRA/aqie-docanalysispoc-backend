import { createLogger } from '../../common/helpers/logging/logger.js'
import { Readable } from 'stream'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

const logger = createLogger();

async function getS3(request) {
  try {
    logger.info(`Retrieving data from S3 for request ID: ${request.params.requestId}`);
    const userrequestId = request.params.requestId;
    const s3 = new S3Client({ region: `${process.env.AWS_REGION}` });

    try {
      logger.info('S3 read started');
      const getCommand = new GetObjectCommand({
        Bucket: 'dev-aqie-docanalysis-c63f2',
        Key: `responses/${userrequestId}.json`
      });
      const response = await s3.send(getCommand);
      logger.info('S3 read ended');

      const bodyString = await streamToString(response.Body);
      if (bodyString === 'No data found') {
        return {
          status: 'pending',
          message: 'No data found'
        };
      }

      const parsedData = JSON.parse(bodyString);
      if (!parsedData || Object.keys(parsedData).length === 0) {
        return {
          status: 'pending',
          message: 'No data found'
        };
      }

      return {
        status: 'completed',
        result: parsedData?.content?.result?.content?.find(item => item.type === 'text')?.text || 'No text found'
      };
    } catch (error) {
      logger.error('Error reading from S3:', error);
      return {
        status: 'error',
        message: error.message
      };
    }
  } catch (error) {
        // Handle missing key error specifically
        if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404 || error.message.includes('The specified key does not exist')) {
            logger.warn(`S3 key not found for requestId: ${userrequestId}`);
            return {
              status: 'pending',
              message: 'The specified key does not exist.'
            };
          }
    logger.error(`Error getting the data from getS3: ${error.message}`);
    return {
      status: 'error',
      message: `Failed to get the data from getS3: ${error.message}`
    };
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

export { getS3 };