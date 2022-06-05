import axios, { AxiosRequestConfig } from 'axios'
import { keyEquals } from './utils'
import { v4 as uuidv4 } from 'uuid'
import _ from 'lodash'
import { DataSchema } from './types'

abstract class Adapter {
  abstract list(schema: DataSchema) : Promise<any[]>
  abstract read(id : string, schema: DataSchema) : Promise<any|undefined>
  abstract update(id: string, data : any, schema: DataSchema) : Promise<any>
  abstract delete(id : string, schema: DataSchema) : Promise<void>
  abstract create(data: any, schema: DataSchema) : Promise<any>
}

class AdapterError extends Error {}

class RestAdapter extends Adapter {
  address : string
  options : any = {}

  constructor(address : string, options? : AxiosRequestConfig) {
    super()
    this.address = address
    this.options = options
  }

  async list(): Promise<any[]> {
    const result = await axios.get(`${this.address}/`, this.options)
    return result.data
  }

  async read(id: string): Promise<any|undefined> {
    const result = await axios.get(`${this.address}/${id}`, this.options)
    return result.data
  }

  async update(id: string, data: any) : Promise<any> {
    await axios.put(`${this.address}/${id}`, data, this.options)
    return data
  }

  async create(data: any) : Promise<any> {
    const result = await axios.post(`${this.address}/`, data, this.options)
    return result.data
  }

  async delete(id: string) {
    await axios.delete(`${this.address}/${id}`, this.options)
  }
}

class MemoryAdapter extends Adapter {
  data : any[]
  key : string
  autoIncrement: boolean

  constructor(data : any[], primaryKey : string = 'id', autoIncrement : boolean = false) {
    super()
    this.data = _.cloneDeep(data)
    this.key = primaryKey
    this.autoIncrement = autoIncrement
  }

  async list() : Promise<any[]> {
    return _.cloneDeep(this.data)
  }

  async read(id : string) : Promise<any|undefined> {
    const val = this.data.find((ele : any) => keyEquals(ele[this.key], id))
    return _.cloneDeep(val)
  }

  async delete(id : string) {
    const includes = this.data.find((ele : any) => {
      return keyEquals(ele[this.key], id)
    }) !== undefined
    if (!includes) {
      throw new AdapterError(`Entry ${id} does not exist.`)
    }
    this.data = this.data.filter((ele : any) => !keyEquals(ele[this.key], id))
  }

  async create(data: any) : Promise<any> {
    if (this.autoIncrement) {
      data[this.key] = uuidv4()
    }
    this.data.push(data)
    return _.cloneDeep(data)
  }

  async update(id : string, data : any) : Promise<any> {
    this.data = this.data.map((ele : any) => keyEquals(ele[this.key], id) ? data : ele)
    return this.data
  }
}

export { Adapter, RestAdapter, MemoryAdapter, AdapterError }
