import base64 from 'base-64'
import { config } from './config'
import { DataSchema, DataSchemaProperty } from './../../src/schema'
import { ModelListResponse, ModelEntryResponse, SchemaResponse, Credentials } from './../../src/router'
import { DataEntry, DataModelLink } from '../../src/model'

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

class Api {

  static async checkCredentials(credentials? : Credentials) : Promise<void> {
    await this.getSchemas(credentials)
  }

  static async getSchemas(credentials? : Credentials) : Promise<SchemaResponse> {
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

  static async getModel(modelId: string, credentials? : Credentials) : Promise<ModelListResponse> {
    let response = await fetch(config.apiAdress + '/' + modelId, {
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

  static async getEntry(modelId: string, entryId : string, credentials? : Credentials) : Promise<ModelEntryResponse> {
    let response = await fetch(config.apiAdress + `/${modelId}/${entryId}` , {
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

  static async deleteEntry(modelId: string, entryId : string, credentials? : Credentials) : Promise<void> {
    let response = await fetch(config.apiAdress + `/${modelId}/${entryId}` , {
      method: 'DELETE',
      headers: Object.assign({},credentials && generateAuthHeader(credentials.login, credentials.password))
    })
    if (response.status !== 200)
      throw new ApiException(response.status, response.statusText)
  }

  static async updateEntry(modelId: string, entryId : string, data: any, credentials? : Credentials) : Promise<ModelEntryResponse> {
    let response = await fetch(config.apiAdress + `/${modelId}/${entryId}` , {
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

  static async createEntry(modelId: string, data: object, credentials: Credentials) : Promise<ModelEntryResponse> {
    let response = await fetch(config.apiAdress + `/${modelId}/` , {
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
export type { DataSchema, DataSchemaProperty, Credentials, DataEntry, DataModelLink }