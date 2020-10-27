import { Server } from 'http'
import Koa from 'koa'
import { DataModel } from './model'
import { apiRouter } from './router'


interface AppContext extends Koa.DefaultContext {
  models : DataModel[]
}

const startEditor = function({models, port} : {models : DataModel[], port : number}) : Promise<Server> {
  const app = new Koa<null,AppContext>();

  app.context.models = models

  app.use(apiRouter.routes())

  return new Promise<Server>( (resolve) => {
    const server = app.listen(port, () => {
      resolve(server)
    })
  })
}



export { startEditor, AppContext }