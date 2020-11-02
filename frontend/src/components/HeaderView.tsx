import React from 'react';
import { Link } from 'react-router-dom';
import './styles/HeaderView.scss'


const HeaderView = ({backlink} : { backlink? : string}) => {

  return(
    <div className='header-view'>
      { backlink && <Link to={backlink}>Back</Link> }
    </div>
  )
}

export { HeaderView}