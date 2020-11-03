import React, { useContext, useState } from 'react'
import { Api, ApiException, Credentials } from '../api'
import { AppContext } from './App'
import { HeaderView } from './HeaderView'
import './styles/LoginView.scss'


const LoginView = ({ onLogin } : { onLogin : (c: Credentials) => void }) => {
  const [ login, setLogin ] = useState<string>('')
  const [ password, setPassword ] = useState<string>('')

  const { showModal } = useContext(AppContext)

  async function onLoginClicked() {
    let credentials : Credentials = { login: login, password: password }
    await Api.checkCredentials(credentials).then( (res) => {
      onLogin(credentials)
    }).catch( (err : ApiException) => {
      if (err.statusCode === 401)
        showModal('Not Authorized', "Login or password is wrong.")
      else
        showModal('Error', err.message)
    })
  }
  
  return(
    <div className='login-view'>
      <HeaderView/>
      <h2>Login</h2>
      <div className='flex-container'>
        <div className='input-wrapper'>
          <div className='input-element'>
            <input type='text' placeholder='Login' onChange={(e) => setLogin(e.target.value)}/>
          </div>
        </div>
        <div className='input-wrapper'>
          <div className='input-element'>
            <input type='password' placeholder='Password' onChange={(e) => setPassword(e.target.value)}/>
          </div>
        </div>
        <button disabled={login.length < 3 || password.length < 3} onClick={() => onLoginClicked() }>Login</button>
      </div>
    </div>
  )
}

export { LoginView }