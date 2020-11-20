const chai = require('chai');
const _ = require('lodash')
const chaiAsPromised = require('chai-as-promised')

const expect = chai.expect
chai.use(chaiAsPromised)

const { Validator } = require('./../dist/schema')

describe('Schema Tests', () => {

  it('should create a correct validator', async () => {
    const schema = {
      $id: 'test',
      properties: {
        id: { type: 'string', default: '0'},
        text: { type : 'string', default: 'nothing' }
      },
      primaryKey : 'id'
    }
    const validator = new Validator(schema)
    expect(validator.schema).to.deep.equal(schema)
  });

  it('should not create a validator with invalid type', async () => {
    const schema = {
      $id: 'test',
      properties: {
        id: { type: 'horse'},
        text: { type : 'string'}
      },
      primaryKey : 'id'
    }
    expect(() => {new Validator(schema)}).to.throw()
  });

  it('should not create a validator with invalid required value', async () => {
    const schema = {
      $id: 'test',
      properties: {
        id: { type: 'number'},
        text: { type : 'string'}
      },
      primaryKey : 'id',
      required: ['no'] 
    }
    expect(() => {new Validator(schema)}).to.throw()
  });

  it('should not create a validator with invalid default value', async () => {
    const schema = {
      $id: 'test',
      properties: {
        id: { type: 'number', default: 'peter' },
        text: { type : 'string'}
      },
      primaryKey : 'id'
    }
    expect(() => {new Validator(schema)}).to.throw()
  });

  it('should validate correct schema', async () => {
    const schema = {
      $id: 'test',
      properties: {
        id: { type: 'string' },
        text: { type: 'string' },
        object : { type: 'object' },
        array : { type: 'array' },
        boolean : { type: 'boolean' }
      },
      primaryKey : 'id'
    }
    const data = {
      id : '0',
      text: 'bla',
      object: { x: 6 },
      array : [1,2,3],
      boolean : false
    }
    const validator = new Validator(schema)
    const result = validator.test(data)
    expect(result).to.deep.equal(data)
  });

  it('should throw error on validating incorrect schema', async () => {
    const schema = {
      $id: 'test',
      properties: {
        id: { type: 'string' }
      },
      primaryKey : 'id'
    }
    const validator = new Validator(schema)
    expect(() => validator.test({ id : 0})).to.throw()
  });

  it('validation should throw error if required value is not supplied', async () => {
    const schema = {
      $id: 'test',
      properties: {
        id: { type: 'string' },
        text: { type: 'string' }
      },
      primaryKey : 'id',
      required : ['text']
    }
    const validator = new Validator(schema)
    expect( () => validator.test({ id : 0}) ).to.throw()
  });

  it('validation should set default value if its not supplied for string', async () => {
    const schema = {
      $id: 'test',
      properties: {
        id: { type: 'string' },
        text: { type: 'string', default : 'test' }
      },
      primaryKey : 'id'
    }
    const validator = new Validator(schema)
    const result = validator.test({id : '3'})
    expect(result.text).to.be.equal('test')
  });

  it.skip('validation should set default value if data provides empty string', async () => {
    const schema = {
      $id: 'test',
      properties: {
        id: { type: 'string' },
        text: { type: 'string', default : 'test' }
      },
      primaryKey : 'id'
    }
    const validator = new Validator(schema)
    const result = validator.test({id : '3', text: ''})
    expect(result.text).to.be.equal('test')
  });

  it('validation should set default value if its not supplied for array', async () => {
    const schema = {
      $id: 'test',
      properties: {
        id: { type: 'string' },
        list: { type: 'array', default : [1,2,3] }
      },
      primaryKey : 'id'
    }
    const validator = new Validator(schema)
    const result = validator.test({id : '3'})
    expect(result.list).to.deep.equal([1,2,3])
  });

  it.skip('validation should not allow empty string as primaryKey', async () => {
    const schema = {
      $id: 'test',
      properties: {
        id: { type: 'string' }
      },
      primaryKey : 'id'
    }
    const validator = new Validator(schema)
    expect( () => validator.test({ id : ''}) ).to.throw()
  });

  it('validation should set minLength of required strings to 1', async () => {
    const schema = {
      $id: 'test',
      properties: {
        id: { type: 'string' },
        text: { type: 'string', default : 'test' },
        foo: { type: 'string' },
      },
      primaryKey : 'id',
      required : ['id','text']
    }
    const validator = new Validator(schema)
    expect( () => validator.test({ id : ''}) ).to.throw()
    expect( () => validator.test({ id : '1', text: ''}) ).to.throw()
    expect(validator.test({ id : '1', foo: 'test3'})).to.deep.equal({ id : '1', text: 'test', foo: 'test3'})
    expect(validator.test({ id : '1', text: 'test2'})).to.deep.equal({ id : '1', text: 'test2'})
  });

}); 