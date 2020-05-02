import { FastifyInstance } from 'fastify'
import multer from 'fastify-multer'
import mime from 'mime-types'
import crypto from 'crypto'

const diskStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'img/')
  },
  filename: (req, file, callback) => {
    const randomName = crypto.randomBytes(16).toString('hex')
    const extension = mime.extension(file.mimetype)

    if (extension === false) return callback(new Error('Unknown MIME type'))
    callback(null, `${randomName}.${extension}`)
  }
})
const img = multer({ storage: diskStorage })

module.exports = function (fastify: FastifyInstance, opts: void, done: VoidFunction): void {
  fastify.post('/upload', { preHandler: img.single('image') }, (req, res) => {
    console.log('Got a file with filename', req.file.filename)
    res.code(200).send('Accepted!')
  })
  done()
}
