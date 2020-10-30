import _ from 'lodash';
import React, { useEffect, useState} from 'react';
import { Link, useParams } from 'react-router-dom';
import { Api, getCredentials, Schema } from '../api';
import { sleep } from '../utils';
import { BooleanEditView, JsonEditorView, NumberEditView, TextEditView } from './EditViews';

const EntryView = () => {
  const [ entry, setEntry ] = useState<{schema: Schema, data: any}|null>(null)
  const [ changes, setChanges ] = useState<object>({})

  const { modelName, entryId } = useParams<{modelName : string, entryId: string}>()

  useEffect( () => {
    if (!modelName || !entryId)
      return
    Api.getEntry(modelName, entryId, getCredentials()).then( (res) => {
      if (_.has(res,'data'))
        setEntry({ schema: res.schema, data: res.data })
      else
        setEntry(null)
    })
  },[modelName, entryId])

  async function onDataChange(key : string, value : any) {
    if (entry && entry.data[key] !== value) {
      setChanges(Object.assign(changes, _.set({}, key, value)))
    } else {
      setChanges(_.omit(changes, key))
    }
    console.log(changes)
  }

  async function onSave() {
    const data = await Api.updateEntry( modelName, entryId, changes, getCredentials())
  }

  async function onReset() {
    const copy = _.cloneDeep(entry);
    setEntry(null)
    await sleep(1)
    setEntry(copy)
  }
  
  return(
    <div className='entry-view'>
      <Link to={`/${modelName}/`}>Back</Link>
      <h2>{modelName} entry</h2>
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
        <p>Entry does not exist</p>
      }
      { entry && 
      <div className='button-group'>
        <button onClick={() => onSave()}>Save</button>
        <button onClick={() => onReset()}>Reset</button>
      </div>
      }
    </div>
  )
}

export { EntryView}