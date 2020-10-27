import React, { useEffect, useState} from 'react';
import { Link, useParams } from 'react-router-dom';
import { Api, Schema } from '../api';


const EntryView = () => {
  const [ schema, setSchema ] = useState<Schema>()
  const [ data, setData ] = useState<any>()
  const { modelName, entryId } = useParams<{modelName : string, entryId: string}>()

  useEffect( () => {
    if (!modelName || !entryId)
      return
    Api.getEntry(modelName, entryId, { login: '', password: ''}).then( (res) => {
      setSchema(res.schema);
      setData(res.data);
    })
  },[modelName, entryId])
  
  return(
    <div className='entry-view'>
      { data ?
        <p>{JSON.stringify(data)}</p>
      :
        <p>nothing</p>
      }
    </div>
  )
}

export { EntryView}