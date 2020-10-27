import _ from 'lodash'

function keyEquals(key1 : any, key2: any) {
  return _.toString(key1) == _.toString(key2)
}

export { keyEquals}