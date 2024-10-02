import './App.css';
import Card from './components/Card';
import AddCard from './components/AddCard';
import Footer from './components/Footer';
import User from './components/User';
import Notifaction from './components/Notifaction';
import { useState } from 'react';

function App() {
  const [storedData, setSoredData] = useState(localStorage.getItem('websiteData'));
  const [submit, setSubmit] = useState(false);
  const [del, setdel] = useState(false);
  const [user, setUser] = useState(localStorage.getItem('imuser'));
  //localStorage.removeItem('websiteData');
  //localStorage.removeItem('imuser');
  const refresh = () => {
    user === null ? setSubmit(true) : setSubmit(false);
    console.log('refreshed');
    setSoredData(localStorage.getItem('websiteData'));
  }
  const defaultData = [
    {
        "name": "Chat GPT",
        "url": "https://chatgpt.com/",
        "iconUrl": "https://chatgpt.com//favicon.ico",
        "color": "#1e1e1e"
    }
  ];
  const data = storedData ? JSON.parse(storedData) : defaultData;

  //notifaction
  const [message, setMessage] = useState('wellcome '+user)
  const [notifaction, setNotifaction] = useState(false);
  const pushNotifaction = (data) => {
    setMessage(data);
    setNotifaction(true);

    setTimeout(() => {
      setNotifaction(false);
      setMessage('Hey '+user)
    }, 3950);
  };
  return (
    <div className="App">
      {data.map((item) => (
        <Card 
          key={item.url} 
          name={item.name} 
          url={item.url} 
          iconUrl={item.iconUrl}
          color={item.color}
          del={del}
          data={data}
          carddeleted={del}
          refresh={refresh}
          notify={pushNotifaction}
        />
      ))}
      <AddCard 
        data={data} 
        refresh={refresh}
        notify={pushNotifaction}
      />
      <Footer
        setv={setSubmit} 
        del={setdel} 
        refresh={refresh} 
        user={user} 
        notify={pushNotifaction}
      />
      <User 
        setSubmit={setSubmit}
        submit={submit}
        setUser={setUser}
        notify={pushNotifaction}
      />
      <Notifaction 
        message={message}
        display={notifaction}
        setNotifaction={setNotifaction}
      />
    </div>
  );
}

export default App;
