import { Server } from 'http'
import Koa from 'koa'
import { DataModel } from './model'
import { apiRouter } from './router'
import serve from 'koa-static'
import { config } from './config'
import { Credentials } from './types'

interface AppContext extends Koa.DefaultContext {
  models : DataModel[]
  credentials : Credentials | null
}

const start = function({ models, port = 3002, credentials } : {
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

export { start }
export type { AppContext }
