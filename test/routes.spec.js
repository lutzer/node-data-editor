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

describe('Api Route Tests', () => {

  const port = 3002
  const credentials = { login: 'admin', password: 'password'}

  const schema = {
    $id : 'test',
    properties: {
      id: { type: 'string'},
      data: { type : 'string'}
    },
    primaryKey : 'id',
    required : ['id']
  }

  const modelData = [
    { id: '0', data: 'foo'},
    { id: '1', data: 'foo'},
    { id: '2', data: 'foo'},
  ]

  function createModel() {
    return new DataModel({ schema: schema, adapter : new MemoryAdapter(modelData, 'id')})
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

  it('should not serve Editor without correct auth', async () => {
    let result = await connect().get('/api/').auth('sadasd', 'sadsdsadh')
    expect(result).to.have.status(401)
  })

  it('should serve the models schemas on GET /api/', async () => {
    let result = await connect().get('/api/').auth(credentials.login, credentials.password)
    expect(result.body).to.deep.equal({ schemas: [model.schema]})
  })

  it(`should serve model data on GET /api/${schema.$id}/`, async () => {
    let result = await connect().get(`/api/${schema.$id}/`).auth(credentials.login, credentials.password)
    expect(result).to.have.status(200)
    expect(result.body).to.deep.equal({ schema: model.schema, data: modelData })
  })

  it(`should not serve model data on model that does not exist`, async () => {
    let result = await connect().get(`/api/foo/`).auth(credentials.login, credentials.password)
    expect(result).to.have.status(400)
  })

  it(`should serve model data on GET /api/${schema.$id}/0`, async () => {
    let result = await connect().get(`/api/${schema.$id}/0`).auth(credentials.login, credentials.password)
    expect(result).to.have.status(200)
    expect(result.body).to.deep.equal({ schema: model.schema, data: modelData[0], links:[] })
  })

  it(`should delete entry data on DELETE /api/${schema.$id}/0`, async () => {
    let result = await connect().delete(`/api/${schema.$id}/0`).auth(credentials.login, credentials.password)
    expect(result).to.have.status(200)
    result = await connect().get(`/api/${schema.$id}/`).auth(credentials.login, credentials.password)
    expect(result.body.data).to.be.lengthOf(2)
  })

  it(`should not be able to delete non existing entry`, async () => {
    let result = await connect().delete(`/api/${schema.$id}/5`).auth(credentials.login, credentials.password)
    expect(result).to.have.status(400)
  })

  it(`should be able to create a new entry`, async () => {
    const data = { id: '4', data: 'bar'}
    let result = await connect().post(`/api/${schema.$id}/` ).send(data).auth(credentials.login, credentials.password)
    expect(result).to.have.status(200)
    expect(result.body.data).to.deep.equal(data)
  })

  it(`should be able to create a new entry, that extends data by one entry`, async () => {
    const data = { id: '4', data: 'bar'}
    await connect().post(`/api/${schema.$id}/` ).send(data).auth(credentials.login, credentials.password)
    let result = await connect().get(`/api/${schema.$id}/`).auth(credentials.login, credentials.password)
    expect(result).to.have.status(200)
    expect(result.body.data).to.be.lengthOf(4)
  })

  it(`should not be able to create a new entry without required field`, async () => {
    const data = { data: 'bar'}
    let result = await connect().post(`/api/${schema.id}/` ).send(data).auth(credentials.login, credentials.password)
    expect(result).to.have.status(400)
  })

  it(`should be able to change an entry`, async () => {
    const data = { data: 'bar'}
    var result = await connect().put(`/api/${schema.$id}/0`).send(data).auth(credentials.login, credentials.password)
    result = await connect().get(`/api/${schema.$id}/0`).auth(credentials.login, credentials.password)
    expect(result).to.have.status(200)
    expect(result.body.data).to.deep.equal({ id: '0', data: 'bar'})
  })

  it(`should receive error, when updated entry does not exist`, async () => {
    const data = { data: 'bar'}
    const result = await connect().put(`/api/${schema.$id}/5` ).send(data).auth(credentials.login, credentials.password)
    expect(result).to.have.status(400)
  })

})