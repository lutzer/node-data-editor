import _ from 'lodash'
import Ajv from 'ajv'

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

type DataSchemaProperty = {
  type : DataType
  default? : any
  maxLength? : number
  minimum?: number,
  maximum?: number,
  minLength? : number
}

type DataSchema = {
  $id: string,
  type? : string,
  additionalProperties? : boolean,
  properties: { [key : string] : DataSchemaProperty },
  primaryKey: string,
  required? : string[],
  links? : { rel : string, href : string }[],
}

class SchemaError extends Error {}

class ValidationError extends Error {}

class Validator {
  schema : DataSchema
  ajvValidate : Ajv.ValidateFunction

  constructor(schema : DataSchema) {
    schema.required = schema.required || []
    schema.type = schema.type || 'object'
    schema.additionalProperties = schema.additionalProperties || false

    // check if schema is valid
    if (!_.isString(schema.$id)) {
      throw new SchemaError('Schema needs to specify an id')
    }
    if (!_.has(schema, 'properties')) {
      throw new SchemaError('Schema needs to specify one or more properties')
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

    // validate primaryKey
    if (!_.has(schema, 'primaryKey')) {
      throw new SchemaError('Schema needs to specify a primaryKey')
    }
    if (_.has(schema, `properties.${schema.primaryKey}`)) {
      schema.properties[schema.primaryKey].minLength = 1
    } else {
      throw new SchemaError(`schema does not contain a property with the specified primaryKey: ${schema.primaryKey}`)
    }
    if (schema.properties[schema.primaryKey].type !== 'string') {
      throw new SchemaError('primary key needs to be of type string.')
    }

    this.schema = schema

    // setup validator for model
    const ajv = new Ajv({
      useDefaults: true,
      removeAdditional: true
    })
    this.ajvValidate = ajv.compile(this.schema)
  }

  test(data: any) : Promise<object> {
    data = _.cloneDeep(data)
    const result = this.ajvValidate(data)
    if (!result) {
      const errors = this.ajvValidate.errors
        ? this.ajvValidate.errors.map((val) => val.dataPath + ' ' + val.message)
        : []
      throw new ValidationError(JSON.stringify(errors))
    }
    return data
  }
}

export { Validator, ValidationError, SchemaError, DataType }
export type { DataSchema, DataSchemaProperty }
