# node-data-editor
A customizable data editor for node, using JSON schema. By using custom Data Adapters, it can be connetced to a REST API or any other data provider.

## Usage

## basic exampe
```javascript
  const { serveEditor, DataModel, MemoryAdapter } = require('node-data-editor')

  serveEditor({
    models: [new DataModel({
      schema: {
        title: 'test',
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
          number: { type: 'number' }
        },
        primaryKey: 'id',
        required: ['text', 'number']
      },
      adapter: new MemoryAdapter([], 'id')
    })],
    port: 3000
  }).then( (server) => { console.log('Editor is available on localhost:3000')})
```

## Schema Description
```
  // Datatypes: 'string'|'number'|'boolean'|'object'|'array
  {
    title: string,
    properties: { [key : string] : {
      type : DataType
      default? : any
    }}
    primaryKey: string,
    required? : string[],
  }
```

### Schema Examples
```
{
  "title": "Book",
  "properties": {
    "id": {
      "type": "string"
    },
    "author": {
      "type": "string",
      "default" : "John Doe"
    },
    "title: {
      "type: "string",
      "default" : "untitled"
    }
  },
  "primaryKey: "id",
  "required": [
    "title"
  ]
}
```

# Development
* run `npm install`
* run `npm run dev` to start test server
* run `npm run build` to start a full production build

## Unit Tests
* run `npm run test`

## Frontend Development
* see /frontend/ dir
* run `cd frontend; npm start` to run frontend dev server

## Troubleshooting

* node-sass currently requires a node version < 15