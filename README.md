# node-data-editor
A customizable data editor for node, using JSON schema. By using custom Data Adapters, it can be connetced to a REST API or any other data provider.

## Usage

## basic exampe
```javascript
  const { serveEditor, DataModel, MemoryAdapter } = require('node-data-editor')

  serveEditor({
    models: [new DataModel({
      schema: {
        $id: 'Persons',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' }
          siblings: { type: 'array' },
          age: { type: 'number', default: 0 }
        },
        primaryKey: 'id',
        required: ['id']
      },
      adapter: new MemoryAdapter([], 'id')
    })],
    port: 3000
  }).then( (server) => { console.log('Editor is available on localhost:3000')})
```

## Schema Description
The Schma definitions follow [JSON Schema](https://json-schema.org/). It needs to contain a primaryKey property of a type string, itentified by the 'primaryKey' field. The Editor currently does not support nested properties, just the base Datatypes.
```
  // Datatypes can be: 'string','number','boolean','object' or 'array
  {
    $id: string,
    properties: { [key : string] : {
      type : DataType
      default? : any
    }}
    primaryKey: string,
    required? : string[],
  }
```

### Schema Example
```
{
  "$id": "Book",
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