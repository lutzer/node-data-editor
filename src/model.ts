import { Adapter } from "./adapter"

enum DataType {
  string = 'string', 
  number = 'number', 
  boolean = 'boolean', 
  object = 'object', 
  array = 'array'
}

type DataSchema = { [id : string] : { 
  type : DataType
}}

class DataModel {

  schema : DataSchema
  adapter : Adapter

  data : []

  constructor(schema : DataSchema, adapter : Adapter) {
    this.schema = schema
    this.adapter = adapter
    this.data = []
  }

  async read() {
    this.data = await this.adapter.read()
  }

  async delete(id : string) {
    await this.adapter.delete(id)
  }
}

export { DataModel, DataType }