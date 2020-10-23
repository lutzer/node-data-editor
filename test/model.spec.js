const chai = require('chai');
const chaiAsPromised = require('chai-as-promised')
const nock = require('nock');
const _ = require('lodash')

const expect = chai.expect
chai.use(chaiAsPromised)

const { RestAdapter } = require('./../dist/adapter')
const { DataModel } = require('./../dist/model');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('DataModel Tests', () => {

  const apiAddress = 'http://test.com/api'
  const apiData = [ { id: 0, text: 'test1'}, {id: 1, text: 'test2' }, {id: 2, text: 'test3'} ] 
  const schema = {
    id: { type: 'number'},
    text: { type : 'string'}
  }

  it('should create data model', async () => {
    const model = new DataModel({
      id: { type: 'number'},
      text: { type : 'string'}
    },new RestAdapter(apiAddress))
  });

  it('should fetch data from api', async () => {
    nock(apiAddress).get('/').reply(200, apiData);
    const model = new DataModel({ schema: schema, adapter: new RestAdapter(apiAddress)})
    await model.fetch()
    expect(model.data).to.deep.equal(apiData)
  });

  it('should return model by id', async () => {
    nock(apiAddress).get('/').reply(200, apiData);
    const model = new DataModel({ schema: schema, adapter: new RestAdapter(apiAddress)})
    await model.fetch()
    expect(model.get(0)).to.deep.equal(apiData[0])
  });

  it('should work with custom key', async () => {
    nock(apiAddress).get('/').reply(200, [ {title: 'test1', data: 'x'}, { title: 'test2', data: 'y'} ]);
    const model = new DataModel({ schema: schema, key: 'title', adapter: new RestAdapter(apiAddress)})
    await model.fetch()
    expect(model.get('test2')).to.deep.equal({ title: 'test2', data: 'y' })
  })

  it('should be able to change data in model', async () => {
    nock(apiAddress).get('/').reply(200, apiData);
    const model = new DataModel({ schema: schema, adapter: new RestAdapter(apiAddress)})
    await model.fetch()
    model.set(1,{ text: 'changed' })
    expect(model.get(1).text).to.be.equal('changed')
  });

  it('should be able to delete an entry', async () => {
    nock(apiAddress).get('/').reply(200, apiData);
    const model = new DataModel({ schema: schema, adapter: new RestAdapter(apiAddress)})
    await model.fetch()
    model.delete(2)
    expect(model.data.length).to.be.equal(2)
  });

  it('should sync deletes to the server', async() => {
    nock(apiAddress).get('/').reply(200, apiData);
    const scope = nock(apiAddress).delete('/1').reply(200)
    const model = new DataModel({ schema: schema, adapter: new RestAdapter(apiAddress)})
    await model.fetch()
    model.delete(1)
    await model.sync()
    scope.done()
  })

  it('should sync data changes to the server', async() => {
    nock(apiAddress).get('/').reply(200, apiData);
    const model = new DataModel({ schema: schema, adapter: new RestAdapter(apiAddress)})
    await model.fetch()
    model.set(1,{ text : 'changed'})
    const scope = nock(apiAddress).put('/1', (body) => _.isEqual(body,model.get(1))).reply(200)
    await model.sync()
    scope.done()
  })

  it('should create a new entry on the server', async() => {
    nock(apiAddress).get('/').reply(200, apiData);
    const model = new DataModel({ schema: schema, adapter: new RestAdapter(apiAddress)})
    await model.fetch()
    model.set(null,{ id: 4, text: 'test4' })
    const scope = nock(apiAddress).post('/', (body) => _.isEqual(body,model.get(4)) ).reply(200)
    await model.sync()
    scope.done()
  })

}); 