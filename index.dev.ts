import { DataModel, DataType } from './src/model'
import { RestAdapter } from './src/adapter'
import { startServer } from './src/server'

const port = 3001

const adapter = new RestAdapter('/api/test')

const Book = new DataModel({
  id : { type : DataType.number },
  text : { type : DataType.string }
}, adapter)

startServer(port).then( (server) => {
  console.info("Server listening on port " + port )
})