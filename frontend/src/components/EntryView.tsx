import _ from 'lodash'
import React, { useContext, useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'
import { Api, ApiException, Schema } from '../api'
import { AppContext } from './App'
import { DeleteButton } from './DeleteButton'
import { BooleanEditView, JsonEditorView, NumberEditView, TextEditView } from './EditViews'
import { HeaderView } from './HeaderView'
import './styles/EntryView.scss'

const EntryView = () => {
  const [ entry, setEntry ] = useState<{schema: Schema, data: any}|null>(null)
  const [ changes, setChanges ] = useState<object>({})
  const { modelName, entryId } = useParams<{modelName : string, entryId: string}>()
  const { credentials, showModal, onAuthorizationError } = useContext(AppContext);

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
        onAuthorizationError()
      else
        showModal('Error', err.message)
    })
  },[modelName, entryId, credentials, onAuthorizationError, showModal])

  async function onDataChange(key : string, value : any) {
    if (entry && !_.isEqual(entry.data[key],value)) {
      setChanges(Object.assign({}, changes, _.set({}, key, value)))
    } else {
      setChanges(_.omit(changes, key))
    }
  }

  async function onSave() {
    try {
      await Api.updateEntry( modelName, entryId, changes, credentials)
      showModal && showModal('Saved', 'Entry was updated' )
    } catch (err) {
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
  
  return(
    <div className='entry-view'>
      <HeaderView/>
      { entry ?
        Object.entries(entry.schema.properties).map( ([key, val],i) => {
          if (val.type === 'string')
            return(
              <div key={i} className='edit-field'>
                <TextEditView 
                  text={entry.data[key]} 
                  label={key} 
                  maxLength={val.maxLength} 
                  onChange={(v)=> onDataChange(key,v)}/>
              </div>
            ) 
          else if (val.type === 'boolean')
          return(
            <div  key={i} className='edit-field'>
              <BooleanEditView 
                label={key} value={entry.data[key]} 
                onChange={(v)=> onDataChange(key,v)}/>
            </div>
          )
          else if (val.type === 'number')
          return(
            <div key={i} className='edit-field'>
              <NumberEditView 
                value={entry.data[key]} 
                min={val.minimum} 
                max={val.maximum} 
                label={key} 
                onChange={(v)=> onDataChange(key,v)}/>
            </div>
          )
          else if (val.type === 'object' || val.type === 'array')
          return(
            <div key={i} className='edit-field'>
              <JsonEditorView 
                value={entry.data[key]} 
                label={key} 
                onChange={(v)=> onDataChange(key,v)}/>
            </div>
          )
          else 
          return(
            <div key={i} className='edit-field'>
              <p>{JSON.stringify([key,val])}</p>
            </div>
          )
        })
        :
        <p className='empty-entry'>Entry does not exist</p>
      }
      { entry && 
      <div className='footer'>
        <div className='button-group'>
          <button onClick={() => onSave()} disabled={_.isEmpty(changes)}>Save</button>
          <DeleteButton onConfirm={() => onDelete()}/>
        </div>
      </div>
      }
    </div>
  )
}

export { EntryView}