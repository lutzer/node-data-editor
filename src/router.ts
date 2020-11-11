import Koa from 'koa'
// @ts-ignore
import Router from '@koa/router'
import { AppContext } from './server'
import bodyParser from 'koa-body'
import { config } from './config'
import { checkBasicAuth } from './utils'

type Credentials = {
  login: string
  password: string
}

const authMiddleware = async function(basectx: Koa.DefaultContext, next : Koa.Next) {
  const context : AppContext = <AppContext>basectx
  if (context.credentials && !checkBasicAuth(context.header, context.credentials.login, context.credentials.password)) {
    context.throw(401, 'No authorization')
  }
  await next()
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
  context.body = { schemas: schemas }
})

apiRouter.get('/:model', async (basectx : Koa.DefaultContext) => {
  const context : AppContext = <AppContext>basectx
  try {
    const model = context.models.find((model) => model.schema.$id === context.params.model)
    if (!model) {
      throw new ApiError(400, `model ${context.params.model} does not exist.`)
    }
    await model.fetch()
    context.body = { schema: model.schema, data: model.data }
  } catch (err) {
    context.throw(err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

apiRouter.get('/:model/:id', async (basectx : Koa.DefaultContext) => {
  const context : AppContext = <AppContext>basectx
  try {
    const model = context.models.find((model) => model.schema.$id === context.params.model)
    if (!model) {
      throw new ApiError(400, `model ${context.params.model} does not exist.`)
    }
    await model.fetch(context.params.id)
    context.body = { schema: model.schema, data: model.get(context.params.id) }
  } catch (err) {
    context.throw(err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

apiRouter.delete('/:model/:id', async (basectx : Koa.DefaultContext) => {
  const context : AppContext = <AppContext>basectx
  try {
    const model = context.models.find((model) => model.schema.$id === context.params.model)
    if (!model) {
      throw new ApiError(400, `model ${context.params.model} does not exist.`)
    }
    await model.fetch(context.params.id)
    if (!model.get(context.params.id)) {
      throw new ApiError(400, `entry with key ${context.params.id} does not exist.`)
    }
    await model.delete(context.params.id)
    await model.sync()
    context.body = { }
  } catch (err) {
    context.throw(err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

apiRouter.post('/:model/', bodyParser(), async (basectx : Koa.DefaultContext) => {
  const context : AppContext = <AppContext>basectx
  try {
    const model = context.models.find((model) => model.schema.$id === context.params.model)
    if (!model) {
      throw new ApiError(400, `model ${context.params.model} does not exist.`)
    }
    const data = await model.create(context.request.body)
    await model.sync()
    context.body = { schema: model.schema, data: data }
  } catch (err) {
    context.throw(err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

apiRouter.put('/:model/:id', bodyParser(), async (basectx : Koa.DefaultContext) => {
  const context : AppContext = <AppContext>basectx
  try {
    const model = context.models.find((model) => model.schema.$id === context.params.model)
    if (!model) {
      throw new ApiError(400, `model ${context.params.model} does not exist.`)
    }
    await model.fetch(context.params.id)
    const data = await model.update(context.params.id, context.request.body)
    await model.sync()
    context.body = { schema: model.schema, data: data }
  } catch (err) {
    context.throw(err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

export { apiRouter, Credentials }
