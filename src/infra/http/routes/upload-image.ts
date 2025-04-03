import { uploadImage } from '@/app/functions/upload-image'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isLeft, isRight, unwrapEither } from '@/infra/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/uploads',
    {
      schema: {
        summary: 'Upload an image',
        consumes: ['multipart/form-data'],
        tags: ['uploads'],
        response: {
          201: z.object({
            url: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
          409: z.object({
            message: z.string().describe('Upload already exists'),
          }),
        },
      },
    },
    async (request, reply) => {
      const uploadedFile = await request.file({
        limits: {
          fileSize: 1024 * 1024 * 2, //2mb
        },
      })

      if (!uploadedFile) {
        return reply.status(400).send({
          message: 'File is required senhor',
        })
      }

      const result = await uploadImage({
        contentStream: uploadedFile.file,
        fileName: uploadedFile.filename,
        contentType: uploadedFile.mimetype,
      })

      if (uploadedFile.file.truncated) {
        return reply.status(400).send({
          message: 'File size limit reached',
        })
      }

      if (isRight(result)) {
        const unwrapedResult = unwrapEither(result)

        return reply.status(201).send(unwrapedResult)
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'InvalidFileFormat':
          return reply.status(400).send({ message: error.message })
      }

      // if (isLeft(result)) {
      //   return reply.status(400).send({
      //     message: result.left.message,
      //   })
      // }

      // const r = await db.insert(schema.uploads).values({
      //   name: 'teste.pdf'        ,
      //   remoteKey: '/teste4.pdf',
      //   remoteUrl: 'htt://adsdada.com',
      //   https://pub-8c60be533efd4103a5c4a224efe00cfe.r2.dev
      // })
    }
  )
}
