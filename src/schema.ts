import _ from 'lodash'

// type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array'
enum DataType {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  object = 'object',
  array = 'array'
}

const getType = function(val : any) : string {
  if (_.isArray(val)) return 'array'
  if (_.isObject(val)) return 'object'
  if (_.isNumber(val)) return 'number'
  if (_.isBoolean(val)) return 'boolean'
  if (_.isString(val)) return 'string'
  else return 'undefined'
}

type DataSchema = {
  title: string,
  properties: { [key : string] : {
    type : DataType
    default? : any
  }}
  primaryKey: string,
  required? : string[],
  links? : { rel : string, href : string }[],
}

class SchemaError extends Error {}

class DataError extends Error {}

class Validator {
  schema : DataSchema

  constructor(schema : DataSchema) {
    schema.required = schema.required || []

    // check if schema is valid
    if (!_.isString(schema.title)) {
      throw new SchemaError('Schema needs to specify a title')
    }
    if (!_.has(schema, 'properties')) {
      throw new SchemaError('Schema needs to specify one or more properties')
    }
    if (!_.has(schema, 'primaryKey')) {
      throw new SchemaError('Schema needs to specify a primaryKey')
    }
    Object.entries(schema.properties).forEach(([key, val]) => {
      if (!_.has(val, 'type') || !(val.type in DataType)) {
        throw new SchemaError(`Schema does not specify a correct type of ${key}.`)
      }
      if (_.has(val, 'default') && getType(val.default) !== val.type) {
        throw new SchemaError(`Schema does not specify a default value with the correct type of ${key}.`)
      }
    })

    schema.required.forEach((val) => {
      if (!Object.keys(schema.properties).includes(val)) {
        throw new SchemaError(`required key ${val} does not exist in properties.`)
      }
    })

    if (!_.has(schema, `properties.${schema.primaryKey}`)) {
      throw new Error(`schema does not contain a property with the specified primaryKey: ${schema.primaryKey}`)
    }

    this.schema = schema
  }

  test(data: any) : object {
    var result : any = {}
    if (!_.has(data, this.schema.primaryKey) || _.isEmpty(data[this.schema.primaryKey])) {
      throw new DataError('Schema requires a primary key.')
    }
    Object.entries(this.schema.properties).forEach(([key, val]) => {
      if (_.has(data, key)) {
        if (getType(data[key]) !== val.type) {
          throw new DataError(`${key} is of wrong type, should be ${val.type}.`)
        }
        result[key] = data[key]
      } else if (this.schema.required && this.schema.required.includes(key)) {
        throw new DataError(`${key} is empty, but is required in schema.`)
      } else if (val.default) {
        result[key] = val.default
      }
    })
    return result
  }
}

export { DataSchema, DataType, Validator, DataError }
