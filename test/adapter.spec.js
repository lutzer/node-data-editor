const chai = require('chai');
const chaiAsPromised = require('chai-as-promised')
const nock = require('nock');
const _ = require('lodash')

const expect = chai.expect
chai.use(chaiAsPromised)

const { RestAdapter } = require('./../dist/adapter')

describe('RestAdapter Tests', () => {

  const apiAddress = 'http://test.com/api'
  const apiData = [ { id: 1}, {id: 2}, {id: 3} ]

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

}); 