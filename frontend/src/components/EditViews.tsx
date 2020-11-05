import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import './styles/EditView.scss';

const TextEditView = ({label, value, onChange, rows = 1, maxLength = 512} : {
  label : string, 
  value : string, 
  onChange : (text: string) => void,
  rows?: number,
  maxLength? : number
}) => {
  const [changed, setChanged] = useState(false)
  const [current, setCurrent] = useState(value)

  useEffect(() => {
    onChange(current)
  },[current]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setChanged(current !== value)
  }, [value, current])

  useEffect( () => {
    setCurrent(value)
  }, [value])

  return(
    <div className='input-wrapper'>
      <label>{label}</label>
      <div className={'input-element' + (changed ? ' changed' : '' )}>
        { rows > 1 ? 
        <textarea 
          value={current || ''} 
          maxLength={maxLength}
          rows={rows} 
          onChange={(e) => setCurrent(e.target.value)}/>
        :
        <input value={current} maxLength={maxLength} onChange={(e) => setCurrent(e.target.value)}/>
      }   
      </div>
    </div>
  )
}

const BooleanEditView = ({label, value, onChange} : 
  {label : string, value : boolean, onChange : (value: boolean) => void}
) => {
  const [changed, setChanged] = useState(false)
  const [current, setCurrent] = useState(value)

  useEffect(() => {
    onChange(current)
  },[current]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setChanged(current !== value)
  }, [value, current])

  useEffect( () => {
    setCurrent(value)
  }, [value])

  return(
    <div className='input-wrapper'>
      <label>{label}</label>
      <div className={'input-element' + (changed ? ' changed' : '')}>
        <select
        value={current ? 'true' : 'false'} 
        onChange={(e) => setCurrent(e.target.value === 'true')}> 
          <option value="true">true</option> 
          <option value="false">false</option>
        </select> 
      </div>
    </div>
  )
}

const NumberEditView = ({label, value, min, max, onChange} : 
  {label : string, value : number, min? : number, max?: number, onChange : (value: number) => void}
) => {
  const [changed, setChanged] = useState(false)
  const [current, setCurrent] = useState(value)

  useEffect(() => {
    onChange(current)
  },[current]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setChanged(current !== value)
  }, [value, current])

  useEffect( () => {
    setCurrent(value)
  }, [value])

  return(
    <div className='input-wrapper'>
      <label>{label}</label>
      <div className={'input-element' + (changed ? ' changed' : '')}>
        <input type='number' max={max} min={min} value={current || ''} onChange={(e) => setCurrent(_.toNumber(e.target.value))}/>
      </div>
    </div>
  )
}

const JsonEditorView = ({label, value, onChange} :
  {label : string, value : object, onChange : (value: object) => void}
) => {
  const [changed, setChanged] = useState(false)
  const [current, setCurrent] = useState<string>(JSON.stringify(value))
  const [validationError, setValidationError] = useState<string|null>(null)

  useEffect(() => {
    try {
      onChange(JSON.parse(current))
      setValidationError(null)
    } catch (err) {
      setValidationError(err.message)
    }
  },[current]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setChanged(current !== JSON.stringify(value))
  }, [value, current])

  useEffect( () => {
    setCurrent(JSON.stringify(value))
  }, [value])

  return(
    <div className='input-wrapper'>
      <label>{label}</label>
      <div className={'input-element' + (changed ? ' changed' : '') + (!validationError ? '' : ' invalid')}>
        <textarea 
          value={current || ''} 
          onChange={(e) => setCurrent(e.target.value)}
          rows={10}>
        </textarea>
      </div>
      <div className='error-field'>{validationError ? validationError : ''}</div>
    </div>
  )
}

export { NumberEditView, TextEditView, BooleanEditView, JsonEditorView}