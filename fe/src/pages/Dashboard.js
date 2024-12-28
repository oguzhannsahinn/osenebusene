import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Categories from '../components/Categories';
import Goals from '../components/Goals';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <header className="App-header">
        <div className="logo">
          <span className="logo-top">o sene</span>
          <span className="logo-bottom">bu sene</span>
        </div>
        <div className="user-menu">
          <span>{user?.name}</span>
          <button onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </header>
      
      <div className="main-container">
        <Categories
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <Goals
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>
    </div>
  );
}

export default Dashboard; 