import _ from 'lodash'
import React, { useContext, useEffect, useState} from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { Api, ApiException, DataSchemaProperty, DataEntry, DataModelLink, DataSchema, ModelEntryResponse } from '../api'
import { AppContext } from './App'
import { DeleteButton } from './DeleteButton'
import { BooleanEditView, JsonEditorView, NumberEditView, TextEditView } from './EditViews'
import { HeaderView } from './HeaderView'
import './styles/EntryView.scss'


function renderSchemaField( { key, property, value, onChange } : 
  {key : string, property : DataSchemaProperty, value? : any, onChange : (key : string, val: any) => void}) 
{
  const propertyType = _.isArray(property.type) ? property.type[0] : property.type
  if (propertyType === 'string')
    return(
      <div className='edit-field'>
        <TextEditView 
          value={value || ''} 
          label={key} 
          maxLength={property.maxLength} 
          onChange={(v)=> onChange(key,v)}/>
      </div>
    ) 
  else if (propertyType === 'boolean')
    return(
      <div className='edit-field'>
        <BooleanEditView 
          label={key} value={value || false} 
          onChange={(v)=> onChange(key,v)}/>
      </div>
    )
  else if (propertyType === 'number')
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
  else if (propertyType === 'object')
    return(
      <div className='edit-field'>
        <JsonEditorView 
          value={value || {}} 
          label={key} 
          onChange={(v)=> onChange(key,v)}/>
      </div>
    )
  else if (propertyType === 'array')
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

const LinkList = ({linkList} : {linkList: DataModelLink[]}) => {
  if ( _.isEmpty(linkList)) {
    return null
  } else {
    return(
      <div className='link-list'>
        <h3>Links</h3>
        { linkList.map((links, i) => {
          return(
            <ul key={i}>
              { links.entries.map((entry, j : number) => 
                <li  key={j}><Link to={`/models/${links.model}/${entry.key}`}>{`${links.model}/${entry.title}`}</Link></li>)
              }
            </ul>
          )
        }) }
      </div>
    )
  }
}

const EditEntryView = ({onUpdatedEntry} : { onUpdatedEntry : (res : ModelEntryResponse) => void}) => {
  const [ entry, setEntry ] = useState<DataEntry>()
  const [ schema, setSchema ] = useState<DataSchema>()
  const [ links, setLinks ] = useState<DataModelLink[]>([])

  const [ changes, setChanges ] = useState<object>({})
  const { modelName, entryId } = useParams<{modelName : string, entryId: string}>()
  const { credentials, showModal, onAuthorizationError } = useContext(AppContext);

  const location = useLocation()

  useEffect( () => {
    if (!modelName || !entryId)
      return
    Api.getEntry(modelName, entryId, credentials).then( (res) => {
      setEntry(res.entry)
      setSchema(res.schema)
      setLinks(res.links)
    }).catch( (err : ApiException) => {
      if (err.statusCode === 401)
        onAuthorizationError(location.pathname)
      else
        showModal('Error', err.message)
    })
  },[modelName, entryId, credentials, onAuthorizationError, showModal, location])

  async function onDataChange(key : string, value : any) {
    if (entry && !_.isEqual(entry.data[key], value)) {
      setChanges(Object.assign({}, changes, _.set({}, key, value)))
    } else {
      setChanges(_.omit(changes, key))
    }
  }

  async function onUpdate() {
    try {
      const result = await Api.updateEntry( modelName, entryId, changes, credentials)
      onUpdatedEntry(result)
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
      return null
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
      { (schema && entry) ?
        <div>
          { Object.entries(schema.properties).map( ([key, val],i) => {
            return(
              <div key={i}>
                { renderSchemaField({ key: key, property: val, value: entry?.data[key], onChange: onDataChange}) }
              </div>
            )
          }) }
          <LinkList linkList={links}/>
        </div>
        :
        <p className='empty-entry'>Entry does not exist.</p>
        }
        { renderFooter() }
    </div>
  )
}

export { EditEntryView, renderSchemaField }