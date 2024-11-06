import React, { useState, useEffect } from 'react';
import Navbar2 from '../navbar2';
import Footer from '../footer';
import '../../../css/deliverydetail.css';
import { Row, Col, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from '../../../config/axios';

const DeliveryDetail = ({ transportId, onBack }) => {
    const [transport, setTransport] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTransportAndOrder();
    }, [transportId]);

    const fetchTransportAndOrder = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://6703b45dab8a8f8927314be8.mockapi.io/orderEx/Transport/${transportId}`);
            const transportData = response.data;

            const orderResponse = await axios.get(`https://6703b45dab8a8f8927314be8.mockapi.io/orderEx/Order/${transportData.OrderId}`);
            const orderData = orderResponse.data;

            setTransport({
                ...transportData,
                pickUpLocation: orderData.pickUpLocation,
                dropOffLocation: orderData.dropOffLocation,
                senderName: orderData.senderName,
                senderPhone: orderData.senderPhone,
                pickUpAddr: orderData.pickUpAddr,
                receiverName: orderData.receiverName,
                receiverPhone: orderData.receiverPhone,
                dropOffAddr: orderData.dropOffAddr,
            });
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateTransportStatus = async (newStatus) => {
        try {
            setLoading(true);
            const response = await axios.put(`https://6703b45dab8a8f8927314be8.mockapi.io/orderEx/Transport/${transportId}`, {
                status: newStatus
            });
            setTransport(response.data);
            alert('Order status updated successfully!');
        } catch (err) {
            console.error("Error updating order status:", err);
            alert('Failed to update order status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-message">Loading...</div>;
    if (!transport) return <div className="no-order-message">No transport found</div>;

    return (
        <Col span={24}>
            <Row>
                <Col span={24}>
                    <Button onClick={onBack} className="back-btn">
                        <ArrowLeftOutlined /> Back
                    </Button>
                </Col>
            </Row>
            <h1 className="section-title">Delivery Detail</h1>
            <Row className="delivery-info">
                <Col span={24}>
                    <h2>Transport ID: {transport.id}</h2>
                    <h2>Order ID: {transport.OrderId}</h2>
                </Col>
            </Row>
            <Row className="delivery-info">
                <Col span={24}>
                    <h2>Sender Information</h2>
                    <p>Name: {transport.senderName}</p>
                    <p>Phone: {transport.senderPhone}</p>
                    <p>Address: {transport.pickUpAddr}</p>
                </Col>
            </Row>
            <Row className="delivery-info">
                <Col span={24}>
                    <h2>Receiver Information</h2>
                    <p>Name: {transport.receiverName}</p>
                    <p>Phone: {transport.receiverPhone}</p>
                    <p>Address: {transport.dropOffAddr}</p>
                </Col>
            </Row>
            <Row className="delivery-info">
                <Col span={24}>
                    <h2>Fish List</h2>
                    {transport.fishList && transport.fishList.length > 0 ? (
                        transport.fishList.map((element, index) => (
                            <p key={index}>{element}</p>
                        ))
                    ) : (
                        <p>No fish listed</p>
                    )}
                </Col>
            </Row>
            <Row className="delivery-info">
                <Col span={24}>
                    <h2>Status: {transport.status}</h2>
                    <Button type="primary" className="status-btn" onClick={() => updateTransportStatus('Pickup')}>
                         Pickup
                    </Button>
                </Col>
            </Row>
        </Col>
    );
};

export default DeliveryDetail;
