import _ from 'lodash'
import React, { useContext, useEffect, useState} from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Api, ApiException, Entry, Schema } from '../api'
import { AppContext } from './App'
import { renderSchemaField } from './EditEntryView'
import { HeaderView } from './HeaderView'
import './styles/EntryView.scss'

const CreateEntryView = ({ onNewEntry } : { onNewEntry : (res: Entry) => void}) => {
  const [ schema, setSchema ] = useState<Schema|null>(null)
  const [ data, setData ] = useState<object>({})
  const { modelName } = useParams<{modelName : string}>()
  const { credentials, showModal, onAuthorizationError } = useContext(AppContext);

  const location = useLocation()

  useEffect( () => {
    if (!modelName)
      return
    Api.getSchemas(credentials).then( (res) => {
      setSchema(res.schemas.find( (s) => s.title === modelName) || null)
    }).catch( (err : ApiException) => {
      if (err.statusCode === 401)
        onAuthorizationError(location.pathname)
      else
        showModal('Error', err.message)
    })
  },[modelName, credentials, onAuthorizationError, showModal, location])

  async function onDataChange(key : string, value : any) {
    setData(_.set(data, key, value))
  }

  async function onCreate() {
    try {
      const result = await Api.createEntry( modelName, data, credentials)
      onNewEntry(result)
    } catch (err) {
      if (err instanceof ApiException)
        showModal && showModal('Error', err.message)
    } 
  }

  function renderFooter() {
    if (!schema)
      return null;
    else
      return(
        <div className='footer'>
          <div className='button-group'>
            <button onClick={() => onCreate()}>Create</button>
          </div>
        </div>
      )
  }
  
  return(
    <div className='entry-view'>
      <HeaderView/>
      { schema ?
        Object.entries(schema.properties).map( ([key, val],i) => {
          return (
            <div key={i}>
              { renderSchemaField({key: key, property: val, value: val.default, onChange : onDataChange}) }
            </div>
          )
        })
        :
        <p className='empty-entry'>Model does not exist.</p>
        }
        { renderFooter() }
    </div>
  )
}

export { CreateEntryView }