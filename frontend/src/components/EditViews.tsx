import _ from 'lodash';
import React, {useState} from 'react';
import './EditView.scss';

const TextEditView = ({label, text, onChange, rows = 1, maxLength = 512} : {
  label : string, 
  text : string, 
  onChange : (text: string) => void,
  rows?: number,
  maxLength? : number
}) => {
  const [changed, setChanged] = useState(false)

  function onValueChanged(val : string) {
    setChanged(val !== text)
    onChange(val)
  }

  return(
    <div className='input-wrapper'>
      <label>{label}</label>
      <div className={'input-element' + (changed ? ' changed' : '' )}>
        { rows > 1 ? 
        <textarea 
          defaultValue={text} 
          maxLength={maxLength}
          rows={rows} 
          onChange={(e) => onValueChanged(e.target.value)}/>
        :
        <input defaultValue={text} maxLength={maxLength} onChange={(e) => onValueChanged(e.target.value)}/>
      }   
      </div>
    </div>
  )
}

const BooleanEditView = ({label, value, onChange} : 
  {label : string, value : boolean, onChange : (value: boolean) => void}
) => {
  const [changed, setChanged] = useState(false)

  function onValueChanged(val : boolean) {
    setChanged(val !== value)
    onChange(val)
  }

  return(
    <div className='input-wrapper'>
      <label>{label}</label>
      <div className={'input-element' + (changed ? ' changed' : '')}>
        <select
        defaultValue={value ? 'true' : 'false'} 
        onChange={(e) => onValueChanged(e.target.value === 'true')}> 
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

  function onValueChanged(val : number) {
    setChanged(val !== value)
    onChange(val)
  }

  return(
    <div className='input-wrapper'>
      <label>{label}</label>
      <div className={'input-element' + (changed ? ' changed' : '')}>
        <input type='number' max={max} min={min} defaultValue={value} onChange={(e) => onValueChanged(_.toNumber(e.target.value))}/>
      </div>
    </div>
  )
}

const JsonEditorView = ({label, value, onChange} :
  {label : string, value : object, onChange : (value: object) => void}
) => {
  const [changed, setChanged] = useState(false)
  const [validationError, setValidationError] = useState<string|null>(null)

  function onValueChanged(text : string) {
    try {
      const json = JSON.parse(text)
      setValidationError(null)
      setChanged(!_.isEqual(json,value))
      onChange(json)
    } catch (err) {
      setValidationError(err.message)
    }
  }

  return(
    <div className='input-wrapper'>
      <label>{label}</label>
      <div className={'input-element' + (changed ? ' changed' : '') + (!validationError ? '' : ' invalid')}>
        <textarea 
          defaultValue={JSON.stringify(value)} 
          onChange={(e) => onValueChanged(e.target.value)}
          rows={10}>
        </textarea>
      </div>
      <div className='error-field'>{validationError ? validationError : ''}</div>
    </div>
  )
}

export { NumberEditView, TextEditView, BooleanEditView, JsonEditorView}