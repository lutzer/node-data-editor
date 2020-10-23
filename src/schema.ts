import _ from "lodash";

// type DataType = 'string'|'number'|'boolean'|'object'|'array'
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

type DataSchema = { [key : string] : { 
  type : DataType
  default? : any
  required? : boolean
}}

class SchemaError extends Error {
  constructor(msg : string) {
    super(msg)
  }
}

class DataError extends Error {
  constructor(msg : string) {
    super(msg)
  }
}

class Validator {

  schema : DataSchema

  constructor(schema : DataSchema) {

    //check if schema is valid
    Object.entries(schema).forEach( ([key, val]) => {
      if (!_.has(val,'type') || !(val.type in DataType))
        throw new SchemaError(`Schema does not specify a correct type of ${key}.`)
      if (_.has(val, 'required') &&  getType(val.required) != 'boolean')
        throw new SchemaError(`Schema does not specify a boolean for required of ${key}.`)
      if (_.has(val, 'default') && getType(val.default) != val.type)
        throw new SchemaError(`Schema does not specify a default value with the correct type of ${key}.`)
    });

    this.schema = schema
  }

  test(data: object) : object {
    var result = {}
    Object.entries(this.schema).forEach( ([key, val]) => {
      if (_.has(data,key)) {
        if (getType(data[key]) != val.type)
          throw new DataError(`${key} is of wrong type, should be ${val.type}.`)
        result[key] = data[key]
      } else if (val.required) {
        throw new DataError(`${key} is empty, but is required in schema.`)
      } else if (val.default) {
        result[key] = val.default
      }
    })
    return result
  }
}

export { DataSchema, DataType, Validator }