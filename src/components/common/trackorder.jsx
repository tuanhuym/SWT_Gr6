import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from "../../config/axios";
import "../../css/trackorder.css";

const TrackOrder = () => {
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { orderId } = useParams();

  useEffect(() => {
    fetchOrderStatus();
    const intervalId = setInterval(fetchOrderStatus, 60000); // Cập nhật mỗi phút

    return () => clearInterval(intervalId); // Cleanup khi component unmount
  }, [orderId]);

  const fetchOrderStatus = async () => {
    try {
      setLoading(true);
      // Sử dụng MockAPI để tạo dữ liệu giả
      const response = await axios.get(`https://66f3691871c84d8058789db4.mockapi.io/orders`);
      const orderData = response.data;
      
      // Chuyển đổi dữ liệu từ API thành định dạng mà component cần
      const formattedData = {
        trackingNumber: orderData.trackingNumber,
        currentStatus: orderData.status,
        estimatedDelivery: orderData.estimatedDelivery,
        timeline: orderData.timeline.map(event => ({
          status: event.status,
          date: event.date,
          time: event.time,
          description: event.description,
          completed: event.completed
        }))
      };
      
      setOrderStatus(formattedData);
    } catch (err) {
      setError('Có lỗi xảy ra khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">Lỗi: {error}</div>;
  if (!orderStatus) return <div className="error">Không tìm thấy thông tin đơn hàng</div>;

  return (
    <div className="trackOrder">
      <h2 className="title">Theo dõi đơn hàng</h2>
      <div className="orderInfo">
        <p><strong>Mã vận đơn:</strong> {orderStatus.trackingNumber}</p>
        <p><strong>Trạng thái:</strong> {orderStatus.currentStatus}</p>
        <p><strong>Dự kiến giao hàng:</strong> {orderStatus.estimatedDelivery}</p>
      </div>
      <div className="timeline">
        {orderStatus.timeline.map((event, index) => (
          <div key={index} className={`timelineEvent ${event.completed ? 'completed' : ''}`}>
            <div className="timelineIcon"></div>
            <div className="timelineContent">
              <h3>{event.status}</h3>
              <p>{event.date} - {event.time}</p>
              <p>{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackOrder;
