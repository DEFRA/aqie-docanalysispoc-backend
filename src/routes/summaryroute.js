import { summarizeController } from '../services/controller/summarize.js'

// const summarize = [
//   {
//     method: 'GET',
//     path: '/summarize',
//     handler: summarizeController
//   }
// ]
// export { summarize }
const summarize = [
  {
    method: 'POST',
    path: '/summarize',
    handler: summarizeController,
    options: {
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 50 * 1024 * 1024, // 50MB limit
        allow: 'multipart/form-data'
      }
    }
  }
]
export { summarize }
