import Koa from 'koa'
// @ts-ignore
import Router from '@koa/router'
import { AppContext } from './server'
import bodyParser from 'koa-body'
import { config } from './config'
import { checkBasicAuth } from './utils'
import { DataEntry, DataModel, DataModelLink } from './model'
import { DataSchema } from './schema'

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

const authMiddleware = async function(basectx: Koa.DefaultContext, next : Koa.Next) {
  const context : AppContext = <AppContext>basectx
  if (context.credentials && !checkBasicAuth(context.header, context.credentials.login, context.credentials.password)) {
    context.throw(401, 'No authorization')
  }
  await next()
}

function getModel(name: string, context: AppContext) : DataModel {
  const model = context.models.find((model) => model.schema.$id === context.params.model)
  if (!model) {
    throw new ApiError(400, `model ${context.params.model} does not exist.`)
  }
  return model
}

class ApiError extends Error {
  statusCode : number
  constructor(statusCode : number, message : string) {
    super(message)
    this.statusCode = statusCode
  }
}

const apiRouter = new Router({
  prefix: config.apiPrefix
})

// all api routes require authentification
apiRouter.use(authMiddleware)

apiRouter.get('/', async (basectx : Koa.DefaultContext) => {
  const context : AppContext = <AppContext>basectx
  const schemas = context.models.map((model) => model.schema)
  const response : SchemaResponse = { schemas: schemas }
  context.body = response
})

apiRouter.get('/:model', async (basectx : Koa.DefaultContext) => {
  const context : AppContext = <AppContext>basectx
  try {
    const model = getModel(context.params.model, context)
    const data = await model.list()
    const response : ModelListResponse = { schema: model.schema, entries: data }
    context.body = response
  } catch (err) {
    context.throw(err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

apiRouter.get('/:model/:id', async (basectx : Koa.DefaultContext) => {
  const context : AppContext = <AppContext>basectx
  try {
    const model = getModel(context.params.model, context)
    const entry = await model.get(context.params.id)
    const links = entry ? await model.getLinks(entry, context.models) : []
    const response : ModelEntryResponse = { schema: model.schema, entry: entry, links: links }
    context.body = response
  } catch (err) {
    context.throw(err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

apiRouter.delete('/:model/:id', async (basectx : Koa.DefaultContext) => {
  const context : AppContext = <AppContext>basectx
  try {
    const model = getModel(context.params.model, context)
    await model.delete(context.params.id)
    context.body = {}
  } catch (err) {
    context.throw(err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

apiRouter.post('/:model/', bodyParser(), async (basectx : Koa.DefaultContext) => {
  const context : AppContext = <AppContext>basectx
  try {
    const model = getModel(context.params.model, context)
    const data = await model.create(context.request.body)
    const response : ModelEntryResponse = { schema: model.schema, entry: data, links: [] }
    context.body = response
  } catch (err) {
    context.throw(err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

apiRouter.put('/:model/:id', bodyParser(), async (basectx : Koa.DefaultContext) => {
  const context : AppContext = <AppContext>basectx
  try {
    const model = getModel(context.params.model, context)
    const data = await model.update(context.params.id, context.request.body)
    const response : ModelEntryResponse = { schema: model.schema, entry: data, links: [] }
    context.body = response
  } catch (err) {
    context.throw(err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

export { apiRouter }
export type { ModelListResponse, ModelEntryResponse, SchemaResponse, Credentials }
