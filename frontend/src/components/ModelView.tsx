import React, { useEffect, useState} from 'react';
import { Link, useParams } from 'react-router-dom';
import { Api, Model } from '../api';


const ModelView = () => {
  const [ model, setModel ] = useState<Model>()
  const { modelName } = useParams<{modelName : string}>()

  useEffect( () => {
    Api.getModel(modelName, { login: '', password: ''}).then( (res) => {
      setModel(res);
    })
  },[modelName])
  
  return(
    <div className='model-view'>
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