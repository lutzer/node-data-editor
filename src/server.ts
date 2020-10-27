import { Server } from 'http'
import Koa from 'koa'
import { DataModel } from './model'
import { apiRouter } from './router'
import serve from 'koa-static'
import { config } from './config'

type Credentials = {
  login: string
  password: string
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

  app.use(apiRouter.routes())
  app.use(serve(config.staticDirectory));

  return new Promise<Server>( (resolve) => {
    const server = app.listen(port, () => {
      resolve(server)
    })
  })
}



export { startEditor, AppContext }