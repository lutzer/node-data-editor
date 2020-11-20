import axios, { AxiosRequestConfig } from 'axios'
import { keyEquals } from './utils'
import _ from 'lodash'
import fs from 'fs/promises'

abstract class Adapter {
  abstract async list() : Promise<any[]>
  abstract async read(id : string) : Promise<any|undefined>
  abstract async update(id: string, data : any) : Promise<void>
  abstract async delete(id : string) : Promise<void>
  abstract async create(data: any) : Promise<any>
}

class AdapterError extends Error {}

class FileAdapter extends Adapter {
  path : string
  primarykey : string
  initialData : any[]

  constructor(filePath: string, primaryKey : string, initialData : any[] = []) {
    super()
    this.path = filePath
    this.primarykey = primaryKey
    this.initialData = initialData
  }

  async list(): Promise<any[]> {
    try {
      const data = await fs.readFile(this.path, 'utf-8')
      const entries = JSON.parse(data)
      return _.isArray(entries) ? entries : [entries]
    } catch (err) {
      return this.initialData
    }
  }

  async read(id: string): Promise<any|undefined> {
    const entries = await this.list()
    return entries.find((ele) => _.has(ele, this.primarykey) && ele[this.primarykey] === id)
  }

  async update(id: string, data: any): Promise<void> {
    const entries = await this.list()
    const index = entries.findIndex((ele) => _.has(ele, this.primarykey) && ele[this.primarykey] === id)
    if (index < 0) {
      throw new AdapterError(`entry with key ${id} does not exist`)
    }
    entries[index] = Object.assign({}, entries[index], data)
    await fs.writeFile(this.path, JSON.stringify(entries), 'utf-8')
  }

  async delete(id: string): Promise<void> {
    const entries = await this.list()
    const newEntries = entries.filter((ele) => ele[this.primarykey] !== id)
    if (entries.length === newEntries.length) {
      throw new AdapterError(`entry with key ${id} does not exist`)
    }
    await fs.writeFile(this.path, JSON.stringify(newEntries), 'utf-8')
  }

  async create(data: any): Promise<any> {
    const entries = await this.list()
    entries.push(data)
    await fs.writeFile(this.path, JSON.stringify(entries), 'utf-8')
  }
}

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

  async update(id: string, data: any) {
    await axios.put(`${this.address}/${id}`, data, this.options)
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

  constructor(data : any[], primaryKey : string = 'id') {
    super()
    this.data = _.cloneDeep(data)
    this.key = primaryKey
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

  async create(data: object) : Promise<object> {
    this.data.push(data)
    return _.cloneDeep(data)
  }

  async update(id : string, data : object) {
    this.data = this.data.map((ele : any) => keyEquals(ele[this.key], id) ? data : ele)
  }
}

export { Adapter, RestAdapter, MemoryAdapter, FileAdapter, AdapterError }
