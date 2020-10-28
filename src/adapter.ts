
import axios from 'axios'
import { keyEquals } from './utils'
import { Credentials } from './router'

abstract class Adapter {
  abstract async list() : Promise<object[]>
  abstract async read(id : string) : Promise<object | null>
  abstract async update(id: string, data : any) : Promise<void>
  abstract async delete(id : string) : Promise<void>
  abstract async create(data: any) : Promise<object>
}

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
    this.data = data
    this.key = primaryKey
  }

  async list() {
    return this.data
  }

  async read(id : string) {
    const val = this.data.find((ele : any) => keyEquals(ele[this.key], id))
    return val || null
  }

  async delete(id : string) {
    this.data = this.data.filter((ele : any) => !keyEquals(ele[this.key], id))
  }

  async create(data: object) {
    this.data.push(data)
    return data
  }

  async update(id : string, data : object) {
    this.data = this.data.map((ele : any) => keyEquals(ele[this.key], id) ? data : ele)
  }
}

export { Adapter, RestAdapter, MemoryAdapter }
