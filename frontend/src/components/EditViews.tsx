import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import './styles/EditView.scss';

const TextEditView = ({label, value, onChange, rows = 5, maxLength = 64, readonly = false} : {
  label : string, 
  value : string, 
  onChange : (text: string) => void,
  rows?: number,
  maxLength? : number,
  readonly? : boolean
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
        { (maxLength > 64) ? 
        <textarea 
          value={current || ''} 
          maxLength={maxLength}
          rows={rows} 
          onChange={(e) => setCurrent(e.target.value)}
          readOnly={readonly}/>
        :
        <input value={current} maxLength={maxLength} onChange={(e) => setCurrent(e.target.value)} readOnly={readonly}/>
      }   
      </div>
    </div>
  )
}

const BooleanEditView = ({label, value, readonly = false, onChange} : 
  {label : string, value : boolean, readonly?: boolean, onChange : (value: boolean) => void}
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
        onChange={(e) => setCurrent(e.target.value === 'true')}
        disabled={readonly}> 
          <option value="true">true</option> 
          <option value="false">false</option>
        </select> 
      </div>
    </div>
  )
}

const NumberEditView = ({label, value, min, max, readonly = false, onChange} : 
  {label : string, value : number, min? : number, max?: number, readonly?: boolean, onChange : (value: number) => void}
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
        <input type='number' 
          max={max} 
          min={min} 
          value={_.isNumber(current) ? current : undefined} 
          onChange={(e) => setCurrent(_.toNumber(e.target.value))}
          readOnly={readonly}/>
      </div>
    </div>
  )
}

const JsonEditorView = ({label, value, readonly = false, onChange} :
  {label : string, value : object, readonly?: boolean, onChange : (value: object) => void}
) => {
  const [changed, setChanged] = useState(false)
  const [current, setCurrent] = useState<string>(JSON.stringify(value))
  const [ formated, setFormated ] = useState<string>()
  const [validationError, setValidationError] = useState<string|null>(null)

  useEffect(() => {
    try {
      onChange(JSON.parse(current))
      setValidationError(null)
      setFormated(JSON.stringify(JSON.parse(current), null, 2))
    } catch (err : any) {
      setValidationError(err.message)
      setFormated(current)
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
          value={formated || ''} 
          onChange={(e) => setCurrent(e.target.value)}
          rows={10}
          readOnly={readonly}>
        </textarea>
      </div>
      <div className='error-field'>{validationError ? validationError : ''}</div>
    </div>
  )
}

export { NumberEditView, TextEditView, BooleanEditView, JsonEditorView}