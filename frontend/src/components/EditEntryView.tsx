import _ from 'lodash'
import React, { useContext, useEffect, useState} from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Api, ApiException, Schema, SchemaProperty } from '../api'
import { AppContext } from './App'
import { DeleteButton } from './DeleteButton'
import { BooleanEditView, JsonEditorView, NumberEditView, TextEditView } from './EditViews'
import { HeaderView } from './HeaderView'
import './styles/EntryView.scss'


function renderSchemaField( { key, property, value, onChange } : 
  {key : string, property : SchemaProperty, value? : any, onChange : (key : string, val: any) => void}) 
{
  if (property.type === 'string')
    return(
      <div className='edit-field'>
        <TextEditView 
          value={value || ''} 
          label={key} 
          maxLength={property.maxLength} 
          onChange={(v)=> onChange(key,v)}/>
      </div>
    ) 
  else if (property.type === 'boolean')
    return(
      <div className='edit-field'>
        <BooleanEditView 
          label={key} value={value || false} 
          onChange={(v)=> onChange(key,v)}/>
      </div>
    )
  else if (property.type === 'number')
    return(
      <div className='edit-field'>
        <NumberEditView 
          value={value} 
          min={property.minimum} 
          max={property.maximum} 
          label={key} 
          onChange={(v)=> onChange(key,v)}/>
      </div>
    )
  else if (property.type === 'object')
    return(
      <div className='edit-field'>
        <JsonEditorView 
          value={value || {}} 
          label={key} 
          onChange={(v)=> onChange(key,v)}/>
      </div>
    )
  else if (property.type === 'array')
    return(
      <div className='edit-field'>
        <JsonEditorView 
          value={value || []} 
          label={key} 
          onChange={(v)=> onChange(key,v)}/>
      </div>
    )
  else 
    return(
      <div className='edit-field'>
        <p>{JSON.stringify([key, property])}</p>
      </div>
    )
}

const EditEntryView = () => {
  const [ entry, setEntry ] = useState<{schema: Schema, data: any}|null>(null)
  const [ changes, setChanges ] = useState<object>({})
  const { modelName, entryId } = useParams<{modelName : string, entryId: string}>()
  const { credentials, showModal, onAuthorizationError } = useContext(AppContext);

  const location = useLocation()

  useEffect( () => {
    if (!modelName || !entryId)
      return
    Api.getEntry(modelName, entryId, credentials).then( (res) => {
      if (_.has(res,'data'))
        setEntry({ schema: res.schema, data: res.data })
      else
        setEntry(null)
    }).catch( (err : ApiException) => {
      if (err.statusCode === 401)
        onAuthorizationError(location.pathname)
      else
        showModal('Error', err.message)
    })
  },[modelName, entryId, credentials, onAuthorizationError, showModal, location])

  async function onDataChange(key : string, value : any) {
    if (entry && !_.isEqual(entry.data[key],value)) {
      setChanges(Object.assign({}, changes, _.set({}, key, value)))
    } else {
      setChanges(_.omit(changes, key))
    }
  }

  async function onUpdate() {
    try {
      await Api.updateEntry( modelName, entryId, changes, credentials)
      showModal && showModal('Saved', 'Entry was updated' )
    } catch (err) {
      console.log(err)
      if (err instanceof ApiException)
        showModal && showModal('Error', err.message)
    } 
  }

  async function onDelete() {
    try {
      await Api.deleteEntry(modelName, entryId, credentials)
      showModal && showModal('Deleted', 'Entry was deleted' )
    } catch (err) {
      if (err instanceof ApiException)
        showModal && showModal('Error', err.message)
    }
  }

  function renderFooter() {
    if (!entry)
      return null;
    else
      return(
        <div className='footer'>
          <div className='button-group'>
            <button onClick={() => onUpdate()} disabled={_.isEmpty(changes)}>Update</button>
            <DeleteButton onConfirm={() => onDelete()}/>
          </div>
        </div>
      )
  }
  
  return(
    <div className='entry-view'>
      <HeaderView/>
      { entry ?
        Object.entries(entry.schema.properties).map( ([key, val],i) => {
          return(
            <div key={i}>
              { renderSchemaField({ key: key, property: val, value: entry.data[key], onChange: onDataChange}) }
            </div>
          )
        })
        :
        <p className='empty-entry'>Entry does not exist.</p>
        }
        { renderFooter() }
    </div>
  )
}

export { EditEntryView, renderSchemaField }