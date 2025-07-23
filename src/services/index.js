import { summarizeController } from './controller/summarize.js'

const summarize1 = {
  plugin: {
    name: 'summarize',
    register: (server) => {
      server.route([
        {
          method: 'GET',
          path: 'api/documents/text',
          ...summarizeController
        }
      ])
    }
  }
}
export { summarize1 }
