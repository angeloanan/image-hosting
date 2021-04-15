import fastifyMulter, { diskStorage } from 'fastify-multer'

import crypto from 'crypto'
import mime from 'mime-types'

const multerDiskStorage = diskStorage({
  destination: 'img/',
  filename: (_, file, callback) => {
    const randomName = crypto.randomBytes(16).toString('hex')
    const extension = mime.extension(file.mimetype)

    if (extension === false) return callback(new Error('Unknown MIME type'))
    callback(null, `${randomName}.${extension}`)
  }
})

const fileHandler = fastifyMulter({ storage: multerDiskStorage })

export default fileHandler
