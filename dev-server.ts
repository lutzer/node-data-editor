import { MemoryAdapter } from './src/adapter'
import { DataSchema, DataType } from './src/schema'
import { DataModel } from './src/model'
import { startDataEditor } from './src/server'

const port = 3002

const model1 : { schema: DataSchema, data : object[] } = {
  schema: {
    id: 'foo',
    properties: {
      id: { type: DataType.string },
      text: { type: DataType.string, default: 'text' },
      number: { type: DataType.number, default: 0 },
      boolean: { type: DataType.boolean, default: false },
      array: { type: DataType.array, default: [1, 2, 3] },
      object: { type: DataType.object }
    },
    primaryKey: 'id',
    required: ['text']
  },
  data: [
    { id: '0', text: 'lorem', number: 42, boolean: true, array: [1, 2, 3], object: { x: 5 } },
    { id: '1', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
    { id: '2', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
    { id: '3', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } }
  ]
}

const model2 : { schema: DataSchema, data : object[] } = {
  schema: {
    id: 'bar',
    properties: {
      id: { type: DataType.string },
      text: { type: DataType.string },
      number: { type: DataType.number, maximum: 10, minimum: 0 },
      boolean: { type: DataType.boolean },
      array: { type: DataType.array },
      object: { type: DataType.object }
    },
    primaryKey: 'id',
    required: ['text', 'number']
  },
  data: [
    { id: '0', text: 'lorem', number: 42, boolean: true, array: [1, 2, 3], object: { x: 5 } },
    { id: '1', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
    { id: '2', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } },
    { id: '3', text: 'lorem ipsum', number: 43, boolean: false, array: [4, 5, 6], object: { x: 10 } }
  ]
}

startDataEditor({
  models: [
    new DataModel({
      schema: model1.schema,
      adapter: new MemoryAdapter(model1.data, model1.schema.primaryKey)
    }),
    new DataModel({
      schema: model2.schema,
      adapter: new MemoryAdapter(model2.data, model2.schema.primaryKey)
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