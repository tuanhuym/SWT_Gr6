import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { Modal, Form, Input, Row, Col, Select, Checkbox, Radio, message, Table, Spin } from 'antd';
import '../../../css/transportservice.css';

function ManageRoute() {
  const [showForm, setShowForm] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);


  const [disabledItems, setDisabledItems] = useState(new Set());
  const [orders, setOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedFishIndex, setSelectedFishIndex] = useState(null);

  const toggleFishDetails = (index) => {
    setSelectedFishIndex(selectedFishIndex === index ? null : index);
  };

  const fetchOrder = async () => {
    setLoading(true);
    const query = `
      query FindManyProcessingOrder {
        findManyProcessingOrder {
          orderId
          fromProvince
          toProvince
          fromAddress
              toAddress
              totalPrice
              orderStatus
              receiverName
              receiverPhone
          transportService {
            type
          }
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
    `;
    try {
      const orderResponse = await axios.post('http://26.61.210.173:3001/graphql', {
        query,
      }, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('API Response:', orderResponse.data);

      if (orderResponse.data && orderResponse.data.data) {
        setOrders(orderResponse.data.data.findManyProcessingOrder);
      } else {
        console.error('Invalid response structure:', orderResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }


  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const query = `
      query FindManyAvailableDriver {
  findManyAvailableDriver {
    driverId
    currentProvince
          status
          account {
            username
          }
          }
        }
      `;
      const driverResponse = await axios.post('http://26.61.210.173:3001/graphql', {
        query,
      }, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        }
      });
      setDrivers(driverResponse.data.data.findManyAvailableDriver);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const query = `
      query FindManyRoutes {
        findManyRoutes {
          routeId
          numberofOrders
          driver {
            account {
              username
            }
          }
          status
         deliveryStartDate
          updatedAt
          notes
          routeStops {
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
        query,
      }, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        }
      });
      setRoutes(routeResponse.data.data.findManyRoutes);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrder();
    console.log(orders);
    console.log(sessionStorage.getItem('accessToken'));
    fetchDrivers();
    fetchRoutes();
  }, []);

  const handleCreate = () => {

    setShowForm(true);

  };
  const handleView = (route) => {
    setSelectedRoute(route);
    setIsModalOpen(true);
    console.log('Selected rout:', route);
  };
  const handleViewOrder = (record) => {
    setSelectedOrderDetail(record);
    setIsOrderModalOpen(true);
    console.log('Selected Order Detail:', record);
  };
  const handleOrderSelect = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const getSelectedFromProvinces = () => {
    return [...new Set(
      orders
        .filter(order => selectedOrders.includes(order.orderId))
        .map(order => order.fromProvince)
    )];
  };

  const filteredDrivers = selectedLocation
    ? drivers.filter(driver => driver.currentProvince === selectedLocation)
    : drivers;

  const handleCreateRoute = async (values) => {
    if (!selectedDriver) {
      message.error('Please select a driver');
      return;
    }
    if (selectedOrders.length === 0) {
      message.error('Please select at least one order');
      return;
    }
    const formData = form.getFieldsValue();
    const routeData = {
      notes: formData.note,
      driverId: selectedDriver,
      orderIds: selectedOrders
    };
    const createRouteResponse = await axios.post('http://26.61.210.173:3001/api/transport/create-route', routeData, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      }
    });


    console.log('Creating new route with data:', routeData);
    message.success('Route created successfully');


    form.resetFields();
    setSelectedDriver(null);
    setSelectedOrders([]);
    setShowForm(false);
    fetchRoutes();
  };

  const orderColumns = [
    {
      title: 'Order Id',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Transport Type',
      dataIndex: ['transportService', 'type'],
      key: 'transportType',
    },
    {
      title: 'From Province',
      dataIndex: 'fromProvince',
      key: 'fromProvince',
    },
    {
      title: 'To Province',
      dataIndex: 'toProvince',
      key: 'toProvince',
    },
    {
      title: 'Select',
      key: 'select',
      render: (_, record) => (
        <Checkbox
          checked={selectedOrders.includes(record.orderId)}
          onChange={() => handleOrderSelect(record.orderId)}
        />
        
      ),
    },
    {
      title: 'View',
      key: 'view',
      render: (_, record) => (
        <button className="view-button" onClick={() => handleViewOrder(record)}>
          <FontAwesomeIcon icon={faEye} />
        </button>
      ),
    },
  ];

  const driverColumns = [
    {
      title: 'Driver ID',
      dataIndex: 'driverId',
      key: 'driverId',
    },
    {
      title: 'Driver Name',
      dataIndex: ['account', 'username'],
      key: 'driverName',
    },
    {
      title: 'Current Location',
      dataIndex: 'currentProvince',
      key: 'currentLocation',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`status-driver ${status}`}>{status}</span>
      ),
    },
    {
      title: 'Select',
      key: 'select',
      render: (_, record) => (
        <Radio
          checked={selectedDriver === record.driverId}
          onChange={() => setSelectedDriver(record.driverId)}
        />
      ),
    },
  ];

  const routeColumns = [
    {
      title: 'No',
      key: 'index',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Route Id',
      dataIndex: 'routeId',
      key: 'routeId',
    },
    {
      title: 'Driver Name',
      dataIndex: ['driver', 'account', 'username'],
      key: 'driverName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => (
        <span className={`status-route ${status.toLowerCase()}`}>{status}</span>
      ),
    },
    {
      title: 'Delivery Date',
      dataIndex: 'deliveryStartDate',
      key: 'deliveryDate',
      render: (date) => date ? new Date(date).toLocaleString() : <span style={{ color: '#790808', fontWeight: 'bold' }}>Not Started</span>,
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <button className="view-button" onClick={() => handleView(record)}>
          <FontAwesomeIcon icon={faEye} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <h1 className='section-title'>Manage Route</h1>
      <div>
        <button className="new-route-button" onClick={handleCreate}>Create New Route</button>
      </div>

      <Modal
        title={isUpdate ? 'Update Route' : 'Create New Route'}
        className='route-detail-modal'
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
        width={1000}
        destroyOnClose={true}
      >
        <Row className="placeorder-page">

          <Col span={24} className="">
            <Form form={form}>


              {/* Fish Orders Table */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Orders</h2>
              </div>
              <div className="fish-orders-scroll-container">
                <Table 
                  loading={{
                    indicator: (
                      <div style={{ padding: "20px 0" }}>
                        <Spin tip="Loading..." size="large" />
                      </div>
                    ),
                    spinning: loading
                  }}
                  columns={orderColumns}
                  dataSource={orders}
                  pagination={false}
                  scroll={{ y: 240 }}
                  rowKey="orderId"
                />
              </div>
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h2 className="section-title" style={{ margin: 0 }}>Driver</h2>
                  <Select
                    style={{ width: 200 }}
                    placeholder="Filter by location"
                    allowClear
                    onChange={(value) => setSelectedLocation(value)}
                  >
                    {getSelectedFromProvinces().map(location => (
                      <Select.Option key={location} value={location}>
                        {location}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div>

                </div>
                <div className="fish-orders-scroll-container">

                  <Table 
                    loading={{
                      indicator: (
                        <div style={{ padding: "20px 0" }}>
                          <Spin tip="Loading..."  />
                        </div>
                      ),
                      spinning: loading
                    }}
                    columns={driverColumns}
                    dataSource={filteredDrivers}
                    pagination={false}
                    scroll={{ y: 240 }}
                    rowKey="driverId"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Note</h2>
              </div>
              <Form.Item name="note" >
                <Input.TextArea style={{ height: '150px',marginTop:'15px' }} />
              </Form.Item>
            </Form>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                className="new-route-button"
                onClick={handleCreateRoute}
              >
                Create Route
              </button>
            </div>
          </Col>
        </Row>

      </Modal>
      <Table 
        loading={{
          indicator: (
            <div style={{ padding: "20px 0" }}>
              <Spin tip="Loading..." size="large" />
            </div>
          ),
          spinning: loading
        }}
        columns={routeColumns}
        dataSource={routes}
        rowKey="routeId"
        rowClassName={(record) => disabledItems.has(record.routeId) ? 'disabled-row' : ''}
      />
      <Modal
        title={`Route ID: ${selectedRoute?.routeId}`}
        className='route-detail-modal'
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={1000}
      >
        {selectedRoute && (
          <div className="route-detail">
            <div className="route-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="section-title" style={{ margin: 0 }}>Route Information</h2>
              </div>
              <div className="info-item">
                <span className="info-label"><strong>Driver:</strong></span>
                <span className="info-value">{selectedRoute.driver.account.username}</span>
              </div>


              <div className="info-item">
                <span className="info-label"><strong>Delivery Date:</strong></span>
                <span className="info-value">
                  {selectedRoute.deliveryStartDate ? selectedRoute.deliveryStartDate : <span style={{ color: '#790808', fontWeight: 'bold' }}>Not Started</span>}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label"><strong>Last Updated:</strong></span>
                <span className="info-value">{new Date(selectedRoute.updatedAt).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><strong>Notes:</strong></span>
                <span className="info-value">{selectedRoute.notes}</span>
              </div>
              
              <div className="info-item" >
                <span className="info-label"><strong>Status:</strong></span>
                <span className={`status-route ${selectedRoute.status.toLowerCase()}`}>
                  {selectedRoute.status}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label"><strong>Number of orders:</strong></span>
                <span className="info-value">{selectedRoute.numberofOrders}</span>
              </div>
              


            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="section-title" style={{ margin: 0 }}>Route Stops</h2>
              <a style={{ color: '#ff7700', cursor: 'pointer' }}>+ Add Stop</a>
            </div>
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
                    <span className="order-info-item">Transport type: {selectedRoute.routeStops.find(stop => stop.orderId === orderId).order.transportService.type}</span>
                    <span className="order-info-item">Receiver Name: {selectedRoute.routeStops.find(stop => stop.orderId === orderId).order.receiverName}</span>
                    <span className="order-info-item">Receiver Phone: {selectedRoute.routeStops.find(stop => stop.orderId === orderId).order.receiverPhone}</span>
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
                          
                          <span className={`status-route ${stop.status.toLowerCase()}`}>
                            {stop.status}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Order Details"
        open={isOrderModalOpen}
        onCancel={() => setIsOrderModalOpen(false)}
        footer={null}
        width={800}
        className="order-detail-modal"
      >
        {selectedOrderDetail && (
          <div className="order-detail">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Order ID:</span>
                <span className="info-value">{selectedOrderDetail.orderId}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Transport Type:</span>
                <span className="info-value">{selectedOrderDetail.transportService.type}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`status-order ${selectedOrderDetail.orderStatus.toLowerCase()}`}>
                  {selectedOrderDetail.orderStatus}
                </span>
              </div>
              
            </div>

            <div className="address-section">
              <h3>Sender Information</h3>
              {/* <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{selectedOrderDetail.senderName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{selectedOrderDetail.senderPhone}</span>
              </div> */}
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{selectedOrderDetail.fromAddress}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Province:</span>
                <span className="info-value">{selectedOrderDetail.fromProvince}</span>
              </div>
            </div>

            <div className="address-section">
              <h3>Receiver Information</h3>
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span className="info-value">{selectedOrderDetail.receiverName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{selectedOrderDetail.receiverPhone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{selectedOrderDetail.toAddress}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Province:</span>
                <span className="info-value">{selectedOrderDetail.toProvince}</span>
              </div>
            </div>

            <div className="price-section">
              <div className="info-item">
                <span className="info-label">Total Price:</span>
                <span className="info-value price">
                  {selectedOrderDetail.totalPrice.toLocaleString()} VND
                </span>
              </div>
            </div>

            <div className="fish-section">
              <h3>Ordered Fish</h3>
              {selectedOrderDetail.orderedFish && selectedOrderDetail.orderedFish.map((fish, index) => (
                <div key={index} className="fish-item">
                  <p
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleFishDetails(index)}
                  >
                    <strong>Name:</strong> {fish.name}
                  </p>
                  {selectedFishIndex === index && (
                    <div className="fish-details">
                      <p><strong>Species:</strong> {fish.species}</p>
                      <p><strong>Gender:</strong> {fish.gender}</p>
                      <p><strong>Age:</strong> {fish.ageInMonth} months</p>
                      <p><strong>Weight:</strong> {fish.weight} g</p>
                      <p><strong>Description:</strong> {fish.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

export default ManageRoute;