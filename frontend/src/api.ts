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

type Schema = {
  title: string
  properties: object
  primaryKey : string
  required : string[]
}

type Model = {
  schema: Schema
  data: any[]
}

type Credentials = {
  login : string
  password : string
}

class Api {

  static async getSchemas(credentials : Credentials) : Promise<{ schemas: Schema[]}> {
    let response = await fetch(config.apiAdress + '/', {
      method: 'GET',
      headers: Object.assign({},{
        'Content-Type': 'application/json'
      }, generateAuthHeader(credentials.login, credentials.password))
    })
    if (response.status !== 200)
      throw new ApiException(response.status, response.statusText)
    let json = await response.json()
    return json
  }

  static async getModel(modelName: string, credentials : Credentials) : Promise<Model> {
    let response = await fetch(config.apiAdress + '/' + modelName, {
      method: 'GET',
      headers: Object.assign({},{
        'Content-Type': 'application/json'
      }, generateAuthHeader(credentials.login, credentials.password))
    })
    if (response.status !== 200)
      throw new ApiException(response.status, response.statusText)
    let json = await response.json()
    return json
  }

  static async getEntry(modelName: string, entryId : string, credentials : Credentials) : Promise<Model> {
    let response = await fetch(config.apiAdress + `/${modelName}/${entryId}` , {
      method: 'GET',
      headers: Object.assign({},{
        'Content-Type': 'application/json'
      }, generateAuthHeader(credentials.login, credentials.password))
    })
    if (response.status !== 200)
      throw new ApiException(response.status, response.statusText)
    let json = await response.json()
    return json
  }

  // static async getProjectByName(name: string) : Promise<{project : ProjectSchema}> {
  //   let response = await fetch(config.apiAdress + 'projects?name=' + name)
  //   if (response.status != 200)
  //     throw new ApiException(response.status, `Could not fetch data.`)
  //   let json = await response.json()
  //   if (_.isEmpty(json.project))
  //     throw new ApiException(response.status, `There is no project with the name ${name}.`)
  //   return json
  // }

  // static async addAttachment(attachment : AttachmentSchema, image: Blob, password: string, projectName: string) {
  //   // post story
  //   let response = await fetch(config.apiAdress + 'attachments', {
  //     method: 'POST',
  //     headers: Object.assign({},{
  //       'Content-Type': 'application/json'
  //     }, generateAuthHeader(projectName, password)),
  //     body: JSON.stringify(attachment)
  //   });
  //   if (response.status != 200) {
  //     let text = await response.text()
  //     throw new ApiException(response.status, text)
  //   }

  //   // find out attachment id
  //   let json = await response.json()
  //   let serverId = json.attachment.id

  //   //upload image
  //   if (image) {
  //     response = await uploadAttachmentImage(serverId, image, password, projectName)
  //   }
  //   if (response.status != 200) {
  //     let text = await response.text()
  //     throw new ApiException(response.status, text)
  //   }
  // }
}

export { Api, ApiException }
export type { Model, Schema, Credentials }