import React from 'react'
import './inpexp.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFileCode, faFileArrowDown, faLink, faAnchorLock } from '@fortawesome/free-solid-svg-icons';

export default function ExportJson(props) {
    const handleDownload = () => {
        const storedData = localStorage.getItem('websiteData');
        const fileContent = JSON.parse(storedData);
        const element = document.createElement("a");
        const file = new Blob([JSON.stringify(fileContent, null, 2)], { type: "application/json" });
        element.href = URL.createObjectURL(file);
        element.download = (props.user === null ? 'savelinks' : props.user)+".json";
        document.body.appendChild(element); // Append the element to the body
        element.click(); // Simulate a click on the element
        document.body.removeChild(element); // Clean up the element
        props.notify('File is Downloaded as '+props.user+'.json');
    };
    return (
        <div className='addingCard' style={{display: props.display ? 'grid' : 'none'}} >
            <div className='impexp'>
                <FontAwesomeIcon icon={faXmark} className='close' onClick={() => {props.setDisplay(false)}}/>
                <h2>Exporting links <FontAwesomeIcon icon={faLink} /></h2>
                <button onClick={handleDownload}>download <FontAwesomeIcon icon={faFileArrowDown} /></button>
                <p>File is Downloaded as <span className='filename'>{props.user === null ? 'savelinks' : props.user}.json <FontAwesomeIcon icon={faFileCode} /></span></p>
                <p>now you can share this file with your friends.</p>
                <p className='impo'>Please note that this data will not be encrypted <FontAwesomeIcon icon={faAnchorLock} /></p>
            </div>
        </div>
    )
}
