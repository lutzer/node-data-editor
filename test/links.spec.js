const chai = require('chai');
const chaiAsPromised = require('chai-as-promised')
const _ = require('lodash');

const expect = chai.expect
chai.use(chaiAsPromised)

const { MemoryAdapter } = require('./../dist/adapter')
const { DataModel } = require('./../dist/model');


describe('DataModel Links', () => {

  function createModels() {
    const foo = new DataModel({ 
      schema: {
        $id : 'foo',
        properties: {
          id: { type: 'string' },
          text: { type : 'string' }
        },
        primaryKey : 'id',
        links : [
          { model: 'bar', key: 'id', foreignKey: 'fooId' },
          { model: 'bar2', key: 'id', foreignKey: 'fooId' }
        ]
      }, 
      adapter : new MemoryAdapter([
        { id: '0', text: 'foo'},
        { id: '1', text: 'foo'},
        { id: '2', text: 'foo'},
      ],'id')
    })

    const bar = new DataModel({ 
      schema: {
        $id : 'bar',
        properties: {
          id: { type: 'string' },
          fooId : { type : 'string' },
          text: { type : 'string' }
        },
        primaryKey : 'id',
      }, 
      adapter : new MemoryAdapter([
        { id: '0', fooId: '0', text: 'bar'},
        { id: '1', fooId: '0', text: 'bar'},
        { id: '2', fooId: '1', text: 'bar'},
      ],'id')
    })

    const bar2 = new DataModel({ 
      schema: {
        $id : 'bar2',
        properties: {
          id: { type: 'string' },
          fooId : { type : 'string' },
          text: { type : 'string' }
        },
        primaryKey : 'id',
        links : [ { model: 'foo', key: 'id', foreignKey: 'fooId' } ]
      }, 
      adapter : new MemoryAdapter([
        { id: '0', fooId: '1', text: 'bar2'},
        { id: '1', fooId: '1', text: 'bar2'},
        { id: '2', fooId: '1', text: 'bar2'},
      ],'id')
    })
    return [foo,bar,bar2]
  }

  it('should fetch 2,0 links for model foo', async () => {
    const models = createModels()
    const entry = await models[0].get('0')
    const links = await models[0].getLinks(entry, models)
    expect(links[0].entries).to.be.lengthOf(2)
    expect(links[1].entries).to.be.lengthOf(0)
  });

  it('should fetch 1,3 link for model foo', async () => {
    const models = createModels()
    const entry = await models[0].get('1')
    const links = await models[0].getLinks(entry, models)
    expect(links[0].entries).to.be.lengthOf(1)
    expect(links[1].entries).to.be.lengthOf(3)
  });

  it('should fetch 0,0 links for model foo', async () => {
    const models = createModels()
    const entry = await models[0].get('2')
    const links = await models[0].getLinks(entry, models)
    expect(links[0].entries).to.be.lengthOf(0)
    expect(links[1].entries).to.be.lengthOf(0)
  });

  it('should not fetch any links for model bar', async () => {
    const models = createModels()
    const entry = await models[1].get('0')
    const links = await models[1].getLinks(entry, models)
    expect(links).to.deep.equal([])
  });

  it('should not fetch any links for model bar2, because of wrong definitions', async () => {
    const models = createModels()
    const entry = await models[2].get('0')
    const links = await models[2].getLinks(entry, models)
    expect(links[0].entries).to.be.lengthOf(0)
  });

  it('should set key and title of a link', async () => {
    const models = createModels()
    const entry = await models[0].get('1')
    const links = await models[0].getLinks(entry, models)
    expect(links[0].entries[0].key).to.not.be.undefined
    expect(links[0].entries[0].title).to.not.be.undefined
  })
}); 