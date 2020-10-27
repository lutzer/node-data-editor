const chai = require('chai');
const chaiAsPromised = require('chai-as-promised')
const _ = require('lodash');
const chaiHttp = require('chai-http')

const expect = chai.expect
chai.use(chaiAsPromised)
chai.use(chaiHttp)

const { MemoryAdapter } = require('./../dist/adapter')
const { DataModel } = require('./../dist/model');
const { startEditor } = require('./../dist/server')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Api Route Tests', () => {

  const port = 3002
  const credentials = { login: 'admin', password: 'password'}

  const schema = {
    title : 'test',
    properties: {
      id: { type: 'number'},
      data: { type : 'string'}
    },
    required : ['id']
  }

  function createModel() {
    return new DataModel({ schema: schema, key: 'id', adapter : new MemoryAdapter([
      { id: 0, data: 'foo'},
      { id: 1, data: 'foo'},
      { id: 2, data: 'foo'},
    ])})
  }

  var server = null
  var model = null

  beforeEach( async () => {
    model = createModel()
    server = await startEditor({ 
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

  it('should not serve Editor without correct auth', async () => {
    let result = await connect().get('/api/').auth('sadasd', 'sadsdsadh')
    expect(result).to.have.status(401)
  })

  it('should serve the models schemas on GET /api/', async () => {
    let result = await connect().get('/api/').auth(credentials.login, credentials.password)
    expect(result.body).to.deep.equal({ schemas: [model.schema]})
  })

  it(`should serve model data on GET /api/${schema.title}/`, async () => {
    let result = await connect().get(`/api/${schema.title}/`).auth(credentials.login, credentials.password)
    expect(result).to.have.status(200)
    expect(result.body).to.deep.equal({ schema: model.schema, data: model.data })
  })

  it(`should not serve model data on model that does not exist`, async () => {
    let result = await connect().get(`/api/foo/`).auth(credentials.login, credentials.password)
    expect(result).to.have.status(400)
  })

  it(`should serve model data on GET /api/${schema.title}/0`, async () => {
    let result = await connect().get(`/api/${schema.title}/0`).auth(credentials.login, credentials.password)
    expect(result).to.have.status(200)
    expect(result.body).to.deep.equal({ schema: model.schema, data: model.get(0) })
  })

  it(`should delete entry data on DELETE /api/${schema.title}/0`, async () => {
    let result = await connect().delete(`/api/${schema.title}/0`).auth(credentials.login, credentials.password)
    expect(result).to.have.status(200)
    result = await connect().get(`/api/${schema.title}/`).auth(credentials.login, credentials.password)
    expect(result.body.data).to.be.lengthOf(2)
  })

  it(`should not be able to delete non existing entry`, async () => {
    let result = await connect().delete(`/api/${schema.title}/5`).auth(credentials.login, credentials.password)
    expect(result).to.have.status(400)
  })

  it(`should be able to create a new entry`, async () => {
    const data = { id: 4, data: 'bar'}
    let result = await connect().post(`/api/${schema.title}/` ).send(data).auth(credentials.login, credentials.password)
    expect(result).to.have.status(200)
    expect(result.body.data).to.deep.equal(data)
  })

  it(`should not be able to create a new entry without required field`, async () => {
    const data = { data: 'bar'}
    let result = await connect().post(`/api/${schema.title}/` ).send(data).auth(credentials.login, credentials.password)
    expect(result).to.have.status(400)
  })

  it(`should be able to change an entry`, async () => {
    const data = { data: 'bar'}
    var result = await connect().put(`/api/${schema.title}/0`).send(data).auth(credentials.login, credentials.password)
    result = await connect().get(`/api/${schema.title}/0`).auth(credentials.login, credentials.password)
    expect(result).to.have.status(200)
    expect(result.body.data).to.deep.equal({ id: 0, data: 'bar'})
  })

  it(`should receive error, when updated entry does not exist`, async () => {
    const data = { data: 'bar'}
    const result = await connect().put(`/api/${schema.title}/5` ).send(data).auth(credentials.login, credentials.password)
    expect(result).to.have.status(400)
  })

})