import _ from 'lodash'
import Ajv from 'ajv'
import { DataSchema } from './types'

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

    schema.required.forEach((val) => {
      if (!Object.keys(schema.properties).includes(val)) {
        throw new SchemaError(`required key ${val} does not exist in properties.`)
      }
      // set minlength of string property to 1 if its in the required array
      if (schema.properties[val].type === 'string') {
        schema.properties[val].minLength = schema.properties[val].minLength | 1
      }
    })

    // validate primaryKey
    if (!_.has(schema, 'primaryKey')) {
      throw new SchemaError('Schema needs to specify a primaryKey')
    }
    if (!_.has(schema, `properties.${schema.primaryKey}`)) {
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

export { Validator, ValidationError, SchemaError }
