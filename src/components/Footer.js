import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faCodeFork, faPaperPlane, faPenToSquare, faFileImport, faFileExport, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

import ExportJson from './ExportJson';
import ImportJson from './ImportJson';

import './Footer.css'
export default function Footer(props) {
  const [visible, setVisible] = useState(true);
  const del = () => {
    visible ? setVisible(false) : setVisible(true);
    visible ? props.del(true) : props.del(false);
  }

  const [impf, setImpf] = useState(false);
  const [expf, setExpf] = useState(false);

  return (
  <>
    <div className='header'>
      <div className='userbox'>
        <FontAwesomeIcon icon={faPenToSquare} className='edit' onClick={() => {props.setv(true)}}/>
        {props.user}'s links
      </div>
      <div className='inportbox'>
        <div><FontAwesomeIcon className='ic' icon={faTrash} onClick={del} style={{color: visible ? 'black' : 'red'}}/></div>
        <div><FontAwesomeIcon className='ic fin' icon={faFileImport} onClick={() => {setImpf(true)}}/></div>
        <div><FontAwesomeIcon className='ic fex' icon={faFileExport} onClick={() => {setExpf(true)}}/></div>
        <div><a href='https://github.com/praveenjadhav1510' className='profile' target='_blank' rel="noreferrer"> <FontAwesomeIcon icon={faGithub} /> profile </a></div>
      </div>
    </div>
    
    <div className='footer'>
      <a href='https://github.com/praveenjadhav1510' target='_blank' rel="noreferrer"> <FontAwesomeIcon icon={faGithub} /> Github </a>
      <a href='https://github.com/praveenjadhav1510/save-links' target='_blank' rel="noreferrer"> <FontAwesomeIcon icon={faLink} /> App repo</a>
      <a href='https://github.com/praveenjadhav1510/save-links/fork' target='_blank' rel="noreferrer"> <FontAwesomeIcon icon={faCodeFork} /> codefock</a>
      <a href='mailto:praveenjadhav1510+githubSavelinks@gmail.com?subject=Feedback%20for%20Savelinks&amp;body=%3C--Your%20feedback--%3E'> <FontAwesomeIcon icon={faPaperPlane} /> feedback</a>
    </div>

    
    <ImportJson 
      setDisplay={setImpf} 
      display={impf} 
      refresh={props.refresh}
      notify={props.notify}
    />
    <ExportJson 
      setDisplay={setExpf} 
      display={expf} 
      user={props.user}
      notify={props.notify}
    />
  </>
  )
}
