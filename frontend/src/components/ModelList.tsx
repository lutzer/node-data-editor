import React from 'react';
import { Link } from 'react-router-dom';
import { DataSchema } from '../api';
import { HeaderView } from './HeaderView';
import './styles/ModelList.scss'

const ModelList = ({schemas} : {schemas : DataSchema[]}) => {

  return(
    <div className='model-list'>
      <HeaderView/>
      <ul>
        { 
        schemas.map( (schema : DataSchema, i) => {
          return(
            <li key={i}><Link to={`/models/${schema.id}`}>{schema.id}</Link></li>
          )
        })
        }
      </ul>
    </div>
  )
}

export { ModelList}