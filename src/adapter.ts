import axios from 'axios'
import { keyEquals } from './utils'
import { Credentials } from './router'
import _ from 'lodash'

abstract class Adapter {
  abstract async list() : Promise<object[]>
  abstract async read(id : string) : Promise<object | null>
  abstract async update(id: string, data : any) : Promise<void>
  abstract async delete(id : string) : Promise<void>
  abstract async create(data: any) : Promise<object>
}

class AdapterError extends Error {}

class RestAdapter extends Adapter {
  address : string
  options : any = {}

  constructor(address : string, auth? : Credentials) {
    super()
    this.address = address
    if (auth) {
      this.options.auth = { username: auth.login, password: auth.password }
    }
  }

  async list(): Promise<object[]> {
    const result = await axios.get(`${this.address}/`, this.options)
    return result.data
  }

  async read(id: string): Promise<object> {
    const result = await axios.get(`${this.address}/${id}`, this.options)
    return result.data
  }

  async update(id: string, data: any) {
    await axios.put(`${this.address}/${id}`, data, this.options)
  }

  async create(data: any) : Promise<object> {
    const result = await axios.post(`${this.address}/`, data, this.options)
    return result.data
  }

  async delete(id: string) {
    await axios.delete(`${this.address}/${id}`, this.options)
  }
}

class MemoryAdapter extends Adapter {
  data : object[]
  key : string

  constructor(data : object[], primaryKey : string = 'id') {
    super()
    this.data = _.cloneDeep(data)
    this.key = primaryKey
  }

  async list() : Promise<object[]> {
    return _.cloneDeep(this.data)
  }

  async read(id : string) : Promise<object|null> {
    const val = this.data.find((ele : any) => keyEquals(ele[this.key], id))
    return _.cloneDeep(val || null)
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

  async create(data: object) : Promise<object> {
    this.data.push(data)
    return _.cloneDeep(data)
  }

  async update(id : string, data : object) {
    this.data = this.data.map((ele : any) => keyEquals(ele[this.key], id) ? data : ele)
  }
}

export { Adapter, RestAdapter, MemoryAdapter, AdapterError }
