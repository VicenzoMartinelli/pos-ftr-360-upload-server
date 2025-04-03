import { env } from '@/env'
import { fastifyCors } from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { exportUploadsRoute } from './routes/export-uploads'
import { getUploadsRoute } from './routes/get-uploads'
import { uploadImageRoute } from './routes/upload-image'
import { transformSwaggerSchema } from './transform-swagger-schema'

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)
server.setErrorHandler((err, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(err)) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: err.validation,
    })
  }

  // Envia o erro p/ alguma ferramenta de observabilidade (Sentry, Datadog, Grafana, Otel)
  console.log(err)
  return reply.status(500).send({
    message: 'Internal server error',
  })
})
server.register(fastifyMultipart)
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Upload Server',
      version: '1.0.0',
    },
  },
  transform: transformSwaggerSchema,
})
server.register(fastifySwaggerUi, {
  routePrefix: 'swagger',
})
server.register(fastifyCors, { origin: '*' })
server.register(uploadImageRoute)
server.register(getUploadsRoute)
server.register(exportUploadsRoute)

server
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('running')
  })
