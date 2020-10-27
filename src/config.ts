import { resolve } from 'path'

const config = {
  staticDirectory : resolve(__dirname, './../frontend/build/'),
  apiPrefix : '/api'
}

export { config }