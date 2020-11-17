import { Adapter } from './adapter'
import { DataSchema, Validator } from './schema'

class ModelError extends Error {}

type DataModelLink = {
  model: string
  entries: string[]
}

class DataModel {
  adapter : Adapter
  validator : Validator

  constructor({ schema, adapter } : { schema : DataSchema, adapter : Adapter, key? : string }) {
    this.validator = new Validator(schema)
    this.adapter = adapter
  }

  get id() {
    return this.schema.$id
  }

  get schema() : DataSchema {
    return this.validator.schema
  }

  async list() {
    return await this.adapter.list()
  }

  async get(id : string) {
    return await this.adapter.read(id)
  }

  async create(data : any) : Promise<object> {
    data = this.validator.test(data)
    return await this.adapter.create(data)
  }

  async update(id : string, data : any) : Promise<object> {
    const oldData = await this.get(id)
    if (!oldData) {
      throw new ModelError('Entry cannot be updated, because it does not exist.')
    }
    // merge data
    data = this.validator.test(Object.assign({}, oldData, data))
    await this.adapter.update(id, data)
    return data
  }

  async delete(id : string) {
    await this.adapter.delete(id)
  }

  async getLinks(entry : any, models: DataModel[]) : Promise<DataModelLink[]> {
    if (!this.schema.links) return []

    const results = []
    for (const link of this.schema.links) {
      if (!link.foreignKey || !link.key) continue
      const linkedModel = models.find((model) => model.id === link.model)
      if (linkedModel) {
        const entries = (await linkedModel.list()).filter((linkedEntry : any) => {
          return linkedEntry[link.foreignKey] === entry[link.key]
        })
        results.push({ model: link.model, entries: entries.map((e: any) => e[linkedModel.schema.primaryKey]) })
      } else {
        results.push({ model: link.model, entries: [] })
      }
    }
    return results
  }
}

export { DataModel }
export type { DataModelLink }
