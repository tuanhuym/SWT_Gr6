import React, { useState } from 'react';
import ProfilePage from '../profilepage';
import Navbar2 from '../navbar2';
import HealDetail from './healdetail';
import HealOrder from './healorder';
import '../../../css/accountmanagement.css';

function HealChecker() {
  const [activeComponent, setActiveComponent] = useState('profile');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleDetailClick = (orderId) => {
    setSelectedOrderId(orderId);
    setActiveComponent('detail');
  };

  const handleBackToOrders = () => {
    setActiveComponent('orders');
  };

  const renderContent = () => {
    switch (activeComponent) {
      case 'profile':
        return <ProfilePage />;
      case 'orders':
        return <HealOrder onDetailClick={handleDetailClick} />;
      case 'detail':
        return <HealDetail orderId={selectedOrderId} onBack={handleBackToOrders} />;
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
      <Navbar2/>
      <div className="account-management">
        <div className="sidebar">
          <h3>Heal Checker</h3>
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
}

export default HealChecker;
