import React from 'react'
import './Nav.css'

export default function Navbar() {
  return (
    <div className='header'>
      <div className='userbox'>
        <FontAwesomeIcon icon={faRetweet} className='reloader' onMouseEnter={reload}/>
        <FontAwesomeIcon icon={faPenToSquare} className='edit' onClick={() => {props.setv(true)}}/>
        {user}'s links
      </div>
      <div className='inportbox'>
        <div><FontAwesomeIcon className='ic' icon={faTrash} /></div>
        <div><FontAwesomeIcon className='ic' icon={faDownload} /></div>
        <div><FontAwesomeIcon className='ic' icon={faUpload} /></div>
      </div>
    </div>
  )
}
