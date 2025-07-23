import { summarizeController } from '../services/controller/summarize.js'

const summarize = [
  {
    method: 'GET',
    path: '/summarize',
    handler: summarizeController
  }
]
export { summarize }
// const summarize = [
//   {
//     method: 'GET',
//     path: '/summarize',
//     options: {
//       cors: {
//         origin: ['*'],
//         additionalHeaders: ['content-type', 'x-requested-with'],
//         credentials: true
//       }
//     },
//     handler: async (request, h) => {
//       return h.response({
//         success: true, summarizeController,
//         message: 'CORS test successful'
//       })
//     }
//     },
// ]
// export { summarize }
