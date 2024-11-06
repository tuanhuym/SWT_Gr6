import React, { useState } from 'react';
import ProfilePage from '../profilepage';
import Navbar2 from '../navbar2';
import DeliveryPage from './deliverypickup';
import DeliveryDetail from './deliverydetail';
import DeliveryProcess from './deliveryprocess';
import DeliveryDelivered from './deliveredroute';
import '../../../css/accountmanagement.css';

function Delivery() {
  const [activeComponent, setActiveComponent] = useState('profile');
  const [selectedTransportId, setSelectedTransportId] = useState(null);

  const handleDetailClick = (transportId) => {
    setSelectedTransportId(transportId);
    setActiveComponent('detail');
  };

  const handleBackToPending = () => {
    setActiveComponent('pending');
  };

  const renderContent = () => {
    switch (activeComponent) {
      case 'profile':
        return <ProfilePage />;
      case 'pending':
        return <DeliveryPage onDetailClick={handleDetailClick} />;
      case 'detail':
        return <DeliveryDetail transportId={selectedTransportId} onBack={handleBackToPending} />;
      case 'process':
        return <DeliveryProcess onDetailClick={handleDetailClick} />;
      case 'delivered':
        return <DeliveryDelivered onDetailClick={handleDetailClick} />;
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
          <h3>Delivery</h3>
          <ul>
            <li>
              <button onClick={() => setActiveComponent('profile')} className={activeComponent === 'profile' ? 'active' : ''}>
                Profile
              </button>
            </li>
            <li>
              <button onClick={() => setActiveComponent('pending')} className={activeComponent === 'pending' ? 'active' : ''}>
                Delivery Route 
              </button>
            </li>
            <li>
              <button onClick={() => setActiveComponent('process')} className={activeComponent === 'process' ? 'active' : ''}>
                Processing Route
              </button>
            </li>
            <li>
              <button onClick={() => setActiveComponent('delivered')} className={activeComponent === 'delivered' ? 'active' : ''}>
                Delivered Route
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

export default Delivery;
