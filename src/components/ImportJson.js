import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import './inpexp.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFileCode, faFileCirclePlus, faLink, faReplyAll} from '@fortawesome/free-solid-svg-icons';

export default function ImportJson(props) {
    const [fileContent, setFileContent] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                setFileContent(json);
            } catch (error) {
                console.error("Error parsing JSON", error);
            }
        };
        if (file) {
            reader.readAsText(file);
        }
    };

    const addData = () => {
        const existingData = JSON.parse(localStorage.getItem('websiteData')) || [];
        const newFileContent = Array.isArray(fileContent) ? fileContent : [fileContent];
        const combinedData = [...existingData, ...newFileContent];
        const data = JSON.stringify(combinedData);
        localStorage.setItem('websiteData', data);
        props.setDisplay(false);
        props.refresh();
        props.notify(newFileContent.length+' cards wher added to existing '+existingData.length+' cards.\n total cards: '+(newFileContent.length+existingData.length));
    };

    const replaceData = () => {
        const data = JSON.stringify(fileContent);
        localStorage.setItem('websiteData', data);
        
        props.setDisplay(false);
        props.refresh();
        props.notify(fileContent.length+' cards are replaced with existing cards.');
    };

    return (
        <div className='addingCard' style={{ display: props.display ? 'grid' : 'none' }}>
            <div className='impexp'>
                <FontAwesomeIcon icon={faXmark} className='close' onClick={() => { props.setDisplay(false) }} />
                <h2>Importing links  <FontAwesomeIcon icon={faLink} /></h2>
                <input type="file" accept=".json" onChange={handleFileChange} id="fileInput" className='hidden-file-input' />
                {fileContent && (
                    <SyntaxHighlighter className='code' language="json" style={coldarkDark} showLineNumbers>
                        {JSON.stringify(fileContent, null, 2)}
                    </SyntaxHighlighter>
                )}
                <div className='btbox'>
                    <label htmlFor="fileInput" className="custom-file-label">Choose File <FontAwesomeIcon icon={faFileCode} /></label>
                    <button onClick={addData} disabled={!fileContent}>Add <FontAwesomeIcon icon={faFileCirclePlus} /></button>
                    <button onClick={replaceData} disabled={!fileContent}>Replace <FontAwesomeIcon icon={faReplyAll} /></button>
                </div>
            </div>
        </div>
    );
}


