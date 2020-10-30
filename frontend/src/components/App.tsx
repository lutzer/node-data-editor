import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Api, ApiException } from '../api';
import './App.scss';
import { EntryView } from './EntryView';
import { ModelList } from './ModelList';
import { ModelView } from './ModelView';

function App() {
  const [schemas, setSchemas] = useState<any[]>([])

  // load schemas
  useEffect( () => {
    Api.getSchemas({ login: '', password: ''}).then((res) => {
      setSchemas(res.schemas)
    })
    .catch( (err : ApiException) => console.warn(err.message) )
  },[])

  return (
    <div className="app">
      <div className='content'>
        <Router>
          <Switch>
            <Route path='/:modelName/:entryId'>
              <EntryView/>
            </Route>
            <Route path='/:modelName'>
              <ModelView/>
            </Route>
            <Route path='/'>
              <ModelList schemas={schemas}/>
            </Route>
          </Switch>
        </Router>
      </div>
    </div>
  );
}

export default App;
