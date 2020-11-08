import { Adapter } from './adapter'
import { DataSchema, Validator } from './schema'
import { keyEquals } from './utils'

enum Operation {
  create, change, delete
}

class ModelError extends Error {}

class DataModel {
  adapter : Adapter
  validator : Validator

  private _changedDataEntries : { id: string, previousId? : string, op: Operation }[]
  private _data : any[]

  constructor({ schema, adapter } : { schema : DataSchema, adapter : Adapter, key? : string }) {
    this.validator = new Validator(schema)
    this.adapter = adapter
    this._data = []
    this._changedDataEntries = []
  }

  get data() : any[] {
    return this._data
  }

  get schema() : DataSchema {
    return this.validator.schema
  }

  get(id : string) {
    return this._data.find((ele : any) => {
      return keyEquals(ele[this.schema.primaryKey], id)
    })
  }

  create(data : any) : Promise<object> {
    data = this.validator.test(data)
    this._data.push(data)
    this._changedDataEntries.push({ id: data[this.schema.primaryKey], op: Operation.create })
    return data
  }

  update(id : string, data : any) : Promise<object> {
    const index = this._data.findIndex((ele : any) => keyEquals(ele[this.schema.primaryKey], id))
    if (index < 0) {
      throw new ModelError('Entry cannot be updated, because it does not exist.')
    }
    // merge data
    data = this.validator.test(Object.assign({}, this._data[index], data))
    this._data[index] = data
    this._changedDataEntries.push({ id: this._data[index][this.schema.primaryKey], previousId: id, op: Operation.change })
    return this._data[index]
  }

  delete(id : string) {
    this._data = this._data.filter((ele) => !keyEquals(ele[this.schema.primaryKey], id))
    this._changedDataEntries.push({ id: id, op: Operation.delete })
  }

  async fetch(id? : string) {
    if (id != null) {
      var entry = await this.adapter.read(id)
      this._data = entry ? [entry] : []
    } else {
      this._data = await this.adapter.list()
    }
  }

  async sync() {
    for (const entry of this._changedDataEntries) {
      if (entry.op === Operation.delete) {
        await this.adapter.delete(entry.id)
      } else if (entry.op === Operation.change && entry.previousId) {
        await this.adapter.update(entry.previousId, this.get(entry.id))
      } else if (entry.op === Operation.create) {
        await this.adapter.create(this.get(entry.id))
      }
    }
    this._changedDataEntries = []
  }
}

export { DataModel }
