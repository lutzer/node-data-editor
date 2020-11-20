import fs from 'fs/promises'
import _ from 'lodash'
import { Adapter, AdapterError } from '../adapter'

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

export { FileAdapter }
