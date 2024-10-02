import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default function User(props) {
    const [user, setUser] = useState('')
    const handleSubmit = (e) => {
        e.preventDefault();
        setUser(e.target.value);
        console.log(e.target.value);
    }
    return (
    <div className='addingCard' style={{display: props.submit ? 'grid' : 'none'}}>
        <div className='user'>
            <h2> Username or Nickname </h2>
            <input type='text' className='inputun' onChange={handleSubmit}/>
            <button onClick={() => {
                localStorage.setItem('imuser', user);
                props.setUser(user);
                props.setSubmit(false);
                props.notify('New nickname '+user+'.');
            }}
            > that's it</button>
            <button onClick={() => {props.setSubmit(false)}}>
                Close <FontAwesomeIcon icon={faXmark} className='closeUser'/>
            </button>
        </div>
    </div>
    )
}
