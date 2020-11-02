import React, { useEffect, useState, useContext} from 'react';
import { Link, useParams } from 'react-router-dom';
import { Api, Schema } from '../api';
import { AppContext } from './App';
import { HeaderView } from './HeaderView';
import './styles/ModelView.scss'

const ModelView = () => {
  const [ model, setModel ] = useState<{ schema: Schema, data : any[] }>()
  const { modelName } = useParams<{modelName : string}>()

  const { credentials, showModal, onAuthorizationError } = useContext(AppContext);

  useEffect( () => {
    Api.getModel(modelName, credentials).then( (res) => {
      setModel(res);
    }).catch( (err) => {
      if (err.statusCode === 401) {
        onAuthorizationError && onAuthorizationError()
      } else {
        showModal && showModal('Error', err.message)
      }
    })
  },[modelName, credentials, showModal, onAuthorizationError])
  
  return(
    <div className='model-view'>
      <HeaderView backlink={`/`}/>
      <h2>{modelName} entries</h2>
      { model ?
        <ul>
        { model.data.map( (entry, i) => {
          let key = entry[model.schema.primaryKey]
          return(
            <li key={i}><Link to={`/model/${modelName}/${key}`}>{`/${modelName}/${key}`}</Link></li>
          )
        })}
        </ul>
      :
        <p>nothing</p>
      }
    </div>
  )
}

export { ModelView}