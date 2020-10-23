import { DataModel } from "./model";
import axios from 'axios';


abstract class Adapter {

  abstract async list() : Promise<any>
  abstract async read(id : string) : Promise<any>
  abstract async update(id: string, data : any) : Promise<void>
  abstract async delete(id : string) : Promise<void>
  abstract async create(data: any) : Promise<any>
}

class RestAdapter extends Adapter {

  address : string

  constructor(address : string) {
    super()
    this.address = address
  }

  async list(): Promise<any> {
    const result = await axios.get(`${this.address}/`)
    return result.data
  }

  async read(id: string): Promise<any> {
    const result = await axios.get(`${this.address}/${id}`)
    return result.data
  }

  async update(id: string, data: any) {
    await axios.put(`${this.address}/${id}`, data)
  }

  async create(data: any) {
    const result = await axios.post(`${this.address}/`, data)
    return result.data
  }

  async delete(id: string) {
    const result = await axios.delete(`${this.address}/${id}`)
  }
}

export { Adapter, RestAdapter }