import React from 'react';
import { Link } from 'react-router-dom';
import { Schema } from '../api';


const ModelList = ({schemas} : {schemas : Schema[]}) => {

  return(
    <div className='model-list'>
      <h2>Datasets</h2>
      <ul>
        { 
        schemas.map( (schema : Schema, i) => {
          return(
            <li key={i}><Link to={`/${schema.title}`}>{schema.title}</Link></li>
          )
        })
        }
      </ul>
    </div>
  )
}

export { ModelList}