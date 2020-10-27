const chai = require('chai');
const chaiAsPromised = require('chai-as-promised')
const nock = require('nock');
const _ = require('lodash')

const expect = chai.expect
chai.use(chaiAsPromised)

const { RestAdapter, MemoryAdapter } = require('./../dist/adapter')
const { DataModel } = require('./../dist/model');
const { create } = require('lodash');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const apiAddress = 'http://test.com/api'
const apiData = [ { id: 0, text: 'test1'}, {id: 1, text: 'test2' }, {id: 2, text: 'test3'} ] 
const schema = {
  title : 'testData',
  properties: {
    id: { type: 'number'},
    text: { type : 'string'}
  }
}

describe('DataModel Tests', () => {

  function createModel() {
    return new DataModel({ schema: schema, key: 'id', adapter : new MemoryAdapter([
      { id: 0, text: 'foo'},
      { id: 1, text: 'foo'},
      { id: 2, text: 'foo'},
    ])})
  }

  
  it('should create data model', async () => {
    const model = createModel()
  })

  it('should not create a data model with the wrong key', async () => {
    expect( () => { 
      new DataModel({ 
        schema: schema, 
        key: 'title', 
        adapter: new TestAdapter()}) 
      }
    ).to.throw()
  })

  it('should be able to fetch entries', async () => {
    const model = createModel()
    await model.fetch()
    expect(model.data).is.lengthOf(3)
  })

  it('should be able to delete entry', async () => {
    const model = createModel()
    await model.fetch()
    const numberOfEntries = model.data.length
    await model.delete(0)
    await model.sync()
    await model.fetch()
    expect(model.data).is.lengthOf(numberOfEntries-1)
  })

  it('should be able to update entry', async () => {
    const model = createModel()
    await model.fetch()
    await model.set(0, { id: 5, text: 'changed'})
    await model.sync()
    await model.fetch()
    expect(model.get(5)).to.deep.equal({ id: 5, text :'changed'})
  })

  it('should be able to update entry multiple times', async () => {
    const model = createModel()
    await model.fetch()
    await model.set(0, { id: 5, text: 'changed'})
    await model.set(5, { id: 7, text: 'changed2'})
    await model.sync()
    await model.fetch()
    expect(model.get(7)).to.deep.equal({ id: 7, text :'changed2'})
  })

  it('should be able to create a new entry', async () => {
    const model = createModel()
    await model.fetch()
    await model.set(null, { id: 5, text: 'new'})
    await model.sync()
    await model.fetch()
    expect(model.get(5)).to.deep.equal({ id: 5, text :'new'})
  })

  it('should not be able to update a property that does not exist in the scheme', async () => {
    const model = createModel()
    await model.fetch()
    await model.set(null, { id: 5, title: 'hey'})
    expect(model.get(5)).to.not.have.property('title')
  })

})

describe('DataModel API Call Tests', () => {


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
    const model = new DataModel({ schema: {
      title: 'test', properties : { title : { type : 'string'}, data : { type : 'string' } }
    }, key: 'title', adapter: new RestAdapter(apiAddress)})
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