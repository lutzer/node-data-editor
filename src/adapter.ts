import { DataModel } from "./model";
import axios from 'axios';


abstract class Adapter {

  abstract async read() : Promise<any>
  abstract async write(data : any) : Promise<void>
  abstract async delete(id : string) : Promise<void>
}

class RestAdapter extends Adapter {

  address : string

  constructor(address : string) {
    super()
    this.address = address
  }

  async read(): Promise<any> {
    const result = await axios.get(`${this.address}/`)
    return result.data
  }
  async write(data: any) {
    const result = await axios.post(`${this.address}/`, data)
  }
  async delete(id: string) {
    const result = await axios.delete(`${this.address}/${id}`)
  }
}

export { Adapter, RestAdapter }