import _ from 'lodash'

function keyEquals(key1 : any, key2: any) {
  return _.toString(key1) == _.toString(key2)
}

const checkBasicAuth = function(header : any, name: string, password: string) : boolean {
  if (!_.has(header,'authorization'))
    return false;
  let hash = 'Basic ' + Buffer.from(name+':'+password).toString('base64')
  return header.authorization == hash
}

export { keyEquals, checkBasicAuth }