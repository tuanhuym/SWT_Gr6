import React, { useState, useEffect } from 'react';
import Navbar2 from '../navbar2';
import Footer from '../footer';
import '../../../css/deliverydetail.css';
import { Row, Col, Button, Input } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from '../../../config/axios';

const HealDetail = ({ orderId, onBack }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [healNote, setHealNote] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://6703b45dab8a8f8927314be8.mockapi.io/orderEx/Order/${orderId}`);
            setOrder(response.data);
            setHealNote(response.data.healNote || '');
        } catch (err) {
            console.error("Error fetching order:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateHealNote = async () => {
        try {
            setLoading(true);
            const currentDate = new Date().toLocaleString(); // Get current date in ISO format
            const response = await axios.put(`https://6703b45dab8a8f8927314be8.mockapi.io/orderEx/Order/${orderId}`, {
                healNote: healNote,
                checkDate: currentDate // Add this line to update checkDate
            });
            setOrder(response.data);
            alert('Heal note updated successfully!');
        } catch (err) {
            console.error("Error updating heal note:", err);
            alert('Failed to update heal note. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-message">Loading...</div>;
    if (!order) return <div className="no-order-message">No order found</div>;

    return (
        <Col span={24}>
            <Row>
                <Col span={24}>
                    <Button onClick={onBack} className="back-btn">
                        <ArrowLeftOutlined /> Back
                    </Button>
                </Col>
            </Row>
            <h1 className="section-title">Heal Detail</h1>
            <Row className="delivery-info">
                <Col span={24}>
                    <h2>Order ID: {order.id}</h2>
                </Col>
            </Row>
            {/* <Row className="delivery-info">
                <Col span={24}>
                    <h2>Sender Information</h2>
                    <p>Name: {order.senderName}</p>
                    <p>Phone: {order.senderPhone}</p>
                    <p>Address: {order.pickUpAddr}</p>
                </Col>
            </Row>
            <Row className="delivery-info">
                <Col span={24}>
                    <h2>Receiver Information</h2>
                    <p>Name: {order.receiverName}</p>
                    <p>Phone: {order.receiverPhone}</p>
                    <p>Address: {order.dropOffAddr}</p>
                </Col>
            </Row> */}
            <Row className="delivery-info">
                <Col span={24}>
                    <h2>Fish List</h2>
                    {order.fishList.map((element, index) => (
                        <p key={index}>{element}</p>
                    ))}
                </Col>
            </Row>
            <Row className="delivery-info">
                <Col span={24}>
                    <h2>Heal Note</h2>
                    <Input.TextArea
                        rows={4}
                        value={healNote}
                        onChange={(e) => setHealNote(e.target.value)}
                        placeholder="Enter heal note here..."
                    />
                    <Button 
                        type="primary" 
                        onClick={updateHealNote} 
                        style={{
                            backgroundColor: '#FF8C00',
                            marginTop: '1rem',
                            width: '100%',
                            height: '40px',
                            fontSize: '1rem'
                        }}
                        loading={loading}
                    >
                        Update Heal Note
                    </Button>
                </Col>
            </Row>
        </Col>
    );
};

export default HealDetail;
