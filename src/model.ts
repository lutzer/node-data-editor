import { Adapter } from "./adapter"
import _ from 'lodash'

enum DataType {
  string = 'string', 
  number = 'number', 
  boolean = 'boolean', 
  object = 'object', 
  array = 'array'
}

enum Operation {
  create, change, delete
}

type DataSchema = { [id : string] : { 
  type : DataType
}}

class DataModel {

  schema : DataSchema
  adapter : Adapter

  private _changedDataEntries : { id: string, op: Operation }[]
  data : object[]
  key : string

  constructor({schema, adapter, key = 'id'} : {schema : DataSchema, adapter : Adapter, key? : string}) {
    this.schema = schema
    this.adapter = adapter
    this.key = key
    this.data = []
    this._changedDataEntries = []
  }

  get(id : string) {
    return this.data.find((ele) => {
      return _.isEqual(ele[this.key], id)
    })
  }

  set(id : string, data : object) {
    const index = this.data.findIndex( (ele) => _.isEqual(ele[this.key], id) )
    if (index >= 0) {
      this.data[index] = Object.assign({}, this.data[index], data)
      this._changedDataEntries.push({id : id, op: Operation.change})
    } else {
      this.data.push(data)
      this._changedDataEntries.push({id : data[this.key], op: Operation.create})
    }
  }

  delete(id : string) {
    this.data = this.data.filter( (ele) => !_.isEqual(ele[this.key], id))
    this._changedDataEntries.push({id : id, op: Operation.delete})
  }

  async fetch(id : string = null) {
    this.data = await this.adapter.list()
    this._changedDataEntries = []
  }

  async sync() {
    for (const entry of this._changedDataEntries) {
      if (entry.op == Operation.delete)
        await this.adapter.delete(entry.id)
      else if (entry.op == Operation.change)
        await this.adapter.update(entry.id, this.get(entry.id))
      else if (entry.op == Operation.create)
        await this.adapter.create(this.get(entry.id))
    }
  }

  

  // delete(id : string) {
  //   await this.adapter.delete(id)
  // }
}

export { DataModel, DataType }