import React, { useState, useEffect } from "react";
import { Table, Spin, message, Modal } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";

function DeliveryPage() {
    const [loading, setLoading] = useState(false);
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const query = `
            query FindManyAssignedRoute {
                findManyAssignedRoute {
                    routeId
                    status
                    deliveryStartDate
                    updatedAt
                    notes
                    
                  routeStops {
                    address
                    stopType
                    orderId
                    order {
                      receiverName
                      receiverPhone
                      totalPrice
                      orderedFish {
                        name
                        species
                        gender
                        ageInMonth
                        weight
                        description
                        qualifications {
                          fileId
                        }
                      }
                    }
                  }
                }
            }
            `;
            const routesResponse = await axios.post('http://26.61.210.173:3001/graphql', {
                query,
            }, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                }
            });

            if (routesResponse.data?.data?.findManyAssignedRoute) {
                setRoutes(routesResponse.data.data.findManyAssignedRoute);
            } else {
                console.error("Invalid response structure:", routesResponse.data);
            }
        } catch (err) {
            console.error("Error fetching routes:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePickup = async (routeId) => {
        try {
            setLoading(true);
            await axios.patch(`http://26.61.210.173:3001/api/transport/pick-up-delivery-route`, {
                routeId: routeId
            }, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                }
            })
            message.success('Pickup successful');
            fetchRoutes();
        } catch (err) {
            console.error("Error picking up order:", err);
            message.error('Pickup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (route) => {
        setSelectedRoute(route);
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const columns = [
        {
            title: 'No',
            key: 'index',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Route ID',
            dataIndex: 'routeId',
            key: 'routeId',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Delivery Date',
            dataIndex: 'deliveryStartDate',
            key: 'deliveryStartDate',
            render: (date) => date ? new Date(date).toLocaleString() : <span style={{ color: '#790808', fontWeight: 'bold' }}>Not Started</span>,
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => new Date(date).toLocaleString(),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <button
                    className="detail-delivery-btn"
                    onClick={() => handlePickup(record.routeId)}
                    disabled={loading}
                >
                    Pickup
                </button>
            ),
        },
        {
            title: 'View',
            key: 'view',
            render: (_, record) => (
                <button className="view-button" onClick={() => handleView(record)}>
                    <FontAwesomeIcon icon={faEye} />
                </button>
            ),
        }
    ];

    return (
        <div>
            <h1 className='section-title'>Delivery Route</h1>
            <Table
                columns={columns}
                dataSource={routes}
                rowKey="routeId"
                loading={loading}
            />

            <Modal
                title="Route Details"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={1000}
            >
                {selectedRoute && (
                    <div>
                        <p><strong>Route ID:</strong> {selectedRoute.routeId}</p>
                        <p><strong>Status:</strong> {selectedRoute.status}</p>
                        <p><strong>Delivery Date:</strong> {selectedRoute.deliveryStartDate ? new Date(selectedRoute.deliveryStartDate).toLocaleString() : 'Not Started'}</p>
                        <p><strong>Last Updated:</strong> {new Date(selectedRoute.updatedAt).toLocaleString()}</p>
                        <p><strong>Notes:</strong> {selectedRoute.notes || 'No notes available'}</p>
                        <div>
                            <strong>Route Stops:</strong>
                            <div className="route-stops">
                                {Object.entries(selectedRoute.routeStops.reduce((groups, stop) => {
                                    if (!groups[stop.orderId]) {
                                        groups[stop.orderId] = [];
                                    }
                                    groups[stop.orderId].push(stop);
                                    return groups;
                                }, {})).map(([orderId, orderStops]) => (
                                    <div key={orderId} className="order-group">
                                        <h3 className="info-label">Order ID: {orderId}</h3>
                                        <div className="order-info-container">
                                            
                                            <span className="order-info-item">
                                                Receiver Name: {selectedRoute.routeStops.find(stop => stop.orderId === orderId)?.order?.receiverName || 'N/A'}
                                            </span>
                                            <span className="order-info-item">
                                                Receiver Phone: {selectedRoute.routeStops.find(stop => stop.orderId === orderId)?.order?.receiverPhone || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="stops-container">
                                            {orderStops
                                                .sort((a, b) => {
                                                    // Sắp xếp để "pickup" lên đầu
                                                    if (a.stopType === "pickup") return -1;
                                                    if (b.stopType === "pickup") return 1;
                                                    return 0;
                                                })
                                                .map((stop, index) => (
                                                    <div key={index} className="route-stop-item">
                                                        <span className="route-stop-marker"></span>
                                                        <p>{stop.address}</p>
                                                        <span>Stops type: {stop.stopType}</span>

                                                        
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default DeliveryPage;
