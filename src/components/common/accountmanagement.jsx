import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProfilePage from './profilepage'; 
import Orders from './orderhistory'; 

import Navbar from './navbar2'; // Import the Navbar component
import '../../css/accountManagement.css';
import Navbar2 from './navbar2';

const AccountManagement = () => {
  const location = useLocation();
  console.log('Location state:', location.state);

  const [activeComponent, setActiveComponent] = useState(location.state?.activeComponent || 'profile');

  const renderContent = () => {
    switch (activeComponent) {
      case 'profile':
        return <ProfilePage />;
      case 'orders':
        return <Orders />;
      default:
        return (
          <div>
            <h2>Welcome to Your Account</h2>
            <p>Select an option from the sidebar to view details.</p>
          </div>
        );
    }
  };

  return (
    <div>
      <Navbar2 />
      <div className="account-management">
        <div className="sidebar">
          <h3>Account Management</h3>
          <ul>
            <li>
              <button onClick={() => setActiveComponent('profile')} className={activeComponent === 'profile' ? 'active' : ''}>
                Profile
              </button>
            </li>
            <li>
              <button onClick={() => setActiveComponent('orders')} className={activeComponent === 'orders' ? 'active' : ''}>
                Orders
              </button>
            </li>
          </ul>
        </div>
        <div className="content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
