import React, { FunctionComponent, useEffect, useState } from "react";
import './styles/DeleteButton.scss'

type Properties = {
  text? : string, 
  confirmText? : string, 
  onConfirm : () => void
}

const DeleteButton : FunctionComponent<Properties> = ({ text = 'Delete', confirmText = 'Confirm Delete', onConfirm}) => {
  const [clicked, setClicked] = useState(false)

  useEffect( () => {
    let timer = clicked ? setTimeout( () => {
      setClicked(false);
    },2000) : null
    return function cleanup() {
      timer && clearTimeout(timer)
    }
  }, [clicked])

  function onClick() {
    if (clicked) {
      onConfirm()
      setClicked(false)
    } else {
      setClicked(true)
    }
  }
  
  return(
    <button className={ clicked ? 'button-delete confirm' : 'button-delete'} onClick={onClick}>{clicked ? confirmText : text}</button>
  )
}

export { DeleteButton }