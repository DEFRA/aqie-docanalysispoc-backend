// import { summarizeText } from '~/src/services/controller/summarize.js'
// import { summarizeText } from '../helper/summarizetext.js'

// const summarizeController = {
//   handler: async (request, h) => {
//     const getOSPlaces = await summarizeText(request)
//     const allowOriginUrl = '*'
//     return h
//       .response({ message: 'success', getOSPlaces })
//       .code(200)
//       .header('Access-Control-Allow-Origin', allowOriginUrl)
//   }
// }
// export { summarizeController }

// summarize.js
import { summarizeText } from '../helper/summarizetext.js'

const summarizeController = async (request, h) => {
  const getOSPlaces = await summarizeText(request)
  const allowOriginUrl = '*'
  return h
    .response({ message: 'success', getOSPlaces })
    .code(200)
    .header('Access-Control-Allow-Origin', allowOriginUrl)
}

export { summarizeController }
