import React, { useEffect, useState } from 'react';
import { FaHome, FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/WardrobePage.css';
import wardrobeData from '../wardrobe.json';

function WardrobePage() {
  const [wardrobe, setWardrobe] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedWardrobe = JSON.parse(localStorage.getItem('wardrobe')) || wardrobeData.wardrobe;
    setWardrobe(savedWardrobe);
    setSelectedItems(savedWardrobe.filter(item => item.active).map(item => item.id));
  }, []);

  const toggleSelectItem = (id) => {
    const updatedWardrobe = wardrobe.map(item =>
      item.id === id ? { ...item, active: !item.active } : item
    );
    setWardrobe(updatedWardrobe);
    setSelectedItems(updatedWardrobe.filter(item => item.active).map(item => item.id));
    localStorage.setItem('wardrobe', JSON.stringify(updatedWardrobe));

    // Update the JSON file on the server
    fetch('/update-wardrobe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ wardrobe: updatedWardrobe })
    }).catch(error => console.error('Error updating wardrobe data:', error));
  };

  const renderItems = (type) => {
    return wardrobe
      .filter(item => item.type === type)
      .map(item => (
        <div
          key={item.id}
          className={`WardrobePage-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}
          onClick={() => toggleSelectItem(item.id)}
        >
          <div className="WardrobePage-select-circle"></div>
          <img src={item.imageUrl} alt={item.type} className="WardrobePage-item-image" />
          <div className="WardrobePage-color" style={{ backgroundColor: item.hexColor }}></div>
          <p>{item.hexColor}</p>
        </div>
      ));
  };

  return (
    <div className="WardrobePage">
      <header className="WardrobePage-header">
        <div className="WardrobePage-icons">
          <FaHome className="WardrobePage-icon" onClick={() => navigate('/')} />
          <FaComments className="WardrobePage-icon" onClick={() => navigate('/chat')} />
        </div>
        <h1>My Wardrobe</h1>
      </header>
      <section className="WardrobePage-section">
        <h2>Accessories</h2>
        <div className="WardrobePage-items">
          {renderItems('accessory')}
        </div>
      </section>
      <section className="WardrobePage-section">
        <h2>Upper Wear</h2>
        <div className="WardrobePage-items">
          {renderItems('upper wear')}
        </div>
      </section>
      <section className="WardrobePage-section">
        <h2>Lower Wear</h2>
        <div className="WardrobePage-items">
          {renderItems('lower wear')}
        </div>
      </section>
    </div>
  );
}

export default WardrobePage;