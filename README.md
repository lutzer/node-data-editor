# node-data-editor
A customizable data editor for node, using JSON schema. By using custom Data Adapters, it can be connetced to a REST API or any other data provider.

![interface](docs/interface.png)

## Install
```
npm install node-data-editor
```

## Usage

### Import

```
import * as DataEditor from './src/index'
or
const DataEditor = require('./src/index')
```

### basic example
```javascript
  import * as DataEditor from 'node-data-editor'

  DataEditor.start({
    models: [new DataEditor.DataModel({
      schema: {
        $id: 'Persons',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' }
          siblings: { type: 'array' },
          married: { type: 'boolean' },
          age: { type: 'number', default: 0 }
        },
        primaryKey: 'id',
        required: ['id']
      },
      adapter: new DataEditor.MemoryAdapter([], 'id')
    })],
    port: 3000
  }).then( (server) => { console.log('Editor is available on localhost:3000')})
```

### Schema Description
The Schma definitions follow [JSON Schema](https://json-schema.org/). It needs to contain a primaryKey property of a type string, itentified by the 'primaryKey' field. The Editor currently does not support nested properties, just the base Datatypes. It will validate nested properties though.
```typescript
  // type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'
  {
    $id: string,
    properties: { [key : string] : {
      type : DataType
      default? : any
    }}
    primaryKey: string,
    required? : string[],
    titleTemplate? : string
  }
```


#### Schema Example
```javascript
var schema = {
  "$id": "Book",
  "properties": {
    "id": {
      "type": "string"
    },
    "author": {
      "type": "string",
      "default" : "John Doe"
    },
    "title": {
      "type": "string",
      "default" : "untitled"
    }
  },
  "primaryKey": "id",
  "required": [ "title" ]
}
```
#### Custom Title for data entry
By Defining titleTemplate You can display a custom title for each data entry in the data model using [lodash templates](https://lodash.com/docs/4.17.15#template).
```javascript
// example using titleTemplate
var schema = {
  $id: 'projects',
  properties: {
    id : { type: 'string' },
    name : { type: 'string' }
  },
  primaryKey: 'id',
  required : ['name', 'description', 'password'],
  titleTemplate: '${name}:${id}'
}
```

### Data Adapter
The connection to a dataset/database works through the Adapter Interface. There are two implementations:

#### RestAdapter
```javascript
  // connects to a standard REST api, using these endpoints: GET '/', GET '/:id', PUT '/:id', POST '/', DELETE '/:id'
  const adapter = new RestAdapter(apiAddress)
```

#### MemoryAdapter
```javascript
  // saves data in an array. does not persist data. first argument is the initial data array, second argument is the primary Key of the entries.
  const adapter = new MemoryAdapter([], 'id')
```

#### Custom Adapter
The custom adapter needs to implement 5 Methods. See [src/adapter.ts](src/adapter.ts) MemoryAdapter or RestAdapter for example implementations. 'id' is the defined primaryKey of the schema.
```javascript
  class CustomAdapter implements DataEditor.Adapter {
    list(): Promise<object[]> {
      // list all data entries of this resource
    }
    read(id: string): Promise<object> {
      // list one entry with the specified id
    }
    update(id: string, data: any): Promise<void> {
      // updates a single entry, specified by id
    }
    delete(id: string): Promise<void> {
      // deletes the specified entry
    }
    create(data: any): Promise<object> {
      // creates a new entry
    }
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