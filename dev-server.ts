import * as DataEditor from './src/index'
// const DataEditor = require('./src/index')

const port = 3002

const model1 : { schema: DataEditor.DataSchema, data : object[] } = {
  schema: {
    $id: 'foo',
    properties: {
      id: { type: 'string' },
      text: { type: 'string', default: 'text' },
      number: { type: 'number', default: 0 },
      boolean: { type: 'boolean', default: false },
      array: { type: 'array', default: [1, 2, 3] },
      object: { type: 'object' }
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

const model2 : { schema: any, data : object[] } = {
  schema: {
    $id: 'bar',
    properties: {
      id: { type: 'string' },
      text: { type: 'string' },
      number: { type: 'number', maximum: 10, minimum: 0 },
      boolean: { type: 'boolean' },
      array: { type: 'array' },
      object: { type: 'object' }
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

DataEditor.start({
  models: [
    new DataEditor.DataModel({
      schema: model1.schema,
      adapter: new DataEditor.MemoryAdapter(model1.data, model1.schema.primaryKey)
    }),
    new DataEditor.DataModel({
      schema: model2.schema,
      adapter: new DataEditor.MemoryAdapter(model2.data, model2.schema.primaryKey)
    })
  ],
  port: port
  // credentials: {
  //   login: 'admin',
  //   password: 'hallo'
  // }
}).then(async () => {
  console.info('Server listening on port ' + port)
}).catch((err : any) => {
  console.log(err)
})
