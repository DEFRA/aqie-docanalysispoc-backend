import Boom from '@hapi/boom'

// Example data (in-memory instead of MongoDB)
const exampleData = [
  { exampleId: '1', name: 'Example 1', value: 'Value 1' },
  { exampleId: '2', name: 'Example 2', value: 'Value 2' },
  { exampleId: '3', name: 'Example 3', value: 'Value 3' }
]

const example = [
  {
    method: 'GET',
    path: '/',
    options: {
      cors: {
        origin: ['*'],
        additionalHeaders: ['content-type', 'x-requested-with'],
        credentials: true
      }
    },
    handler: async (request, h) => {
      return h.response({ message: 'Backend API is running' })
    }
  },
  {
    method: 'GET',
    path: '/example',
    handler: async (request, h) => {
      return h.response({ message: 'success', entities: exampleData })
    }
  },
  {
    method: 'GET',
    path: '/example/{exampleId}',
    handler: async (request, h) => {
      const entity = exampleData.find(
        (item) => item.exampleId === request.params.exampleId
      )

      if (!entity) {
        return Boom.notFound()
      }

      return h.response({ message: 'success', entity })
    }
  }
]

export { example }
