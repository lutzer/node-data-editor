import { use } from 'chai'
import { Server } from 'http'
import Koa from 'koa'
import { DataModel } from './model'
import { apiRouter } from './router'
import { checkBasicAuth } from './utils'

type Credentials = {
  login: string
  password: string
}

const authMiddleware = async function(context : AppContext, next : Koa.Next) {
  if (context.credentials && !checkBasicAuth(context.header, context.credentials.login, context.credentials.password))
    context.throw(401, 'No authorization');
  await next()
}

interface AppContext extends Koa.DefaultContext {
  models : DataModel[]
  credentials : Credentials
}

const startEditor = function({models, port = 3002, credentials = null} : {
  models : DataModel[], 
  port? : number, 
  credentials?: Credentials
}) : Promise<Server> {
  const app = new Koa<null,AppContext>();

  app.context.models = models
  app.context.credentials = credentials

  app.use(authMiddleware)
  app.use(apiRouter.routes())

  return new Promise<Server>( (resolve) => {
    const server = app.listen(port, () => {
      resolve(server)
    })
  })
}



export { startEditor, AppContext }