const chai = require('chai');
const chaiAsPromised = require('chai-as-promised')
const _ = require('lodash');

const expect = chai.expect
chai.use(chaiAsPromised)

const { MemoryAdapter } = require('./../dist/adapter')
const { DataModel } = require('./../dist/model');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Routes Tests', () => {

  const schema = {
    title : 'testData',
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

  it('should create a new DataModel with TestAdapter that runs all methods', async () => {
    const model = createModel()
    await model.fetch()
    await model.delete(1)
    await model.set(null, { id : 3, data: 'new'})
    await model.set(0, { id : 4, data: 'changed'})
    await model.sync()
    await model.fetch()
  })

})