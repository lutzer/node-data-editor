const chai = require('chai');
const chaiAsPromised = require('chai-as-promised')
const _ = require('lodash');
const chaiHttp = require('chai-http')

const expect = chai.expect
chai.use(chaiAsPromised)
chai.use(chaiHttp)

const { MemoryAdapter } = require('./../dist/adapter')
const { DataModel } = require('./../dist/model');
const { start } = require('./../dist/server')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe.skip('Link Tests', () => {

  const port = 3002
  const credentials = { login: 'admin', password: 'password'}

  const model1 = new DataModel({
    schema : {
      $id : 'model1',
      properties: {
        id: { type: 'string'},
        data: { type : 'string'}
      },
      primaryKey : 'id',
      links: [{ model: 'model2', foreignKey: 'model1Id' }]
    },
    adapter: new MemoryAdapter([
      { id: '0' },
      { id: '1' },
      { id: '2' }
    ])
  })

  const model2 = new DataModel({
    schema : {
      $id : 'model2',
      properties: {
        id: { type: 'string'},
        model1Id: { type : 'string'}
      },
      primaryKey : 'id'
    },
    adapter: new MemoryAdapter([
      { id: '0', model1Id : '0' },
      { id: '1', model1Id : '0' },
      { id: '2', model2Id : '1' }
    ])
  })


  function createModel() {
    return new DataModel({ schema: schema, adapter : new MemoryAdapter([
      { id: '0', data: 'foo'},
      { id: '1', data: 'foo'},
      { id: '2', data: 'foo'},
    ], 'id')})
  }

  var server = null
  var model = null

  beforeEach( async () => {
    model = createModel()
    server = await start({ 
      models: [model], 
      port: 3002, 
      credentials : credentials
    })
  })

  afterEach( async () => {
    await server.close()
  });

  function connect() { return chai.request(server) }

  it('should serve a new Editor', async () => {
    let result = await connect().get('/api/').auth(credentials.login, credentials.password)
    expect(result).to.have.status(200)
  })

})