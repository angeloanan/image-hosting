import { FastifyInstance } from 'fastify'
import multer from 'fastify-multer'
import mime from 'mime-types'
import crypto from 'crypto'
import * as hashids from '../hashids'
import { Image as ImageModel } from '../db/model/Image'
import { getRepository } from 'typeorm'
require('dotenv').config()

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

    const imageRepo = getRepository(ImageModel)
    const image = new ImageModel()
    image.filename = req.file.filename!

    imageRepo.save(image)
      .then(img => {
        const hashedID = hashids.encode(img.id)
        imageRepo.update({ id: img.id }, { urlpath: hashedID })

        res.code(200).send(`${process.env.HOST}/${hashedID}`)
      })
      .catch(err => {
        res.code(500).send('DB Error' + err)
      })
  })
  done()
}
