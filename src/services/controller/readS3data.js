import { getS3 } from '../helper/getS3data.js'

const getS3Controller = async (request, h) => {
  const getS3result = await getS3(request)
  const allowOriginUrl = '*'
  return h
    .response({ message: 'success', getS3result })
    .code(200)
    .header('Access-Control-Allow-Origin', allowOriginUrl)
}

export { getS3Controller }
