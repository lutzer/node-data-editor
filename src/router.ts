import Router from '@koa/router'
import { AppContext } from './server'
import bodyParser from 'koa-body'

class ApiError extends Error {
  statusCode : number
  constructor(statusCode : number, message : string) {
    super(message)
    this.statusCode = statusCode;
  }
}

const apiRouter = new Router({
  prefix : '/api'
})

apiRouter.get('/', async (context : AppContext) => {
  const schemas = context.models.map( (model) => model.schema)
  context.body = { schemas : schemas }
})

apiRouter.get('/:model', async (context : AppContext) => {
  try {
    const model = context.models.find( (model) => model.schema.title == context.params.model)
    if (!model)
      throw new ApiError(400,`model ${context.params.model} does not exist.`)
    await model.fetch()
    context.body = { schema : model.schema, data: model.data }
  } catch (err) {
    context.throw( err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

apiRouter.get('/:model/:id', async (context : AppContext) => {
  try {
    const model = context.models.find( (model) => model.schema.title == context.params.model)
    if (!model)
      throw new ApiError(400,`model ${context.params.model} does not exist.`)
    await model.fetch(context.params.id)
    context.body = { schema : model.schema, data: model.get(context.params.id) }
  } catch (err) {
    context.throw( err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

apiRouter.delete('/:model/:id', async (context : AppContext) => {
  try {
    const model = context.models.find( (model) => model.schema.title == context.params.model)
    if (!model)
      throw new ApiError(400,`model ${context.params.model} does not exist.`)
    await model.fetch(context.params.id);
    if (!model.get(context.params.id))
      throw new ApiError(400,`entry with key ${context.params.id} does not exist.`)
    await model.delete(context.params.id)
    await model.sync()
    context.body = { }
  } catch (err) {
    context.throw( err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

apiRouter.post('/:model/', bodyParser(), async (context : AppContext) => {
  try {
    const model = context.models.find( (model) => model.schema.title == context.params.model)
    if (!model)
      throw new ApiError(400,`model ${context.params.model} does not exist.`)
    const data = await model.create(context.request.body)
    await model.sync()
    context.body = { schema: model.schema, data : data }
  } catch (err) {
    context.throw( err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})

apiRouter.put('/:model/:id', bodyParser(), async (context : AppContext) => {
  try {
    const model = context.models.find( (model) => model.schema.title == context.params.model)
    if (!model)
      throw new ApiError(400,`model ${context.params.model} does not exist.`)
    await model.fetch(context.params.id)
    const data = await model.update(context.params.id, context.request.body)
    await model.sync()
    context.body = { schema: model.schema, data : data }
  } catch (err) {
    context.throw( err instanceof ApiError ? err.statusCode : 400, err.message)
  }
})



export { apiRouter }