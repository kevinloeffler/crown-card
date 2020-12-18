import React, {useState, useEffect} from 'react';

function App() {
  const [merchants, setMerchants] = useState(false);
  useEffect(() => {
    getMerchant();
  }, []);

  function getMerchant() {
    fetch('http://localhost:3001')
      .then(response => {
        return response.text();
      })
      .then(data => {
        setMerchants(data);
      });
  }

  function createCard() {
    let id = prompt('Enter card id');
    fetch('http://localhost:3001/merchants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({id}),
    })
      .then(response => {
        return response.text();
      })
      .then(data => {
        alert(data);
        getMerchant();
      });
  }

  function deleteCard() {
    let id = prompt('Enter card id');
    fetch(`http://localhost:3001/merchants/${id}`, {
      method: 'DELETE',
    })
      .then(response => {
        return response.text();
      })
      .then(data => {
        alert(data);
        getMerchant();
      });
  }

  return (
    <div>
      {merchants ? merchants : 'There is no card data available'}
      <br />
      <button onClick={createCard}>Add card</button>
      <br />
      <button onClick={deleteCard}>Delete card</button>
    </div>
  );
}

export default App;
