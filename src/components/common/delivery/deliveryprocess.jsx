import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Select, Spin } from 'antd';
import '../../../css/deliverypage.css';
import axios from "axios";

function DeliveryProcess() {
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchRoute = async () => {
        try {
            setLoading(true);
            const query = `
            query FindOneDeliveringRoute {
                findOneDeliveringRoute {
                    routeId    
                    driver {
                        account {
                            username
                        }
                    }
                    status    
                    updatedAt
                    notes
                    routeStops {
                        routeStopId
                        address
                        status
                        stopType
                        orderId
                        order {
                            transportService {
                                type
                            }
                        }
                    }
                }
            }
            `;
            const routeResponse = await axios.post('http://26.61.210.173:3001/graphql', {
                query
            }, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
                }
            });

            if (routeResponse.data?.data?.findOneDeliveringRoute) {
                setRoute(routeResponse.data.data.findOneDeliveringRoute);
            } else {
                console.error("No route data found");
                setRoute(null);
            }
        } catch (error) {
            console.log(error);
            setRoute(null);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async (stop, routeStopId) => {
        try {
            setLoading(true);
            const status = stop.status === 'pending' ? 'delivering' : 'completed';
            await axios.patch(`http://26.61.210.173:3001/api/transport/update-route-stop-status`, {
                routeStopId: routeStopId,
                status: status
            }, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                }
            });
            fetchRoute();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoute();
    }, []);

    return (
        <Spin spinning={loading} tip="Loading...">
            <div className="delivery-process">
                <h1 className="section-title">Process Route</h1>

                {!loading && !route ? (
                    <div className="no-route-message">Don't have process route</div>
                ) : (
                    route && (
                        <>
                            <div className="delivery-process__section">
                                <h2 className="section-title">Route Information</h2>
                                <div className="info-item">
                                    <span className="info-label"><strong>Route ID:</strong></span>
                                    <span className="info-value">{route?.routeId}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label"><strong>Driver:</strong></span>
                                    <span className="info-value">{route?.driver?.account?.username}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label"><strong>Status:</strong></span>
                                    <span className={`status-route ${route?.status.toLowerCase()}`}>{route?.status}</span>
                                </div>
                            </div>

                            <div className="delivery-process__section">
                                <h2 className="section-title">Time Line</h2>
                                <div className="delivery-process__info">
                                    <div className="info-item">
                                        <span className="info-label"><strong>Last Updated: </strong></span>
                                        <span className="info-value">{new Date(route?.updatedAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="delivery-process__section">
                                <h2 className="section-title">Route Stops</h2>
                                <div className="route-stops">
                                    {Object.entries((route?.routeStops || []).reduce((groups, stop) => {
                                        if (!groups[stop.orderId]) {
                                            groups[stop.orderId] = [];
                                        }
                                        groups[stop.orderId].push(stop);
                                        return groups;
                                    }, {})).map(([orderId, orderStops]) => (
                                        <div key={orderId} className="order-group">
                                            <h3 className="info-label" style={{fontSize:'16px'}}>Order ID: {orderId}</h3>
                                            <span>Transport type: {route?.routeStops.find(stop => stop.orderId === orderId).order.transportService.type}</span>
                                            <div className="stops-container">
                                                {orderStops
                                                    .sort((a, b) => {
                                                        if (a.stopType === "pickup") return -1;
                                                        if (b.stopType === "pickup") return 1;
                                                        return 0;
                                                    })
                                                    .map((stop, index) => (
                                                        <div key={index} className="route-stop-item">
                                                            <span className="route-stop-marker"></span>
                                                            <p>{stop.address}</p>
                                                            <span>Stops type: {stop.stopType}</span>
                                                            <span className={`status-route ${stop.status.toLowerCase()}`}>
                                                                {stop.status}
                                                            </span>
                                                            {stop.status === "pending" && (
                                                                <Button className="delivery-button" type="primary" onClick={() => handleChangeStatus(stop, stop.routeStopId)}>Deliver</Button>
                                                            )}
                                                            {stop.status === "delivering" && (
                                                                <Button className="delivery-button" type="primary" onClick={() => handleChangeStatus(stop, stop.routeStopId)}>Completed</Button>
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )
                )}
            </div>
        </Spin>
    );
}

export default DeliveryProcess;
