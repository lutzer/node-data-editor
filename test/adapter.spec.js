const expect = require('chai').expect;
const nock = require('nock');
const _ = require('lodash')

const { RestAdapter } = require('./../dist/adapter')

describe('RestAdapter Tests', () => {

  const apiAddress = 'http://test.com/api'
  const apiData = [ { id: 1}, {id: 2}, {id: 3} ]

  it('read() should return api data', async () => {
    nock(apiAddress).get('/').reply(200, apiData);
    const adapter = new RestAdapter(apiAddress)
    const response = await adapter.read()
    expect(response).to.deep.equal(apiData)
  });

  it('delete() should make a succesfull request', async () => {
    nock(apiAddress).delete('/1').reply(200)
    const adapter = new RestAdapter(apiAddress)
    const response = await adapter.delete('1')
  });

  it('write() should make a succesfull request', async () => {
    const data = { test : 'test' }
    nock(apiAddress).post('/', (body) => _.isEqual(body,data)).reply(200)
    const adapter = new RestAdapter(apiAddress)
    const response = await adapter.write(data)
  });
}); 