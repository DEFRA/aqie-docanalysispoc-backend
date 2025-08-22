import { health } from '../routes/health.js'
import { example } from '../routes/example.js'
import { documents } from '../routes/documents.js'
import { summarize } from '../routes/summaryroute.js'
import { getS3 } from '../routes/s3route.js'

const router = {
  plugin: {
    name: 'router',
    register: (server, _options) => {
      server.route([health].concat(example, documents, summarize, getS3))
    }
  }
}

export { router }
