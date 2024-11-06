import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Select } from 'antd';
import '../../../css/deliverypage.css';
import axios from "../../../config/axios";

function HealOrder({ onDetailClick }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://6703b45dab8a8f8927314be8.mockapi.io/orderEx/Order');
            setOrders(response.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-message">Loading...</div>;
    if (!orders) return <div className="no-order-message">No order found</div>;

    return (
        <div>
            <table className="delivery-table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>OrderID</th>
                        <th>Check Date</th>
                        <th>Heal Note</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, index) => (
                        <tr key={order.id}>
                            <td>{index + 1}</td>
                            <td>{order.id}</td>
                            <td>{order.checkDate}</td>
                            <td>{order.healNote}</td>
                            <td>
                                <button 
                                    onClick={() => onDetailClick(order.id)} 
                                    className="detail-delivery-btn"
                                >
                                    Detail
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default HealOrder;
