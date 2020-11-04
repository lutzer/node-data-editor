import base64 from 'base-64'
import { config } from './config'

class ApiException extends Error {

  statusCode : number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

function generateAuthHeader(name: string, password: string) : { Authorization : string } {
  return {
    "Authorization": `Basic ${base64.encode(`${name}:${password}`)}`
  }
}

type SchemaProperty = {
  type : string
  default? : any
  maxLength? : number
  minimum?: number,
  maximum?: number,
}

type Schema = {
  title: string
  properties: { [key : string] : SchemaProperty}
  primaryKey : string
  required : string[]
}

type Credentials = {
  login : string
  password : string
}

type Entry = {
  schema: Schema,
  data : any
}

class Api {

  static async checkCredentials(credentials? : Credentials) : Promise<void> {
    await this.getSchemas(credentials)
  }

  static async getSchemas(credentials? : Credentials) : Promise<{ schemas: Schema[]}> {
    let response = await fetch(config.apiAdress + '/', {
      method: 'GET',
      headers: Object.assign({},{
        'Content-Type': 'application/json'
      }, credentials && generateAuthHeader(credentials.login, credentials.password))
    })
    if (response.status !== 200)
      throw new ApiException(response.status, await response.text())
    let json = await response.json()
    return json
  }

  static async getModel(modelName: string, credentials? : Credentials) : Promise<{ schema: Schema, data: any[]}> {
    let response = await fetch(config.apiAdress + '/' + modelName, {
      method: 'GET',
      headers: Object.assign({},{
        'Content-Type': 'application/json'
      }, credentials && generateAuthHeader(credentials.login, credentials.password))
    })
    if (response.status !== 200)
      throw new ApiException(response.status, await response.text())
    let json = await response.json()
    return json
  }

  static async getEntry(modelName: string, entryId : string, credentials? : Credentials) : Promise<{schema: Schema, data: any}> {
    let response = await fetch(config.apiAdress + `/${modelName}/${entryId}` , {
      method: 'GET',
      headers: Object.assign({},{
        'Content-Type': 'application/json'
      }, credentials && generateAuthHeader(credentials.login, credentials.password))
    })
    if (response.status !== 200)
      throw new ApiException(response.status, await response.text())
    let json = await response.json()
    return json
  }

  static async deleteEntry(modelName: string, entryId : string, credentials? : Credentials) : Promise<void> {
    let response = await fetch(config.apiAdress + `/${modelName}/${entryId}` , {
      method: 'DELETE',
      headers: Object.assign({},credentials && generateAuthHeader(credentials.login, credentials.password))
    })
    if (response.status !== 200)
      throw new ApiException(response.status, response.statusText)
  }

  static async updateEntry(modelName: string, entryId : string, data: any, credentials? : Credentials) : Promise<Entry> {
    let response = await fetch(config.apiAdress + `/${modelName}/${entryId}` , {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: Object.assign({},{
        'Content-Type': 'application/json'
      }, credentials && generateAuthHeader(credentials.login, credentials.password))
    })
    if (response.status !== 200)
      throw new ApiException(response.status, await response.text())
    let json = await response.json()
    return json
  }

  static async createEntry(modelName: string, data: object, credentials: Credentials) : Promise<Entry> {
    let response = await fetch(config.apiAdress + `/${modelName}/` , {
      method: 'POST',
      body: JSON.stringify(data),
      headers: Object.assign({},{
        'Content-Type': 'application/json'
      }, credentials && generateAuthHeader(credentials.login, credentials.password))
    })
    if (response.status !== 200)
      throw new ApiException(response.status, await response.text())
    let json = await response.json()
    return json
  }
}

function setCredentials(credentials: Credentials) {
  localStorage.setItem('credentials', JSON.stringify(credentials));
}

function getCredentials() : Credentials {
  return JSON.parse(localStorage.getItem('credentials') || '') as Credentials
}

export { Api, ApiException, setCredentials, getCredentials }
export type { Schema, SchemaProperty, Entry, Credentials }