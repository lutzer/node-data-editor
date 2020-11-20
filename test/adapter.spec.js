const chai = require('chai');
const chaiAsPromised = require('chai-as-promised')
const nock = require('nock');
const _ = require('lodash')
const basic = require('basic-authorization-header');
const fs = require('fs').promises;

const expect = chai.expect
chai.use(chaiAsPromised)

const { RestAdapter, MemoryAdapter, FileAdapter, AdapterError } = require('./../dist/index');
const { fstat } = require('fs');

describe('RestAdapter Tests', () => {

  const apiAddress = 'http://test.com/api'
  const apiData = [ { id: '1'}, {id: '2'}, {id: '3'} ]

  it('list() should return api data', async () => {
    nock(apiAddress).get('/').reply(200, apiData);
    const adapter = new RestAdapter(apiAddress)
    const response = await adapter.list()
    expect(response).to.deep.equal(apiData)
  });

  it('read() should return api data', async () => {
    nock(apiAddress).get('/1').reply(200, apiData[0]);
    const adapter = new RestAdapter(apiAddress)
    const response = await adapter.read(1)
    expect(response).to.deep.equal(apiData[0])
  });

  it('delete() should make a succesfull request', async () => {
    nock(apiAddress).delete('/1').reply(200)
    const adapter = new RestAdapter(apiAddress)
    await adapter.delete('1')
  });

  it('create() should make a succesfull request', async () => {
    const data = { test : 'test' }
    nock(apiAddress).post('/', (body) => _.isEqual(body,data)).reply(200)
    const adapter = new RestAdapter(apiAddress)
    await adapter.create(data)
  });

  it('update() should make a succesfull request', async () => {
    const data = { test : 'test' }
    nock(apiAddress).put('/1', (body) => _.isEqual(body,data)).reply(200)
    const adapter = new RestAdapter(apiAddress)
    await adapter.update('1', data)
  });

  it('delete() should throw error on a not succesfull request', async () => {
    nock(apiAddress).delete('/1').reply(400)
    const adapter = new RestAdapter(apiAddress)
    await expect(adapter.delete('1')).to.be.rejectedWith(`Request failed with status code 400`)
  });

  it('should pass the options object to axios calls', async () => {
    const scope = nock(apiAddress, {
      reqheaders: {
        authorization: basic('test1','test2'),
      }
    }).get('/1').reply(200)
    nock(apiAddress)
    const adapter = new RestAdapter(apiAddress, { auth : { username: 'test1', password: 'test2' }})
    await adapter.read(1)
    scope.done()
  });

}); 

describe('Memory Adapter Tests', () => {

  const apiData = [ { id: '1'}, {id: '2'}, {id: '3'} ]

  function createAdapter() {
    return new MemoryAdapter(apiData, 'id')
  }

  it('list() should return api data', async () => {
    const adapter = createAdapter()
    const response = await adapter.list()
    expect(response).to.deep.equal(apiData)
  });

  it('read() should return api data', async () => {
    const adapter = createAdapter()
    const response = await adapter.read(1)
    expect(response).to.deep.equal(apiData[0])
  });

  it('delete() should make a succesfull request', async () => {
    const adapter = createAdapter()
    await adapter.delete('1')
  });

  it('create() should make a succesfull request', async () => {
    const adapter = createAdapter()
    const prevSize = adapter.data.length
    await adapter.create({ id: '5'})
    expect(adapter.data).is.lengthOf(prevSize+1)
  });

  it('update() should make a succesfull request', async () => {
    const adapter = createAdapter()
    await adapter.update('1', { id: -1})
    expect(adapter.data[0]).to.deep.equal({ id: -1})
  });

  it('delete() should throw error on a not succesfull request', async () => {
    const adapter = createAdapter()
    expect(adapter.delete('-1')).to.be.rejectedWith()
  });

}); 

describe('File Adapter Tests', () => {

  const apiData = [ { id: '1'}, {id: '2'}, {id: '3'} ]
  const filePath = 'data.json'

  function createAdapter() {
    return new FileAdapter(filePath, 'id', apiData)
  }

  beforeEach(async () => {
    try {
      await fs.unlink(filePath)
    } catch (err) {}
  })

  afterEach(async () => {
    try {
      await fs.unlink(filePath)
    } catch (err) {}
  })

  it('shoulc create a fileadapter with initial data', async () => {
    const adapter = new FileAdapter(filePath,'id',[ { id: 5 }])
    const data = await adapter.list()
    expect(data).to.be.lengthOf(1)
  });

  it('shoulc create a fileadapter without intial Data', async () => {
    const adapter = new FileAdapter(filePath,'id')
    const data = await adapter.list()
    expect(data).to.deep.equal([])
  });

  it('list() should return api data', async () => {
    const adapter = createAdapter()
    const response = await adapter.list()
    expect(response).to.deep.equal(apiData)
  });

  it('read() should return a single data entry', async () => {
    const adapter = createAdapter()
    const response = await adapter.read('1')
    expect(response).to.deep.equal(apiData[0])
  });

  it('delete() should delete an entry', async () => {
    const adapter = createAdapter()
    const prevSize = (await adapter.list()).length
    await adapter.delete('1')
    expect(await adapter.list()).be.lengthOf(prevSize - 1)
  });

  it('create() should cretae an entry', async () => {
    const adapter = createAdapter()
    const prevSize = (await adapter.list()).length
    await adapter.create({ id: '5'})
    expect(await adapter.list()).is.lengthOf(prevSize+1)
  });

  it('update() should update an entry', async () => {
    const adapter = createAdapter()
    await adapter.update('1', { id: '-1'})
    const data = await adapter.list()
    expect(data[0]).to.deep.equal({ id: '-1'})
  });

  it('update() should throw error with non existing id', async () => {
    const adapter = createAdapter()
    await expect(adapter.update('99', { id: '5' })).to.be.rejectedWith()
  });

  it('delete() should throw error with non existing id', async () => {
    const adapter = createAdapter()
    await expect(adapter.delete('-45')).to.be.rejectedWith()
  });

}); 