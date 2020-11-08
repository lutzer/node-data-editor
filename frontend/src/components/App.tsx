import React, { useCallback, useEffect, useState } from 'react';
import { Switch, Route, useHistory, Redirect } from "react-router-dom";
import { Api, ApiException, Credentials, Entry, DataSchema } from '../api';
import { EditEntryView } from './EditEntryView';
import { ModelList } from './ModelList';
import { ModelView } from './ModelView';
import { ModalOverlay, ModalProperties } from './ModalOverlay';
import { LoginView } from './LoginView';
import './styles/App.scss';
import { CreateEntryView } from './CreateEntryView';

type AppContextType = {
  credentials : Credentials,
  onAuthorizationError : (path? : string) => void
  showModal : (title: string, text: string, cancelable? : boolean) => Promise<boolean>
}

const AppContext = React.createContext<AppContextType>({
  credentials : { login: '', password: ''},
  onAuthorizationError : () => {},
  showModal : () => Promise.resolve(false)
});

function App() {
  const [schemas, setSchemas] = useState<DataSchema[]>([])
  const [modal, setModal] = useState<ModalProperties|null>(null)
  const [credentials, setCredentials] = useState<Credentials>({ login: '', password: '' })
  const [prevPath, setPrevPath ] = useState<string>('/models')
  const history = useHistory()

  const onAuthorizationError = useCallback( async (path? : string) => {
    path && setPrevPath(path)
    history.push('/login')
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
  },[credentials]) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (history.location.pathname !== prevPath)
      history.push(prevPath)
  }

  // function onLogout() {
  //   setCredentials({ login: '', password: '' })
  // }

  function onUpdate(entry : Entry, newEntry : boolean = false) {
    history.push(`/models/${entry.schema.$id}/${entry.data[entry.schema.primaryKey]}`)
    if (newEntry)
      showModal('Created', 'Entry was created.' )
    else
      showModal('Created', 'Entry was updated.' )
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
            <Route path='/models/:modelName/:entryId'>
              <EditEntryView onUpdatedEntry={(e) => onUpdate(e,false)}/>
            </Route>
            <Route path='/models/:modelName'>
              <ModelView/>
            </Route>
            <Route path='/models'>
              <ModelList schemas={schemas}/>
            </Route>
            <Route path='/create/:modelName'>
              <CreateEntryView onNewEntry={(e) => onUpdate(e,true)}/>
            </Route>
            <Route path='/login'>
              <LoginView onLogin={onLogin}/>
            </Route>
            <Route path='/'>
              <Redirect to='/models'/>
            </Route>
          </Switch>
        </AppContext.Provider>
      </div>
      { modal && <ModalOverlay title={modal.title} text={modal.text} onAccept={modal.onAccept}/>}
    </div>
  );
}

export { App, AppContext }
