import React, { useCallback, useEffect, useState } from 'react';
import { Switch, Route, useHistory } from "react-router-dom";
import { Api, ApiException, Credentials, Schema } from '../api';
import { EntryView } from './EntryView';
import { ModelList } from './ModelList';
import { ModelView } from './ModelView';
import { ModalOverlay, ModalProperties } from './ModalOverlay';
import { LoginView } from './LoginView';
import './styles/App.scss';

type AppContextType = {
  credentials? : Credentials,
  onAuthorizationError? : (path? : string) => void
  showModal? : (title: string, text: string, cancelable? : boolean) => Promise<boolean>
}

const AppContext = React.createContext<AppContextType>({});

function App() {
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [modal, setModal] = useState<ModalProperties|null>(null)
  const [credentials, setCredentials] = useState<Credentials|undefined>()

  const history = useHistory()

  const onAuthorizationError = useCallback( async (path? : string) => {
    history.push('/login/')
  },[history])

  //load data
  const loadData = useCallback( async () => {
    try {
      const data = await Api.getSchemas(credentials)
      setSchemas(data.schemas)
    } catch (err) {
      if (!(err instanceof ApiException))
        return
      if (err.statusCode === 401) 
        onAuthorizationError()
      else 
        showModal('Error', err.message)
    }
  },[credentials, onAuthorizationError])

  // set global function
  const showModal = function(title: string, text: string, cancelable : boolean = false) : Promise<boolean> {
    return new Promise( (resolve) => {
      if (cancelable)
        setModal({title: title, text: text,
          onAccept: () => { setModal(null); resolve(true) },
          onCancel: () => { setModal(null); resolve(false) }
        })
      else
        setModal({title: title, text: text, onAccept: () => { setModal(null); resolve(true) }})
    })
  }

  // load schema data
  useEffect( () => {
    loadData().then()
  },[loadData])
  

  function onLogin(c : Credentials) {
    setCredentials(c)
    history.goBack()
  }

  return (
    <div className="app">
      <div className='content'>
        <AppContext.Provider value={{ 
            credentials: credentials,
            showModal : showModal,
            onAuthorizationError : onAuthorizationError
          }}>
          <Switch>
            <Route path='/login/'>
              <LoginView onLogin={onLogin}/>
            </Route>
            <Route path='/model/:modelName/:entryId'>
              <EntryView/>
            </Route>
            <Route path='/model/:modelName'>
              <ModelView/>
            </Route>
            <Route path='/'>
              <ModelList schemas={schemas}/>
            </Route>
          </Switch>
        </AppContext.Provider>
      </div>
      { modal && <ModalOverlay title={modal.title} text={modal.text} onAccept={modal.onAccept}/>}
    </div>
  );
}

export { App, AppContext }
