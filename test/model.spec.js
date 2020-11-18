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
const apiData = [ { id: '0', text: 'test1'}, {id: '1', text: 'test2' }, {id: '2', text: 'test3'} ] 
const schema = {
  $id : 'testData',
  properties: {
    id: { type: 'string' },
    text: { type : 'string' }
  },
  primaryKey : 'id'
}

describe('DataModel Tests', () => {

  function createModel() {
    return new DataModel({ schema: schema, adapter : new MemoryAdapter([
      { id: '0', text: 'foo'},
      { id: '1', text: 'foo'},
      { id: '2', text: 'foo'},
    ],'id')})
  }

  
  it('should create data model', async () => {
    const model = createModel()
  })

  it('should not create a data model with the wrong key', async () => {
    expect( () => { 
      new DataModel({ 
        schema: schema,
        adapter: new TestAdapter()}) 
      }
    ).to.throw()
  })

  it('should be able to fetch entries', async () => {
    const model = createModel()
    const entries = await model.list()
    expect(entries).is.lengthOf(3)
    expect(entries[0].$key).to.be.string
    expect(entries[0].$title).to.be.string
  })

  it('should be able to fetch a single entries', async () => {
    const model = createModel()
    expect(await model.get(0)).to.be.not.empty
    expect(await model.get('0')).to.be.not.empty
    const entry = await model.get('0')
    expect(entry.$key).to.be.string
    expect(entry.$title).to.be.string
  })

  it('should be able to get a single entry by number', async () => {
    const model = createModel()
    expect((await model.get(0)).data).to.deep.equal({ id: '0', text: 'foo'})
    expect((await model.get(2)).data).to.deep.equal({ id: '2', text: 'foo'})
  })

  it('should be able to get a single entry by string', async () => {
    const model = createModel()
    expect((await model.get('0')).data).to.deep.equal({ id: '0', text: 'foo'})
    expect((await model.get('2')).data).to.deep.equal({ id: '2', text: 'foo'})
  })


  it('should be able to delete entry by number', async () => {
    const model = createModel()
    const numberOfEntries = (await model.list()).length
    await model.delete(0)
    await model.delete(2)
    const entries = await model.list()
    expect(entries).is.lengthOf(numberOfEntries-2)
  })

  it('should be able to delete entry by string', async () => {
    const model = createModel()
    const numberOfEntries = (await model.list()).length
    await model.delete('0')
    await model.delete('2')
    const entries = await model.list()
    expect(entries).is.lengthOf(numberOfEntries-2)
  })

  it('should be able to update entry', async () => {
    const model = createModel()
    const entry = await model.update('0', { id: '5', text: 'changed'})
    expect(entry.$key).to.be.string
    expect(entry.$title).to.be.string
    expect((await model.get(5)).data).to.deep.equal({ id: '5', text :'changed'})
  })

  it('should be able to update entry multiple times', async () => {
    const model = createModel()
    await model.update('0', { id: '5', text: 'changed'})
    await model.update('5', { id: '7', text: 'changed2'})
    await model.update('7', { id: '8', text: 'changed3'})
    expect(await model.get('0')).to.be.undefined
    expect(await model.get('5')).to.be.undefined
    expect(await model.get('7')).to.be.undefined
    expect((await model.get('8')).data).to.deep.equal({ id: '8', text :'changed3'})
  })

  it('should be able to create a new entry', async () => {
    const model = createModel()
    const entry = await model.create({ id: '5', text: 'new'})
    expect(entry.data).to.deep.equal({ id: '5', text :'new'})
    expect(entry.$key).to.be.string
    expect(entry.$title).to.be.string
    expect((await model.get(5)).data).to.deep.equal({ id: '5', text :'new'})
  })

  it('should not be able to update a property that does not exist in the scheme', async () => {
    const model = createModel()
    await model.create({ id: '5', title: 'hey'})
    expect(await model.get(5)).to.not.have.property('title')
  })

  it('should format title like defined in template', async () => {
    const model = new DataModel({ schema: {
      $id : 'testData',
      properties: {
        id: { type: 'string' },
        text: { type : 'string' }
      },
      primaryKey : 'id',
      titleTemplate: '<%= text %>'
    }, adapter : new MemoryAdapter([
      { id: '0', text: 'foo'}
    ],'id')})
    const entry = await model.get(0)
    expect(entry.$title).to.equal('foo')
  })
})

describe('DataModel API Call Tests', () => {


  it('should fetch data from api', async () => {
    nock(apiAddress).get('/').reply(200, apiData);
    const model = new DataModel({ schema: schema, adapter: new RestAdapter(apiAddress)})
    expect((await model.list()).map( (e) => e.data)).to.deep.equal(apiData)
  });

  it('should return model by id', async () => {
    nock(apiAddress).get('/0').reply(200, apiData[0]);
    const model = new DataModel({ schema: schema, adapter: new RestAdapter(apiAddress)})
    expect((await model.get(0)).data).to.deep.equal(apiData[0])
  });

  it('should work with custom key', async () => {
    nock(apiAddress).get('/test2').reply(200, { title: 'test2', data: 'y'});
    const model = new DataModel({ schema: {
      $id: 'test', 
      properties : { 
        title : { type : 'string'}, 
        data : { type : 'string' }
      }, primaryKey: 'title'
    }, adapter: new RestAdapter(apiAddress)})
    expect((await model.get('test2')).data).to.deep.equal({ title: 'test2', data: 'y' })
  })

  it('should be able to change data in model', async () => {
    nock(apiAddress).get('/1').reply(200, apiData[1]);
    const model = new DataModel({ schema: schema, adapter: new RestAdapter(apiAddress)})
    const scope = nock(apiAddress).put('/1', (body) => _.isEqual(body.text, 'changed') ).reply(200)
    await model.update('1',{ text: 'changed' })
    scope.done()
  });

  it('should be able to delete an entry', async () => {
    nock(apiAddress).get('/').reply(200, apiData);
    const model = new DataModel({ schema: schema, adapter: new RestAdapter(apiAddress)})
    const scope = nock(apiAddress).delete('/2').reply(200)
    await model.delete('2')
    scope.done()
  });

  it('should sync deletes to the server', async() => {
    nock(apiAddress).get('/').reply(200, apiData);
    const scope = nock(apiAddress).delete('/1').reply(200)
    const model = new DataModel({ schema: schema, adapter: new RestAdapter(apiAddress)})
    await model.delete(1)
    scope.done()
  })

  it('should create a new entry on the server', async() => {
    nock(apiAddress).get('/').reply(200, apiData);
    const model = new DataModel({ schema: schema, adapter: new RestAdapter(apiAddress)})
    const scope = nock(apiAddress).post('/', (body) => _.isEqual(body, { id: '4', text: 'test4' }) ).reply(200)
    await model.create({ id: '4', text: 'test4' })
    scope.done()
  })



});
