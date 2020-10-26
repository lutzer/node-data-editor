import { DataModel } from './src/model'
import { RestAdapter } from './src/adapter'
import { DataType } from './src/schema'
import { startServer } from './src/server'

const port = 3001

startServer(port).then( async (server) => {
  console.info("Server listening on port " + port )

  const book = new DataModel({ 
    schema : {
      id : { type : DataType.number, required: true },
      text : { type : DataType.string, default: '' }
    }, 
    adapter: new RestAdapter('/api/test') 
  })

  try {
    await book.fetch()
  } catch (err) {
    console.log(err)
  }
})