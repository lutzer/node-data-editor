import _ from 'lodash';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './styles/HeaderView.scss'

function findAllOccurances(str: string, pattern : string) {
  //indices = []
  return str.split(pattern).reduce<number[]>( (acc,val) => {
    if (_.isEmpty(acc))
      acc.push(val.length)
    else
      acc.push(val.length + pattern.length + (_.last(acc) || 0))
    return acc
  },[])
}

const HeaderView = () => {

  const pathname = useLocation().pathname
  var indices = pathname.length > 1 ? findAllOccurances(pathname, '/') : [0]

  return(
    <div className='header-view'>
      <div>
        <ul className='path-list'>
          { 
          indices.map( (index,i) => {
            const path = pathname.slice(0,index)
            const name = _.last(path.split('/')) || '/'
            return <li key={i}><Link to={path}>{name}</Link></li>
          })
          }
        </ul>
      </div>
    </div>
  )
}

export { HeaderView}