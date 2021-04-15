import 'reflect-metadata'
import 'dotenv/config'

import { File, FilesObject } from 'fastify-multer/src/interfaces'

import fastify from 'fastify'
import multer from 'fastify-multer'

type FilesInRequest = FilesObject | Partial<File>[]

declare module 'fastify' {
  export interface FastifyRequest {
    file: File
    files: FilesInRequest
  }
}

const server = fastify()
server.register(multer.contentParser)
server.register(require('./routes/upload'))
server.register(require('./routes/getfile'))
server.register(require('fastify-favicon'), { path: './static/' })

// Routes

server.get('/', (_, res) => {
  res.send('How did you find this?')
})

server.get('/health', (_, res) => {
  res.code(200).send('OK')
})
