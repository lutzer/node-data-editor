import { Server } from 'http'
import Koa from 'koa'
import { DataModel } from './model'
import { apiRouter, Credentials } from './router'
import serve from 'koa-static'
import { config } from './config'

interface AppContext extends Koa.DefaultContext {
  models : DataModel[]
  credentials : Credentials | null
}

const startDataEditor = function({ models, port = 3002, credentials } : {
  models : DataModel[],
  port? : number,
  credentials?: Credentials
}) : Promise<Server> {
  const app = new Koa<{}, AppContext>()

  app.context.models = models
  app.context.credentials = credentials || null

  app.use(apiRouter.routes())
  app.use(serve(config.staticDirectory))

  return new Promise<Server>((resolve) => {
    const server = app.listen(port, () => {
      resolve(server)
    })
  })
}

export { startDataEditor, AppContext }
