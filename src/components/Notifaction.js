import React from 'react'
import './notfacation.css'

export default function Notifaction(props) {
    return (
        <div style={{display: props.display ? 'flex' : 'none'}} className='notBox'>
            <div>
                {props.message}
            </div>
        </div>
    )
}
