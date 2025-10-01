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
    handler: summarizeController
  }
]
export { summarize }
