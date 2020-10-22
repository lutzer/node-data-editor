import { Server } from 'http';
import Koa from 'koa'


const startServer = function(port : number) : Promise<Server> {
  const app = new Koa<null,null>();
  return new Promise<Server>( (resolve) => {
    const server = app.listen(port, () => {
      resolve(server)
    })
  })
}



export { startServer }