import fastify from 'fastify'
import multer from 'fastify-multer'
require('dotenv').config()

const server = fastify()
server.register(multer.contentParser)
// eslint-disable-next-line @typescript-eslint/no-var-requires
server.register(require('./routes/upload'))

// Routes

server.get('/', (_, res) => {
  res.send('How did you find this?')
})

server.get('/:id', (req, res) => {
  const id: string = req.params.id

  res.code(200)
  res.send(`Your ID is: ${id}`)
})

const port = parseInt(process.env.PORT ?? '8080')
server.listen(port)
  .then(res => {
    console.log(`Listening to port ${port}`)
  }).catch(err => {
    console.error(err)
  })
