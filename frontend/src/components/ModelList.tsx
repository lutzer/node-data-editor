import React from 'react';
import { Link } from 'react-router-dom';
import { Schema } from '../api';
import { HeaderView } from './HeaderView';
import './styles/ModelList.scss'

const ModelList = ({schemas} : {schemas : Schema[]}) => {

  return(
    <div className='model-list'>
      <HeaderView/>
      <h2>Datasets</h2>
      <ul>
        { 
        schemas.map( (schema : Schema, i) => {
          return(
            <li key={i}><Link to={`/model/${schema.title}`}>{schema.title}</Link></li>
          )
        })
        }
      </ul>
    </div>
  )
}

export { ModelList}