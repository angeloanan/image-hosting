import { FastifyInstance } from 'fastify'
import multer from 'fastify-multer'
import mime from 'mime-types'
import crypto from 'crypto'
import hashids from 'hashids'
import { Image as ImageModel } from '../db/model/Image'
import { db } from '../db/api'

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

    const file = new ImageModel()
    file.filename = req.file.originalname

    db.then(connection => {
      connection.manager.save(file)
        .then(img => {
          console.log('Image ID is', img.id)
        })
        .catch(err => {
          console.error('Error saving Image to DB', err)
          res.code(500).send(`Error saving Image to Database. Error: ${err}`)
        })
    }).catch(err => {
      console.error('Failed initializing DB', err)
    })

    res.code(200).send('Accepted!')
  })
  done()
}
