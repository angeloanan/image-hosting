import * as hashids from '../helper/hashids'

import type { FastifyPluginAsync, FastifyReply, FastifyRequest, preValidationHookHandler } from 'fastify'

import fileHandler from '../lib/multer'
import prisma from '../lib/prisma'

const fastifyUploadPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.post('/upload', { preValidation: handleAuth, preHandler: fileHandler.single('image') }, async (req, res) => {
    if (req.file.filename == null) return res.status(400).send('Malformed request')

    console.log('Got a file with filename', req.file.filename)

    try {
      const imageCount = await prisma.image.count()
      const urlpath = hashids.encode(imageCount + 1)
      await prisma.image.create({
        data: {
          urlpath,
          filename: req.file.filename
        }
      })

      res.status(200).send(`${process.env.HOST}/${urlpath}`)
    } catch (e) {
      res.status(500).send(e)
    }
  })
}

const handleAuth: preValidationHookHandler = (req: FastifyRequest, res: FastifyReply<any>, done) => {
  if (req.headers?.authorization !== process.env.AUTH) res.code(401).send('Unauthorized')
  done()
}

export default fastifyUploadPlugin
