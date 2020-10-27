import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { Api, ApiException } from '../api';
import './App.css';
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
    <div className="App">
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
  );
}

export default App;
