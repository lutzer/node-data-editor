import { MemoryAdapter } from './dist/adapter'
import { DataSchema, DataType } from './dist/schema'
import { DataModel } from './src/model'
import { serveEditor } from './src/server'

const port = 3002

const schema : DataSchema = {
  title: 'test',
  properties: {
    id: { type: DataType.string },
    text: { type: DataType.string },
    number: { type: DataType.number },
    boolean: { type: DataType.boolean },
    array: { type: DataType.array },
    object: { type: DataType.object }
  },
  primaryKey: 'id'
}

const data = [
  { id: '0', text: 'lorem', number: 42, boolean: true, array: [1, 2, 3], object: { x: 5 } },
  { id: '1', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } }
]

serveEditor({
  models: [
    new DataModel({
      schema: schema,
      adapter: new MemoryAdapter(data, schema.primaryKey)
    })
  ],
  port: port,
  credentials: {
    login: 'admin',
    password: 'hallo'
  }
}).then(async () => {
  console.info('Server listening on port ' + port)
}).catch((err) => {
  console.log(err)
})
