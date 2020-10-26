const chai = require('chai');
const _ = require('lodash')

const expect = chai.expect

const { Validator } = require('./../dist/schema')

describe('Schema Tests', () => {

  it('should create a correct validator', async () => {
    const schema = {
      title: 'test',
      properties: {
        id: { type: 'number', default: 0},
        text: { type : 'string', required : true, default: 'nothing' }
      }
    }
    const validator = new Validator(schema)
    expect(validator.schema).to.deep.equal(schema)
  });

  it('should not create a validator with invalid type', async () => {
    const schema = {
      title: 'test',
      properties: {
        id: { type: 'horse'},
        text: { type : 'string'}
      }
    }
    expect(() => {new Validator(schema)}).to.throw()
  });

  it('should not create a validator with invalid required value', async () => {
    const schema = {
      title: 'test',
      properties: {
        id: { type: 'number'},
        text: { type : 'string'}
      },
      required: ['no'] 
    }
    expect(() => {new Validator(schema)}).to.throw()
  });

  it('should not create a validator with invalid default value', async () => {
    const schema = {
      title: 'test',
      properties: {
        id: { type: 'number', default: 'peter' },
        text: { type : 'string'}
      }
    }
    expect(() => {new Validator(schema)}).to.throw()
  });

  it('should validate correct schema', async () => {
    const schema = {
      title: 'test',
      properties: {
        id: { type: 'number' },
        text: { type: 'string' },
        object : { type: 'object' },
        array : { type: 'array' },
        boolean : { type: 'boolean' }
      }
    }
    const data = {
      id : 0,
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
      title: 'test',
      properties: {
        id: { type: 'number' }
      }
    }
    const validator = new Validator(schema)
    expect( () => validator.test({ id : 'ouch'}) ).to.throw()
  });

  it('validation should throw error if required value is not supplied', async () => {
    const schema = {
      title: 'test',
      properties: {
        id: { type: 'number' },
        text: { type: 'string' }
      },
      required : ['text']
    }
    const validator = new Validator(schema)
    expect( () => validator.test({ id : 0}) ).to.throw()
  });

  it('validation should set default value if its not supplied for string', async () => {
    const schema = {
      title: 'test',
      properties: {
        id: { type: 'number' },
        text: { type: 'string', default : 'test' }
      }
    }
    const validator = new Validator(schema)
    const result = validator.test({id : 3})
    expect(result.text).to.be.equal('test')
  });

  it('validation should set default value if its not supplied for array', async () => {
    const schema = {
      title: 'test',
      properties: {
        id: { type: 'number' },
        list: { type: 'array', default : [1,2,3] }
      }
    }
    const validator = new Validator(schema)
    const result = validator.test({id : 3})
    expect(result.list).to.deep.equal([1,2,3])
  });

}); 