import { randomUUID } from 'node:crypto'
import { basename, extname } from 'node:path'
import { Readable } from 'node:stream'
import { z } from 'zod'
import { r2 } from './client-r2'

import { URL } from 'node:url'
import { env } from '@/env'
import { Upload } from '@aws-sdk/lib-storage'

const uploadFileToStorageInput = z.object({
  folder: z.enum(['images', 'downloads']),
  fileName: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
})

type UploadFileToStorageInput = z.input<typeof uploadFileToStorageInput>

export async function uploadFileToStorage(input: UploadFileToStorageInput) {
  const { folder, fileName, contentStream, contentType } =
    uploadFileToStorageInput.parse(input)

  const fileExtension = extname(fileName)
  const fileNameWithoutExt = basename(fileName)

  const sanitizedFileName = fileNameWithoutExt.replaceAll(/[^a-zA-Z0-9]/g, '')

  const uniqueFileName = `${folder}/${randomUUID()}-${sanitizedFileName}${fileExtension}`

  const upload = await new Upload({
    client: r2,
    params: {
      Key: uniqueFileName,
      Bucket: env.CF_BUCKET,
      Body: contentStream,
      ContentType: contentType,
    },
  }).done()

  return {
    key: uniqueFileName,
    url: new URL(uniqueFileName, env.CF_PUBLIC_URL).toString(),
  }
}
