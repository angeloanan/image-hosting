import { createConnection } from 'typeorm'
import { Image } from './model/Image'
require('dotenv').config()

const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = process.env
if (DB_HOST === undefined || DB_PORT === undefined || DB_USER === undefined || DB_PASS === undefined || DB_NAME === undefined) throw new Error('Missing DB Credentials!')

const port = parseInt(DB_PORT) ?? 8080

export const db = createConnection({
  type: 'mariadb',
  host: DB_HOST,
  port: port,
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  entities: [
    Image
  ],
  synchronize: true,
  logging: true
})
