import React, { useEffect, useState} from 'react';
import { Link, useParams } from 'react-router-dom';
import { Api, getCredentials, Schema } from '../api';


const ModelView = () => {
  const [ model, setModel ] = useState<{ schema: Schema, data : any[] }>()
  const { modelName } = useParams<{modelName : string}>()

  useEffect( () => {
    Api.getModel(modelName, getCredentials()).then( (res) => {
      setModel(res);
    })
  },[modelName])
  
  return(
    <div className='model-view'>
      <Link to={`/`}>Back</Link>
      <h2>{modelName} entries</h2>
      { model ?
        <ul>
        { model.data.map( (entry, i) => {
          let key = entry[model.schema.primaryKey]
          return(
            <li key={i}><Link to={`/${modelName}/${key}`}>{`/${modelName}/${key}`}</Link></li>
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