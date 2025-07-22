import { createLogger } from '../common/helpers/logging/logger.js'
import { parsePdfBuffer } from '../services/pdf-service.js'
import { summarizeText } from '../services/openai-service.js'
import Boom from '@hapi/boom'

const logger = createLogger()

export const documents = [
  {
    method: 'GET',
    path: '/test',
    options: {
      cors: {
        origin: ['*'],
        additionalHeaders: ['content-type', 'x-requested-with'],
        credentials: true
      }
    },
    handler: async (request, h) => {
      return h.response({
        success: true,
        message: 'CORS test successful'
      })
    }
  },
  {
    method: 'GET',
    path: '/api/documents/test',
    options: {
      cors: {
        origin: ['*'],
        additionalHeaders: ['content-type', 'x-requested-with'],
        credentials: true
      }
    },
    handler: async (request, h) => {
      return h.response({
        success: true,
        message: 'CORS test successful'
      })
    }
  },
  {
    method: 'POST',
    path: '/api/documents/summarize',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 50 * 1024 * 1024, // 50MB limit
        allow: 'multipart/form-data'
      },
      cors: {
        origin: ['*'],
        additionalHeaders: ['content-type', 'x-requested-with'],
        credentials: true,
        exposedHeaders: ['content-disposition']
      }
    },
    handler: async (request, h) => {
      try {
        const { payload } = request
        const file = payload?.file
        
        if (!file || !file.hapi || file.hapi.headers['content-type'] !== 'application/pdf') {
          return Boom.badRequest('Please upload a PDF file')
        }

        // Convert the file stream to a buffer
        const chunks = []
        for await (const chunk of file) {
          chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)
        
        // Parse the PDF buffer to text
        const pdfText = await parsePdfBuffer(buffer)
        
        // Summarize the text
        const summary = await summarizeText(pdfText)
        
        return h.response({
          success: true,
          filename: file.hapi.filename,
          summary
        })
      } catch (error) {
        logger.error(`Error processing document: ${error.message}`)
        return Boom.badImplementation(`Error processing document: ${error.message}`)
      }
    }
  }
]