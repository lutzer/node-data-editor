import { Adapter } from "./adapter"
import _ from 'lodash'
import { DataError, DataSchema, DataType, Validator } from "./schema"
import { keyEquals } from "./utils"

enum Operation {
  create, change, delete
}

class DataModel {

  adapter : Adapter
  validator : Validator

  private _changedDataEntries : { id: string, previousId? : string, op: Operation }[]
  private _data : object[]
  key : string

  constructor({schema, adapter, key = 'id'} : {schema : DataSchema, adapter : Adapter, key? : string}) {
    this.validator = new Validator(schema)
    this.adapter = adapter
    this.key = key
    this._data = []
    this._changedDataEntries = []

    if (!_.has(schema,`properties.${key}`)) {
      throw new Error(`schema does not contain a property with the specified primary key: ${key}`)
    }
  }

  get data() : object[] {
    return _.cloneDeep(this._data)
  }

  get schema() : DataSchema {
    return this.validator.schema
  }

  get(id : string) {
    return this._data.find((ele) => {
      return keyEquals(ele[this.key], id)
    })
  }

  create(data : object) : object {
    data = this.validator.test(data)
    this._data.push(data)
    this._changedDataEntries.push({id : data[this.key], op: Operation.create})
    return data
  }

  update(id : string, data : object) : object {
    const index = this._data.findIndex( (ele) => keyEquals(ele[this.key], id) )
    if (index < 0)
      throw new DataError('Entry cannot be updated, because it does not exist.')
    //merge data
    data = this.validator.test(Object.assign({}, this._data[index], data))
    this._data[index] = data
    this._changedDataEntries.push({id : this._data[index][this.key], previousId: id, op: Operation.change})
    return this._data[index]
  }

  delete(id : string) {
    this._data = this._data.filter( (ele) => !keyEquals(ele[this.key], id))
    this._changedDataEntries.push({id : id, op: Operation.delete})
  }

  async fetch(id : string = null) {
    if (id != null) {
      var entry = await this.adapter.read(id)
      this._data = entry ? [entry] : []
    } else
      this._data = await this.adapter.list()
  }

  async sync() {
    for (const entry of this._changedDataEntries) {
      if (entry.op == Operation.delete)
        await this.adapter.delete(entry.id)
      else if (entry.op == Operation.change)
        await this.adapter.update(entry.previousId, this.get(entry.id))
      else if (entry.op == Operation.create)
        await this.adapter.create(this.get(entry.id))
    }
    this._changedDataEntries = []
  }
}

export { DataModel }