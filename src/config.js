import convict from 'convict'
import convictFormatWithValidator from 'convict-format-with-validator'
convict.addFormats(convictFormatWithValidator)

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

const config = convict({
  serviceVersion: {
    doc: 'The service version, this variable is injected into your docker container in CDP environments',
    format: String,
    nullable: true,
    default: null,
    env: 'SERVICE_VERSION'
  },
  host: {
    doc: 'The IP address to bind',
    format: 'ipaddress',
    default: '0.0.0.0',
    env: 'HOST'
  },
  port: {
    doc: 'The port to bind',
    format: 'port',
    default: 3001,
    env: 'PORT'
  },
  serviceName: {
    doc: 'Api Service Name',
    format: String,
    default: 'aqie-docanalysispoc-backend'
  },
  cdpEnvironment: {
    doc: 'The CDP environment the app is running in. With the addition of "local" for local development',
    format: [
      'local',
      'infra-dev',
      'management',
      'dev',
      'test',
      'perf-test',
      'ext-test',
      'prod'
    ],
    default: 'local',
    env: 'ENVIRONMENT'
  },
  log: {
    isEnabled: {
      doc: 'Is logging enabled',
      format: Boolean,
      default: !isTest,
      env: 'LOG_ENABLED'
    },
    level: {
      doc: 'Logging level',
      format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
      env: 'LOG_LEVEL'
    },
    format: {
      doc: 'Format to output logs in',
      format: ['ecs', 'pino-pretty'],
      default: isProduction ? 'ecs' : 'pino-pretty',
      env: 'LOG_FORMAT'
    },
    redact: {
      doc: 'Log paths to redact',
      format: Array,
      default: isProduction
        ? ['req.headers.authorization', 'req.headers.cookie', 'res.headers']
        : ['req', 'res', 'responseTime']
    }
  },
  httpProxy: {
    doc: 'HTTP Proxy URL',
    format: String,
    nullable: true,
    default: null,
    env: 'HTTP_PROXY'
  },
  isSecureContextEnabled: {
    doc: 'Enable Secure Context',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_SECURE_CONTEXT'
  },
  isMetricsEnabled: {
    doc: 'Enable metrics reporting',
    format: Boolean,
    default: isProduction,
    env: 'ENABLE_METRICS'
  },
  tracing: {
    header: {
      doc: 'CDP tracing header name',
      format: String,
      default: 'x-cdp-request-id',
      env: 'TRACING_HEADER'
    }
  },
  aws: {
    region: {
      doc: 'AWS region for S3 operations',
      format: String,
      default: 'eu-west-2',
      env: 'AWS_REGION'
    },
    s3BucketName: {
      doc: 'S3 bucket name for file uploads',
      format: String,
      default: 'dev-aqie-docanalysis-c63f2',
      env: 'AWS_S3_BUCKET_NAME'
    }
  },
  openai: {
    apiKey: {
      doc: 'OpenAI API Key',
      format: String,
      default: '',
      sensitive: true,
      env: 'OPEN_AI_KEY'
    },
    apiUrl: {
      doc: 'OpenAI API URL (Azure)',
      format: String,
      default: 'https://tradeplatform-ai.openai.azure.com/',
      env: 'AI_OPEN_API_URL'
    },
    model: {
      doc: 'OpenAI Model to use',
      format: String,
      default: 'gpt-4',
      env: 'OPENAI_MODEL'
    }
  },
  cors: {
    enabled: {
      doc: 'Enable CORS',
      format: Boolean,
      default: true,
      env: 'ENABLE_CORS'
    },
    origin: {
      doc: 'CORS allowed origins',
      format: Array,
      default: ['*'],
      env: 'CORS_ORIGIN'
    }
  }
})

config.validate({ allowed: 'strict' })

export { config }
