import React from 'react';
import { Link } from 'react-router-dom';
import { Schema } from '../api';
import { HeaderView } from './HeaderView';
import './styles/ModelList.scss'

const ModelList = ({schemas} : {schemas : Schema[]}) => {

  return(
    <div className='model-list'>
      <HeaderView/>
      <ul>
        { 
        schemas.map( (schema : Schema, i) => {
          return(
            <li key={i}><Link to={`/models/${schema.title}`}>{schema.title}</Link></li>
          )
        })
        }
      </ul>
    </div>
  )
}

export { ModelList}