import 'reflect-metadata'
import { createConnection } from 'typeorm'
import { Image } from './db/model/Image'
import fs from 'fs'
import fastify from 'fastify'
import multer from 'fastify-multer'
require('dotenv').config()

const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, PORT, HOST } = process.env
if (DB_HOST == null || DB_PORT == null || DB_USER == null || DB_PASS == null || DB_NAME == null || HOST == null) throw new Error('Missing Environment Variables!')

const DBPort = parseInt(DB_PORT)
const serverPort = parseInt(PORT ?? '42069')
const serverHost = fs.existsSync('/.dockerenv') ? '0.0.0.0' : 'localhost'

const server = fastify()
server.register(multer.contentParser)
server.register(require('./routes/upload'))
server.register(require('./routes/getfile'))

// Routes

server.get('/', (_, res) => {
  res.send('How did you find this?')
})

createConnection({
  type: 'mariadb',
  host: DB_HOST,
  port: DBPort,
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  entities: [
    Image
  ],
  synchronize: true,
  logging: true
}).then(() => {
  console.log('Database Ready!')
  server.listen(serverPort, serverHost)
    .then(() => {
      console.log(`Listening to port ${serverPort}`)
    }).catch(err => {
      console.error(err)
    })
})
