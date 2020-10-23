import { DataModel, DataType } from './src/model'
import { RestAdapter } from './src/adapter'
import { startServer } from './src/server'

const port = 3001

startServer(port).then( async (server) => {
  console.info("Server listening on port " + port )

  const book = new DataModel({
    id : { type : DataType.number },
    text : { type : DataType.string }
  }, new RestAdapter('/api/test'))

  try {
    await book.fetch()
  } catch (err) {
    console.log(err)
  }
})