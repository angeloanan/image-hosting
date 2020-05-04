import { FastifyInstance } from 'fastify'
import { getRepository } from 'typeorm'
import { Image } from '../db/model/Image'
import fs from 'fs'
import path from 'path'
import mime from 'mime-types'

const headers = {
  'Accept-Ranges': 'none', // TODO: Support partial requests (HTTP 206)
  'Content-Disposition': 'inline'
}

module.exports = function (fastify: FastifyInstance, opts: void, done: VoidFunction): void {
  fastify.get('/:path', async (req, res) => {
    if (req.params.path == null) res.code(404).send('Not found')
    if (req.params.path.length < 6) res.code(404).send('Not found') // Hashids minimum 8 chars

    const urlpath: string = req.params.path
    const imageRepo = getRepository(Image)
    imageRepo.findOneOrFail({ urlpath: urlpath })
      .then(img => {
        const filename = img.filename
        const pathToImg = path.join(__dirname, '..', 'img', filename)

        const stream = fs.createReadStream(pathToImg)
        const contentType = mime.lookup(filename) // Will return false if unknown
        const contentLength = fs.statSync(pathToImg, { bigint: true }).size.toString()

        if (contentType === false) return res.code(500).send('Unknown file type')

        res.code(200)
          .headers(headers)
          .header('Content-Type', contentType)
          .header('Content-Length', contentLength)
          .header('Content-Range', `bytes */${contentLength}`)
          .send(stream)
      }).catch(() => {
        res.code(404).send('Not found')
      })
  })
  done()
}
