import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import multer from 'fastify-multer'
import mime from 'mime-types'
import crypto from 'crypto'
import * as hashids from '../helper/hashids'
import { Image as ImageModel } from '../db/model/Image'
import { getRepository } from 'typeorm'
import imagemin from 'imagemin'
import imageminWebp from 'imagemin-webp'
require('dotenv').config()

const imageminOpts: imagemin.Options = {
  destination: 'img/',
  plugins: [
    imageminWebp({
      quality: 75,
      method: 6,
      autoFilter: true
    })
  ]
}

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
const fileHandler = multer({ storage: diskStorage })

module.exports = function (fastify: FastifyInstance, _:any, done: VoidFunction): void {
  fastify.post('/upload', { preValidation: [handleAuth], preHandler: fileHandler.single('image') }, async (req, res) => {
    console.log('Got a file with filename', req.file.filename)

    const imageRepo = getRepository(ImageModel)
    const image = new ImageModel()
    image.filename = req.file.filename!

    imagemin([`img/${image.filename}`], imageminOpts)
      .then(compressedImg => console.log(`Image ${image.filename} has been encoded to WebP.\n ${compressedImg[0].destinationPath}`))

    imageRepo.save(image) // Save image in database, after successful, send message
      .then(DBImage => {
        const hashedID = hashids.encode(DBImage.id)
        imageRepo.update({ id: DBImage.id }, { urlpath: hashedID })

        res.code(200).send(`${process.env.HOST}/${hashedID}`)
      })
      .catch(err => {
        res.code(500).send('DB Error' + err)
      })
  })
  done()
}

function handleAuth (req: FastifyRequest, res: FastifyReply<any>, done: VoidFunction) {
  if (req.headers?.authorization !== process.env.AUTH) res.code(401).send('Unauthorized')
  done()
}
