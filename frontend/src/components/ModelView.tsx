import _ from 'lodash';
import React, { useEffect, useState, useContext} from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Api, Schema } from '../api';
import { AppContext } from './App';
import { HeaderView } from './HeaderView';
import './styles/ModelView.scss'

const ModelView = () => {
  const [ model, setModel ] = useState<{ schema: Schema, data : any[] }>()
  const { modelName } = useParams<{modelName : string}>()

  const location = useLocation()
  const { credentials, showModal, onAuthorizationError } = useContext(AppContext);

  useEffect( () => {
    Api.getModel(modelName, credentials).then( (res) => {
      setModel(res);
    }).catch( (err) => {
      if (err.statusCode === 401) {
        onAuthorizationError(location.pathname)
      } else {
        showModal('Error', err.message)
      }
    })
  },[modelName, credentials, showModal, onAuthorizationError, location])
  
  return(
    <div className='model-view'>
      <HeaderView/>
      { model && !_.isEmpty(model.data) ?
        <ul>
        { model.data.map( (entry, i) => {
          let key = entry[model.schema.primaryKey]
          return(
            <li key={i}><Link to={`/models/${modelName}/${key}`}>{`/${modelName}/${key}`}</Link></li>
          )
        })}
        </ul>
      :
        <p className='empty-list'>No Entries</p>
      }
      <div className='footer'><button><Link to={`/create/${modelName}`}>Add Entry</Link></button></div>
    </div>
  )
}

export { ModelView}