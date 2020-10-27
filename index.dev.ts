import { MemoryAdapter } from './dist/adapter'
import { DataModel } from './src/model'
import { DataType } from './src/schema'
import { startEditor } from './src/server'

const port = 3002

startEditor({
  models: [
    new DataModel({ 
      schema: {
        title: 'test',
        properties: {
          id : { type : DataType.string },
          text : { type : DataType.string }
        }
      },
      adapter: new MemoryAdapter([ { id: 0, test: 'foo'}])
    })
  ],
  port : port,
  credentials : {
    login: 'admin',
    password: 'password'
  }
}).then( async (server) => {
  console.info("Server listening on port " + port )
}).catch( (err) => {
  console.log(err)
})