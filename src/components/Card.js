import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmarkCircle } from '@fortawesome/free-solid-svg-icons';

export default function Card(props) {
    const [iconUrl, setIconUrl] = useState(props.iconUrl);
    var x = props.data;

    const deleteCard = (e) => {
        x = props.data
        const toBeDel = props.url
        const filteredData = x.filter(item => item.url !== toBeDel);
        const data = JSON.stringify(filteredData);
        localStorage.setItem('websiteData', data);
        props.refresh();
        props.notify('Card name '+props.name+' is Deleted.');
        console.log(props.name+' was deleted');
    }

    const handleError = () => {
        setIconUrl('default.svg');
    };
    return (
    <a href={props.carddeleted ? null : props.url} target='_blank' rel="noreferrer">
        <div className='card' style={{background: props.color, boxShadow: '0px 0px 20px '+props.color+'80'}}>
            <div className='imgspace'>
                <img src={iconUrl} alt={iconUrl} onError={handleError} id='icon'/>
            </div>
            <FontAwesomeIcon 
                icon={faXmarkCircle}
                onClick={deleteCard}
                className='xmark'
                style={{display: props.del ? 'block' : 'none'}}
            />
            {props.name}
        </div>
    </a>    
    )
}
