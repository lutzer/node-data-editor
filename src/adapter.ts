import { DataModel } from "./model";
import axios from 'axios';
import { keyEquals } from "./utils";


abstract class Adapter {

  abstract async list() : Promise<object[]>
  abstract async read(id : string) : Promise<object>
  abstract async update(id: string, data : any) : Promise<void>
  abstract async delete(id : string) : Promise<void>
  abstract async create(data: any) : Promise<object>
}

class RestAdapter extends Adapter {

  address : string

  constructor(address : string) {
    super()
    this.address = address
  }

  async list(): Promise<object[]> {
    const result = await axios.get(`${this.address}/`)
    return result.data
  }

  async read(id: string): Promise<object> {
    const result = await axios.get(`${this.address}/${id}`)
    return result.data
  }

  async update(id: string, data: any) {
    await axios.put(`${this.address}/${id}`, data)
  }

  async create(data: any) : Promise<object> {
    const result = await axios.post(`${this.address}/`, data)
    return result.data
  }

  async delete(id: string) {
    await axios.delete(`${this.address}/${id}`)
  }
}

class MemoryAdapter extends Adapter {

  data : object[]
  key : string

  constructor(data : object[], key : string = 'id') {
    super()
    this.data = data
    this.key = key
  }

  async list() {
    return this.data
  }

  async read(id) {
    return this.data.find( (ele) => keyEquals(ele[this.key], id) )
  }

  async delete(id) {
    this.data = this.data.filter( (ele) => !keyEquals(ele[this.key], id))
  }

  async create(data) {
    this.data.push(data)
    return data;
  }

  async update(id, data) {
    this.data = this.data.map( (ele) => keyEquals(ele[this.key], id) ? data : ele )
  }
}

export { Adapter, RestAdapter, MemoryAdapter }