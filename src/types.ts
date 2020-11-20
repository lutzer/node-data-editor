type DataModelLink = {
  model: string
  entries: { key?: string, title?: string }[]
}

type DataEntry = {
  data: any,
  $title?: string,
  $key?: string
}

type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'

type DataSchemaProperty = {
  type : DataType|DataType[]
  default? : any
  [x: string] : any
}

type DataSchema = {
  $id: string
  type? : string
  additionalProperties? : boolean
  properties: { [key : string] : DataSchemaProperty }
  primaryKey: string
  required? : string[]
  links? : { model : string, key : string, foreignKey : string }[]
  titleTemplate? : string
}

type Credentials = {
  login: string
  password: string
}

type ModelListResponse = {
  schema: DataSchema,
  entries: DataEntry[]
}

type ModelEntryResponse = {
  schema: DataSchema,
  links: DataModelLink[]
  entry?: DataEntry,
}

type SchemaResponse = {
  schemas: DataSchema[]
}

export type { DataModelLink, DataEntry, DataType, DataSchemaProperty, DataSchema, Credentials, ModelListResponse, ModelEntryResponse, SchemaResponse }
