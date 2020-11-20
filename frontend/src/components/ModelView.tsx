import _ from 'lodash';
import React, { useEffect, useState, useContext} from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Api, ModelListResponse } from '../api';
import { AppContext } from './App';
import { HeaderView } from './HeaderView';
import './styles/ModelView.scss'

const ModelView = () => {
  const [ model, setModel ] = useState<ModelListResponse>()
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
  },[modelName, credentials]) // eslint-disable-line react-hooks/exhaustive-deps
  
  return(
    <div className='model-view'>
      <HeaderView/>
      { model && !_.isEmpty(model.entries) ?
        <ul>
        { model.entries.map( (entry, i) => {
          return(
            <li key={i}><Link to={`/models/${modelName}/${entry.$key}`}>{entry.$title}</Link></li>
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