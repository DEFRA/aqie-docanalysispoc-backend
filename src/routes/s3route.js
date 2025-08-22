import { getS3Controller } from '../services/controller/readS3data.js'

const getS3 = [
  {
    method: 'GET',
    path: '/getS3',
    handler: getS3Controller
  }
]

export { getS3 }
