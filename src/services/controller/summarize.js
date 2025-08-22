import { summarizeText } from '../helper/summarizetext.js'

const summarizeController = async (request, h) => {
  const summarizeresult = await summarizeText(request)
  const allowOriginUrl = '*'
  return h
    .response({ message: 'success', summarizeresult })
    .code(200)
    .header('Access-Control-Allow-Origin', allowOriginUrl)
}

export { summarizeController }
