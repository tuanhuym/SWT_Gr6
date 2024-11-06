import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../css/orderhistory.css";
import { Modal } from 'antd';
import { faFish } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const OrderHistory = () => {
  const [order, setOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const accessToken = sessionStorage.getItem('accessToken');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedFish, setSelectedFish] = useState(null);
  const [fishImages, setFishImages] = useState({});

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const query = `
      query FindManyUserOrder {
        findManyUserOrder {
          fromAddress         
          notes
          orderId
          orderStatus
          orderedFish {
            orderFishId
            ageInMonth
            description
            gender
            
            name
            species
            weight
            qualifications {
              fileId
            }
          }
          toAddress
          receiverName
          receiverPhone
          totalPrice
          transportServiceId
          createdAt 
          transportService {     
            type
          }
        }
      }
    `;
      const orderResponse = await axios.post('http://26.61.210.173:3001/graphql', { query }, { headers: {
        'Authorization': `Bearer ${accessToken}`
      } });
      setOrder(orderResponse.data.data.findManyUserOrder);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  const fetchImages = async (qualifications, fishId) => {
    try {
      const imagePromises = qualifications.map(qual => 
        axios.get(`http://26.61.210.173:3001/api/assets/get-image/${qual.fileId}`, {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
      );
      
      const responses = await Promise.all(imagePromises);
      const urls = responses.map(res => URL.createObjectURL(res.data));
      setFishImages(prev => ({
        ...prev,
        [fishId]: urls
      }));
    } catch (error) {
      console.error('Error fetching images:', error);
      console.error('Error details:', error.response);
    }
  };

  const showOrderDetail = (orderItem) => {
    setSelectedOrder(orderItem);
    setIsModalOpen(true);
  };

  const handleFishClick = (fish) => {
    setSelectedFish(fish);
    setFishImages({});
    if (fish.qualifications && fish.qualifications.length > 0) {
      const fileIds = fish.qualifications.map(qual => qual.fileId);
      console.log('FileIds for selected fish:', fileIds);
      fetchImages(fish.qualifications, fish.orderFishId);
    }
  };

  return (
    <div className="records">
      
        <h2 className="section-title" style={{ margin: 0 }}>Order History</h2>
      
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : order.length > 0 ? (
        <div className="orders-container">
          {order.map((orderItem) => (
            <div key={orderItem.orderId} className="order-card">
              <div className="order-detail">
                <span className="label">Order ID:</span> {orderItem.orderId}
              </div>
              <div className="order-detail">
                <span className="label">Date:</span> {new Date(orderItem.createdAt).toLocaleDateString()}
              </div>
              <div className="order-detail">
                <span className="label">Receiver Name:</span> {orderItem.receiverName}
              </div>
              <div className="order-detail">
                <span className="label">Total Price:</span> {orderItem.totalPrice.toLocaleString()} VNĐ
              </div>
              <div className="order-actions">
                <span className={`status ${orderItem.orderStatus}`}>{orderItem.orderStatus}</span>
                <button className="detail-button" onClick={() => showOrderDetail(orderItem)}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="emptyState">
          <img src="empty-state.png" alt="Empty State" className="emptyImage" />
          <p>It looks like you have never placed an order. Maybe it is time to place your first order!</p>
        </div>
      )}

      <Modal
        title={<h2 style={{ margin: 0, color: '#ff7700' }}>Order Details</h2>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedFish(null);
          setFishImages({});
        }}
        width={1000}
        footer={null}
      >
        {selectedOrder && (
          <div className="modal-content">
            <div className="order-info">
              <h3>Order Information</h3>
              <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
              <p><strong>Created Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <p><strong>Receiver Name:</strong> {selectedOrder.receiverName}</p>
              <p><strong>Receiver Phone:</strong> {selectedOrder.receiverPhone}</p>
              <p><strong>From:</strong> {selectedOrder.fromAddress}</p>
              <p><strong>To:</strong> {selectedOrder.toAddress}</p>
              <p><strong>Transport Type:</strong> {selectedOrder.transportService.type}</p>
              <p><strong>Notes:</strong> {selectedOrder.notes}</p>
              <p><strong>Total Price:</strong> <span className="price-tag">{selectedOrder.totalPrice.toLocaleString()} VNĐ</span></p>
              <p><strong>Status:</strong> <span className={`status ${selectedOrder.orderStatus.toLowerCase()}`}>{selectedOrder.orderStatus}</span></p>
              <h4 style={{ marginTop: '20px', color: '#1a1a1a' }}>Ordered Fish:</h4>
              <div className="fish-list">
                {selectedOrder.orderedFish && selectedOrder.orderedFish.map((fish, index) => (
                  <div
                    key={index}
                    className={`fish-item ${selectedFish === fish ? 'selected' : ''}`}
                    onClick={() => handleFishClick(fish)}
                  >
                    {fish.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="fish-details">
              <h3>Fish Details</h3>
              {selectedFish ? (
                <div className="fish-info">
                  <p><strong>Name:</strong> {selectedFish.name}</p>
                  <p><strong>Species:</strong> {selectedFish.species}</p>
                  <p><strong>Gender:</strong> {selectedFish.gender}</p>
                  <p><strong>Age:</strong> {selectedFish.ageInMonth} months</p>
                  <p><strong>Weight:</strong> {selectedFish.weight} g</p>
                  <p><strong>Description:</strong> {selectedFish.description}</p>
                  <p><strong>Qualifications:</strong></p>
                  <div className="fish-images">
                    {fishImages[selectedFish.orderFishId]?.map((imageUrl, index) => (
                      <img 
                        key={index} 
                        src={imageUrl} 
                        alt={`Fish ${index + 1}`} 
                        className="fish-image"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <FontAwesomeIcon icon={faFish} style={{ fontSize: '40px', margin: 'auto', display: 'block' }} />
                  <p>Select a fish to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderHistory;
