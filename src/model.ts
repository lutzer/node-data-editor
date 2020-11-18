import _ from 'lodash'
import { Adapter } from './adapter'
import { DataSchema, Validator } from './schema'

class ModelError extends Error {}

type DataModelLink = {
  model: string
  entries: { key?: string, title?: string }[]
}

type DataEntry = {
  data: any,
  $title?: string,
  $key?: string
}

function getTitle(entry: any, schema: DataSchema) : string {
  if (_.has(schema, 'titleTemplate')) {
    return _.template(schema.titleTemplate)(entry)
  } else {
    return `${entry[schema.primaryKey]}`
  }
}

function addKeyAndTitle(entry: any, schema: DataSchema) : DataEntry {
  if (!entry) {
    return {
      data: undefined,
      $title: undefined,
      $key: undefined
    }
  }
  return {
    data: entry,
    $title: getTitle(entry, schema),
    $key: entry[schema.primaryKey]
  }
}

class DataModel {
  adapter : Adapter
  validator : Validator

  constructor({ schema, adapter } : { schema : DataSchema, adapter : Adapter, key? : string }) {
    this.validator = new Validator(schema)
    this.adapter = adapter
  }

  get primaryKey() {
    return this.schema.primaryKey
  }

  get id() {
    return this.schema.$id
  }

  get schema() : DataSchema {
    return this.validator.schema
  }

  async list() : Promise<DataEntry[]> {
    return (await this.adapter.list()).map((e) => addKeyAndTitle(e, this.schema))
  }

  async get(id : string) : Promise<DataEntry|undefined> {
    const data = await this.adapter.read(id)
    return data ? addKeyAndTitle(data, this.schema) : undefined
  }

  async create(data : any) : Promise<DataEntry> {
    data = this.validator.test(data)
    return addKeyAndTitle(await this.adapter.create(data), this.schema)
  }

  async update(id : string, data : any) : Promise<DataEntry> {
    const oldEntry = await this.get(id)
    if (!oldEntry) {
      throw new ModelError('Entry cannot be updated, because it does not exist.')
    }
    // merge data
    data = this.validator.test(Object.assign({}, oldEntry.data, data))
    await this.adapter.update(id, data)
    return addKeyAndTitle(data, this.schema)
  }

  async delete(id : string) {
    await this.adapter.delete(id)
  }

  async getLinks(entry : DataEntry, models: DataModel[]) : Promise<DataModelLink[]> {
    if (!this.schema.links) return []

    const results : DataModelLink[] = []
    for (const link of this.schema.links) {
      if (!link.foreignKey || !link.key) continue
      const linkedModel = models.find((model) => model.id === link.model)
      if (linkedModel) {
        const entries = (await linkedModel.list()).filter((linkedEntry : DataEntry) => {
          return entry.data[link.key] && linkedEntry.data[link.foreignKey] === entry.data[link.key]
        })
        results.push({
          model: link.model,
          entries: entries.map((e) => {
            return { key: e.$key, title: e.$title }
          })
        })
      } else {
        results.push({ model: link.model, entries: [] })
      }
    }
    return results
  }
}

export { DataModel }
export type { DataModelLink, DataEntry }
