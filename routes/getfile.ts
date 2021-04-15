import type { FastifyPluginAsync } from 'fastify'
import fs from 'fs'
import mime from 'mime-types'
import path from 'path'
import prisma from '../lib/prisma'

const headers = {
  'Accept-Ranges': 'none', // TODO: Support partial requests (HTTP 206)
  'Content-Disposition': 'inline'
}

const fastifyGetfilePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/:path', async (req, res) => {
    if (req.params.path !== 'string') res.code(404).send('Not found')
    if (req.params.path.length < 6) res.code(404).send('Not found') // Hashids minimum 8 chars

    const urlpath = req.params.path as string

    try {
      const { filename } = await prisma.image.findUnique({
        where: {
          urlpath
        },
        select: {
          filename: true
        },
        rejectOnNotFound: true
      })
      const pathToImg = path.join(__dirname, '..', 'img', filename)

      const stream = fs.createReadStream(pathToImg)
      const contentType = mime.lookup(filename) // Will return false if unknown
      const contentLength = fs.statSync(pathToImg, { bigint: true }).size.toString()

      if (contentType === false) return res.code(500).send('Unknown file type')

      return res.code(200)
        .headers(headers)
        .header('Content-Type', contentType)
        .header('Content-Length', contentLength)
        .header('Content-Range', `bytes */${contentLength}`)
        .send(stream)
    } catch (e) {
      return res.code(404).send('Not found')
    }
  })
}

export default fastifyGetfilePlugin
