import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import fs from 'fs'
import { createLogger } from '../common/helpers/logging/logger.js'

const logger = createLogger()

/**
 * Parse PDF file to text
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Array>} - Array of pages with content
 */
export async function parsePdfToJson(filePath) {
  try {
    const loader = new PDFLoader(filePath, { splitPages: true })
    const docs = await loader.load()

    const jsonPages = docs.map((doc, index) => ({
      pageNumber: index + 1,
      content: doc.pageContent
    }))

    return jsonPages
  } catch (error) {
    logger.error(`Error parsing PDF file: ${error.message}`)
    throw new Error(`Failed to parse PDF: ${error.message}`)
  }
}

/**
 * Parse PDF file to text and return as a single string
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - PDF content as a string
 */
export async function parsePdfToText(filePath) {
  try {
    const pages = await parsePdfToJson(filePath)
    return pages.map((page) => page.content).join('\n\n')
  } catch (error) {
    logger.error(`Error parsing PDF to text: ${error.message}`)
    throw new Error(`Failed to parse PDF to text: ${error.message}`)
  }
}

/**
 * Parse PDF buffer directly using langchain
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - PDF content as a string
 */
export async function parsePdfBuffer(buffer) {
  try {
    const tempFilePath = await saveTempFile(buffer)
    try {
      return await parsePdfToText(tempFilePath)
    } finally {
      await deleteTempFile(tempFilePath)
    }
  } catch (error) {
    logger.error(`Error parsing PDF buffer: ${error.message}`)
    throw new Error(`Failed to parse PDF buffer: ${error.message}`)
  }
}

/**
 * Save buffer to temporary file
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - Path to the temporary file
 */
export async function saveTempFile(buffer) {
  const tempDir = './temp'
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  const tempFilePath = `${tempDir}/${Date.now()}.pdf`
  await fs.promises.writeFile(tempFilePath, buffer)
  return tempFilePath
}

/**
 * Delete temporary file
 * @param {string} filePath - Path to the temporary file
 */
export async function deleteTempFile(filePath) {
  try {
    await fs.promises.unlink(filePath)
  } catch (error) {
    logger.error(`Error deleting temporary file: ${error.message}`)
  }
}
