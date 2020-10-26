import { Adapter } from "./adapter"
import _ from 'lodash'
import { DataSchema, Validator } from "./schema"

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

  get(id : string) {
    return this._data.find((ele) => {
      return _.isEqual(ele[this.key], id)
    })
  }

  set(id : string, data : object) {
    data = this.validator.test(data)
    const index = this._data.findIndex( (ele) => _.isEqual(ele[this.key], id) )
    if (index >= 0) {
      this._data[index] = Object.assign({}, this._data[index], data)
      this._changedDataEntries.push({id : this._data[index][this.key], previousId: id, op: Operation.change})
    } else {
      this._data.push(data)
      this._changedDataEntries.push({id : data[this.key], op: Operation.create})
    }
  }

  delete(id : string) {
    this._data = this._data.filter( (ele) => !_.isEqual(ele[this.key], id))
    this._changedDataEntries.push({id : id, op: Operation.delete})
  }

  async fetch(id : string = null) {
    this._data = await this.adapter.list()
    this._changedDataEntries = []
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
  }
}

export { DataModel }