import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';

export default function AddCard(props) {
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [faviconUrl, setFaviconUrl] = useState('default.svg');
    const [urlError, setUrlError] = useState(false);
    const [cardColor, setCardColor] = useState('#1e1e1e');

    const addCard = () => {
        if (!isValidUrl(url)) {
            setUrlError(true);
            return;
        }

        const newCard = {
            name: name,
            url: url,
            iconUrl: faviconUrl,
            color: cardColor,
        };
        const updatedData = [...props.data, newCard];
        
        const data = JSON.stringify(updatedData);
        localStorage.setItem('websiteData', data);
        if(name === 'deletedata'){ localStorage.removeItem('websiteData'); }
        setName('');
        setUrl('');
        setFaviconUrl('default.svg');
        setCardColor('#1e1e1e');
        setAdding(false);
        setUrlError(false);
        props.refresh();
        props.notify('New card '+name+' has been created');
    };

    const getud = (e) => {
        setUrl(e.target.value);
        getFavicon();
    };

    const getFavicon = () => {
        if (!url) {
            return;
        }
        const domain = extractDomain(url);
        const faviconUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
        setFaviconUrl(faviconUrl);
    };

    const extractDomain = (url) => {
        return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    };

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    return (
    <>
        <div className='card'>
            <div className='imgspace' onClick={() => { setAdding(true); }}>
                <FontAwesomeIcon icon={faPlus} className='plus' />
            </div>Add Card
        </div>

        {/* Add Card Modal */}
        <div className='addingCard' style={{ display: adding ? 'grid' : 'none' }}>
            <div className='card ed' style={{ backgroundColor: cardColor }}>
                <div className='imgspace' onClick={() => { setAdding(true); }}>
                    <img src={faviconUrl} alt="Favicon" />
                </div>
                {name}
            </div>

            <div className='details'>
                <input
                    type='text'
                    placeholder='Enter Card Name'
                    value={name}
                    onChange={(e) => { setName(e.target.value); }}
                />
                <input
                    type='text'
                    placeholder='Enter URL...'
                    value={url}
                    onChange={getud}
                    style={{border: urlError ? '3px solid red' : 'none'}}
                />
                {/* Color Picker Input */}
                <input 
                    className='color-picker'
                    type="color" 
                    value={cardColor} 
                    onClick={() => {getFavicon();}}
                    onChange={(e) => setCardColor(e.target.value)} 
                />
                
                <button onClick={addCard}>Add Card</button>
                <button onClick={() => { setAdding(false); }}>Cancel</button>
            </div>
        </div>
    </>
    );
}
