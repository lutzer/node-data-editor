import { MemoryAdapter } from './dist/adapter'
import { DataSchema, DataType } from './dist/schema'
import { DataModel } from './src/model'
import { serveEditor } from './src/server'

const port = 3002

const schema : DataSchema = {
  title: 'test',
  properties: {
    id: { type: DataType.string },
    text: { type: DataType.string, default: 'text' },
    number: { type: DataType.number, default: 0 },
    boolean: { type: DataType.boolean, default: false },
    array: { type: DataType.array, default: [1, 2, 3] },
    object: { type: DataType.object }
  },
  primaryKey: 'id'
}

const data = [
  { id: '0', text: 'lorem', number: 42, boolean: true, array: [1, 2, 3], object: { x: 5 } },
  { id: '1', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '2', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '3', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '4', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '5', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '6', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '7', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '8', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '9', text: 'lorem', number: 42, boolean: true, array: [1, 2, 3], object: { x: 5 } },
  { id: '11', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '12', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '13', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '14', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '15', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '16', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '17', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '18', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '20', text: 'lorem', number: 42, boolean: true, array: [1, 2, 3], object: { x: 5 } },
  { id: '21', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '22', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '23', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '24', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '25', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '26', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '27', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
  { id: '28', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } }
]

serveEditor({
  models: [
    new DataModel({
      schema: schema,
      adapter: new MemoryAdapter(data, schema.primaryKey)
    })
  ],
  port: port
  // credentials: {
  //   login: 'admin',
  //   password: 'hallo'
  // }
}).then(async () => {
  console.info('Server listening on port ' + port)
}).catch((err) => {
  console.log(err)
})
