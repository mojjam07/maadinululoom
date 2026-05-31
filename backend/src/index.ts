import { createServer } from './server.js'

const port = process.env.PORT ? Number(process.env.PORT) : 3001


createServer().listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`maadin-backend listening on port ${port}`)
})
