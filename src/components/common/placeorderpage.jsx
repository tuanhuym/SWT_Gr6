import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Form, Card, Row, Col, Select, Radio, AutoComplete, message, Modal } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../css/placeorderpage.css';
import Footer from './footer';
import Navbar2 from './navbar2';
import axios from 'axios';
import { LoadScriptNext, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { Tooltip } from 'antd';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const defaultPosition = [10.8231, 106.6297]; 
const libraries = ["places"];

function PlaceOrderPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const formData = location.state || {};
    const [form] = Form.useForm(); 
    const [vehicleTypes, setVehicleTypes] = useState([]); 
    const [vehicleType, setVehicleType] = useState(null); 
    const [distance, setDistance] = useState(null); 
    const mapContainerStyle = {
        height: "100%", 
        width: "100%",   
    };

    const center = {
        lat: 10.8231,    
        lng: 106.6297,   
    };

    const handleContinue = (values) => {
        const formData = form.getFieldsValue();
        console.log(formData.servicePricing);
        console.log(vehicleType);
        navigate('/order-confirmation', {
            state: {
                fromProvince: formData.pickUpProvince,
                toProvince: formData.dropOffProvince,   
                pricePerAmount: selectedService.pricePerAmount,
                pricePerKg: selectedService.pricePerKg,
                servicePricingType: formData.servicePricing,
                selectedService: selectedService.name,
                pickUpLocationName: formData.pickUpLocation,
                dropOffLocationName: formData.dropOffLocation,
                pickUpLocation: pickUpLocation,
                dropOffLocation: dropOffLocation,
                vehicleType: vehicleType,
                totalPrice: price || 0,
                distance: distance || 0,
            }
        });
    };
    useEffect(() => {
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
            navigate('/login');
        }
    },[navigate]);


    useEffect(() => {
        if (selectedService && distance !== null) {
            const price = Math.round(distance * selectedService.pricePerKm); // Calculate price
            form.setFieldsValue({ price: price }); // Set the hidden price
        }
    }, [vehicleType, distance, form]); // Thêm selectedService vào dependencies

    const [pickUpLocation, setPickUpLocation] = useState(null);
    const [dropOffLocation, setDropOffLocation] = useState(null);
    const [pickUpAutocomplete, setPickUpAutocomplete] = useState(null);
    const [dropOffAutocomplete, setDropOffAutocomplete] = useState(null);

    const onPickUpLoad = (autocomplete) => {
        setPickUpAutocomplete(autocomplete);
    };

    const onDropOffLoad = (autocomplete) => {
        setDropOffAutocomplete(autocomplete);
    };

    // Add this function to calculate distance
    const calculateDistance = useCallback(async (origin, destination) => {
        if (!origin || !destination) return;

        const service = new window.google.maps.DistanceMatrixService();
        
        try {
            const response = await service.getDistanceMatrix({
                origins: [{ lat: origin.lat, lng: origin.lng }],
                destinations: [{ lat: destination.lat, lng: destination.lng }],
                travelMode: window.google.maps.TravelMode.DRIVING,
                unitSystem: window.google.maps.UnitSystem.METRIC
            });

            if (response.rows[0].elements[0].status === "OK") {
                const distanceInMeters = response.rows[0].elements[0].distance.value;
                const distanceInKm = distanceInMeters / 1000;
                setDistance(distanceInKm);
                console.log(`Distance: ${distanceInKm} km`);
            } else {
                console.error("Error calculating distance:", response);
            }
        } catch (error) {
            console.error("Error in distance calculation:", error);
        }
    }, []);

    // Update the place select handlers to calculate distance when both locations are set
    const handlePickUpPlaceSelect = () => {
        if (pickUpAutocomplete) {
            const place = pickUpAutocomplete.getPlace();
            if (!place.geometry) return;

            const newPickUpLocation = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };
            
            setPickUpLocation(newPickUpLocation);
            
            // Lấy tỉnh/thành phố từ address_components
            const province = place.address_components?.find(
                component => 
                    component.types.includes('administrative_area_level_1') ||
                    component.types.includes('locality')
            )?.long_name || '';

            setPickUpInputValue(place.formatted_address);
            form.setFieldsValue({ 
                pickUpLocation: place.formatted_address,
                pickUpProvince: province
            });

            // Gọi API nếu đã có dropOffProvince
            const dropOffProvince = form.getFieldValue('dropOffProvince');
            if (dropOffProvince) {
                fetchTransportServices(province, dropOffProvince);
            }

            if (dropOffLocation) {
                calculateDistance(newPickUpLocation, dropOffLocation);
            }
        }
    };

    const handleDropOffPlaceSelect = () => {
        if (dropOffAutocomplete) {
            const place = dropOffAutocomplete.getPlace();
            if (!place.geometry) return;

            const newDropOffLocation = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };

            setDropOffLocation(newDropOffLocation);
            
            const province = place.address_components?.find(
                component => 
                    component.types.includes('administrative_area_level_1') ||
                    component.types.includes('locality')
            )?.long_name || '';

            setDropOffInputValue(place.formatted_address);
            form.setFieldsValue({ 
                dropOffLocation: place.formatted_address,
                dropOffProvince: province
            });

            // Gọi API nếu đã có pickUpProvince
            const pickUpProvince = form.getFieldValue('pickUpProvince');
            if (pickUpProvince) {
                fetchTransportServices(pickUpProvince, province);
            }

            if (pickUpLocation) {
                calculateDistance(pickUpLocation, newDropOffLocation);
            }
        }
    };

    const [pickUpProvince, setPickUpProvince] = useState('');
    const [dropOffProvince, setDropOffProvince] = useState('');
    const [fetchedServices, setFetchedServices] = useState(null);
    const [selectedService, setSelectedService] = useState(() => null);
    const [price, setPrice] = useState(null);
    const [servicePricing, setServicePricing] = useState(null);
    const calculatePrice = useCallback(() => {
        if (selectedService && distance !== null) {
            const calculatedPrice = Math.round(distance * selectedService.pricePerKm);
            setPrice(calculatedPrice);
            form.setFieldsValue({ price: calculatedPrice });
        }
    }, [selectedService, distance, form]);

    useEffect(() => {
        calculatePrice();
    }, [calculatePrice]);

    const fetchTransportServices = async (fromProvince, toProvince) => {
        const query = `
            query FindManySuitableTransportService($data: FindManySuitableTransportServiceInputData!) {
                findManySuitableTransportService(data: $data) {
                    name
                    transportServiceId
                    pricePerKm
                    pricePerAmount
                    pricePerKg
                    description
                    updatedAt
                    
                }
            }
        `;

        const variables = {
            data: {
                fromProvince: fromProvince,
                toProvince: toProvince
            }
        };

        try {
            const response = await axios.post('http://26.61.210.173:3001/graphql', {
                query,
                variables
            });

            if (response.data && response.data.data && response.data.data.findManySuitableTransportService) {
                const services = response.data.data.findManySuitableTransportService;
                setVehicleTypes(services);
                setFetchedServices(services);
                console.log('Fetched transport services:', services);
                
            } else {
                console.log('No transport services found or unexpected response structure');
                
                setFetchedServices(null);
            }
        } catch (error) {
            console.error('Error fetching transport services:', error);
            message.error('Failed to fetch transport services. Please try again.');
            setFetchedServices(null);
        }
    };

    useEffect(() => {
        if (pickUpProvince && dropOffProvince) {
            fetchTransportServices();
        }
    }, [pickUpProvince, dropOffProvince]);

    const handleProvinceChange = (field, value) => {
        if (field === 'pickUpProvince') {
            setPickUpProvince(value);
            form.setFieldsValue({ pickUpProvince: value });
        } else {
            setDropOffProvince(value);
            form.setFieldsValue({ dropOffProvince: value });
        }
    };

    const handleServiceSelect = useCallback((e) => {
        const selectedServiceId = e.target.value;
        const service = fetchedServices.find(s => s.transportServiceId === selectedServiceId);
        if (service) {
            setSelectedService(service);
            form.setFieldsValue({ vehicleType: selectedServiceId });
            setVehicleType(selectedServiceId);
        }

    }, [fetchedServices, form]);

    const [formIsComplete, setFormIsComplete] = useState(false);

    // Add this useEffect to check form completeness
    useEffect(() => {
        const checkFormCompleteness = () => {
            const values = form.getFieldsValue();
            const isComplete = values.pickUpProvince &&
                values.pickUpLocation &&
                values.dropOffProvince &&
                values.dropOffLocation &&
                values.vehicleType &&
                price !== null &&
                values.servicePricing;
            setFormIsComplete(isComplete);
        };

        form.validateFields({ validateOnly: true }).then(checkFormCompleteness);
    }, [form, price]);

    useEffect(() => {
        if (formData) {
            form.setFieldsValue(formData); // Đặt li giá trị form
        }
    }, [formData, form]);

    // Add useEffect to update price when distance changes
    const [isMinPriceKm,setisMinPriceKm] = useState(false)
    useEffect(() => {
        
        if (selectedService && distance !== null) {

                const calculatedPrice = Math.round(distance * selectedService.pricePerKm);
                if(calculatedPrice <30000){
                    setPrice(30000);
                form.setFieldsValue({ price: 30000 });
                setisMinPriceKm(true)
                }else{
                    setPrice(calculatedPrice);
                    form.setFieldsValue({ price: calculatedPrice });
                }
                
            
            
        }
    }, [selectedService, distance, form]);

    // Thêm state để quản lý giá trị input
    const [pickUpInputValue, setPickUpInputValue] = useState('');
    const [dropOffInputValue, setDropOffInputValue] = useState('');

    // Thêm state để theo dõi việc map đã load chưa
    const [mapLoaded, setMapLoaded] = useState(false);

    // Thêm handler khi map load xong
    const onMapLoad = useCallback((map) => {
        setMapLoaded(true);
        setMap(map);
    }, []);

    const [directions, setDirections] = useState(null);

    // Thêm hàm để tính và hiển thị route
    const calculateRoute = useCallback(() => {
        if (!pickUpLocation || !dropOffLocation) return;

        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(
            {
                origin: pickUpLocation,
                destination: dropOffLocation,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    // Cập nhật khoảng cách từ directions result
                    const route = result.routes[0];
                    if (route && route.legs[0]) {
                        const distanceInMeters = route.legs[0].distance.value;
                        const distanceInKm = distanceInMeters / 1000;
                        setDistance(distanceInKm);
                    }
                } else {
                    console.error('Error calculating route:', status);
                }
            }
        );
    }, [pickUpLocation, dropOffLocation]);

    // Gọi calculateRoute khi có cả 2 địa điểm
    useEffect(() => {
        if (pickUpLocation && dropOffLocation) {
            calculateRoute();
        }
    }, [pickUpLocation, dropOffLocation, calculateRoute]);

    const [map, setMap] = useState(null);

    // Hàm để fit bounds khi có 2 markers
    const fitBounds = useCallback(() => {
        if (map && pickUpLocation && dropOffLocation) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(pickUpLocation);
            bounds.extend(dropOffLocation);
            map.fitBounds(bounds);

            // Thêm padding để markers không bị sát mép
            const padding = { top: 50, right: 50, bottom: 50, left: 50 };
            map.fitBounds(bounds, padding);
        }
    }, [map, pickUpLocation, dropOffLocation]);

    // Gọi fitBounds khi có cả 2 địa điểm
    useEffect(() => {
        fitBounds();
    }, [pickUpLocation, dropOffLocation, fitBounds]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);

    const showModal = (service) => {
        setSelectedServiceDetails(service);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    return (
        <LoadScriptNext 
            googleMapsApiKey="AIzaSyDJO2B-_FLwk1R1pje5gKEAB9h2qUDb-FU"
            libraries={libraries}
        >
            <div>
                <Row className="placeorder-page">
                    <Navbar2 />
                    <Col span={8} className="left-section">
                        <h2 className="section-title">Location</h2>
                        <Form
                            layout="vertical"
                            className="route-form"
                            onFinish={handleContinue}
                            form={form}
                            onValuesChange={() => {
                                const values = form.getFieldsValue();
                                const isComplete = values.pickUpProvince &&
                                    values.pickUpLocation &&
                                    values.dropOffProvince &&
                                    values.dropOffLocation &&
                                    values.vehicleType &&
                                    price !== null &&
                                    values.servicePricing;
                                setFormIsComplete(isComplete);
                            }}
                        
                        >
                            <h3>Pick-up location</h3>
                            <Row gutter={0} style={{ display: 'flex', alignItems: 'center' }}>
                                <Col>
                                    <Form.Item name="pickUpProvince" style={{ marginBottom: 0, marginRight: 8, display:'none' }}>
                                        <Input
                                            style={{ width: '150px' }}
                                            type="text"
                                            onChange={(e) => handleProvinceChange('pickUpProvince', e.target.value)}
                                            placeholder='Pick-up Province'
                                        />
                                    </Form.Item>
                                </Col>
                                <Col flex="auto">
                                    <Form.Item name="pickUpLocation" style={{ marginBottom: 0 }}>
                                        <Autocomplete
                                            onLoad={onPickUpLoad}
                                            onPlaceChanged={handlePickUpPlaceSelect}
                                            options={{
                                                componentRestrictions: { country: 'vn' },
                                                fields: ['address_components', 'formatted_address', 'geometry'],
                                                types: ['address']
                                            }}
                                        >
                                            <Input 
                                                placeholder="Select pick-up location"
                                                value={pickUpInputValue}
                                                onChange={(e) => setPickUpInputValue(e.target.value)}
                                            />
                                        </Autocomplete>
                                    </Form.Item>
                                </Col>
                            </Row>

                                <h3>Drop-off location</h3>
                                <Row gutter={0} style={{ display: 'flex', alignItems: 'center' }}>
                                    <Col>
                                        <Form.Item name="dropOffProvince" style={{ marginBottom: 0, marginRight: 8, display:'none'}}>
                                            <Input
                                                style={{ width: '150px' }}
                                                type="text"
                                                onChange={(e) => handleProvinceChange('dropOffProvince', e.target.value)}
                                                placeholder='Drop-off Province'
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col flex="auto">
                                        <Form.Item name="dropOffLocation" style={{ marginBottom: 0 }}>
                                            <Autocomplete
                                                onLoad={onDropOffLoad}
                                                onPlaceChanged={handleDropOffPlaceSelect}
                                                options={{
                                                    componentRestrictions: { country: 'vn' },
                                                    fields: ['address_components', 'formatted_address', 'geometry'],
                                                    types: ['address']
                                                }}
                                            >
                                                <Input 
                                                    placeholder="Select drop-off location"
                                                    value={dropOffInputValue}
                                                    onChange={(e) => setDropOffInputValue(e.target.value)}
                                                />
                                            </Autocomplete>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                



                        {fetchedServices && (
                            <Form.Item name="vehicleType" rules={[{ required: true, message: 'Please select a transport service' }]}>
                                <h2 className="section-title">Transport Services</h2>
                                <div className="vehicle-scroll-container" style={{ border: 'none' }}>
                                    <Radio.Group className="vehicle-radio-group" onChange={handleServiceSelect}>
                                        {fetchedServices.map(service => (
                                            <Radio key={service.transportServiceId} value={service.transportServiceId}>
                                                {service.name === "Road" && <img src='src/images/truck.png' alt="Road" />}
                                                {service.name === "Air" && <img src='src/images/plane.png' alt="Air" />}
                                                <div>{service.name}</div>
                                                
                                                <a 
                                                    className="detail-service-btn"
                                                    href="#" 
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        showModal(service);
                                                    }}                                                  
                                                >
                                                    Detail
                                                </a>
                                            </Radio>
                                        ))}
                                    </Radio.Group>
                                    <Modal
                                        title="Service Details"
                                        open={isModalVisible}
                                        onCancel={handleModalClose}
                                        footer={null}
                                        width={400}
                                        centered
                                    >
                                        {selectedServiceDetails && (
                                            <div style={{ padding: '10px' }}>
                                                <p style={{ marginBottom: '10px' }}>
                                                    <strong>Service Name:</strong> {selectedServiceDetails.name}
                                                </p>
                                                <p style={{ marginBottom: '10px' }}>
                                                    <strong>Price per km:</strong> {selectedServiceDetails.pricePerKm.toLocaleString()} VNĐ
                                                </p>
                                                <p style={{ marginBottom: '10px' }}>
                                                    <strong>Price per amount:</strong> {selectedServiceDetails.pricePerAmount.toLocaleString()} VNĐ
                                                </p>
                                                <p style={{ marginBottom: '10px' }}>
                                                    <strong>Price per kg:</strong> {selectedServiceDetails.pricePerKg.toLocaleString()} VNĐ
                                                </p>
                                                <p style={{ marginBottom: '10px' }}>
                                                    <strong>Description:</strong> {selectedServiceDetails.description}
                                                </p>
                                                <p style={{ marginBottom: '10px' }}>
                                                    <strong>Last updated at:</strong> {new Date(selectedServiceDetails.updatedAt).toLocaleTimeString()} {new Date(selectedServiceDetails.updatedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </Modal>
                                </div>
                            </Form.Item>
                        )}

                        
                        {selectedService && (
                            <>
                                <h2 className="section-title">Service Pricing</h2>
                                <Form.Item
                                    name="servicePricing"
                                    rules={[{ required: true, message: 'Please choose a service pricing' }]}
                                >
                                    <Select
                                        placeholder="Service Pricing"
                                        style={{ width: '180px' }}
                                        onChange={(value) => {
                                            setServicePricing(value);
                                            form.setFieldsValue({ servicePricing: value });
                                        }}
                                    >
                                        <Option value="volume">Volume (Kilograms)</Option>
                                        <Option value="amount">Quantity (Fish)</Option>
                                    </Select>
                                </Form.Item>
                            </>
                        )}

                        <Form.Item
                            name="price"
                            style={{ display: 'none' }}
                        >
                            <Input />
                        </Form.Item>
                    </Form>
                    <div style={{marginTop: '120px'}}>
                    {distance !== null && distance > 0 && price !== null && (
                        <div className="distance-display">                            
                                <span >
                                    Provisional Price: {price?.toLocaleString() || '0'} VNĐ
                                </span>                   
                                <Tooltip 
                                    title={
                                        
                                        <div>
                                            Provisional Price = Distance × Price per km<br/>
                                            Distance: {distance?.toFixed(2)} km<br/>
                                            Price per km: {selectedService?.pricePerKm?.toLocaleString()} VNĐ <br/>
                                            Notice: <br/>
                                            
                                            Distance below { Math.ceil(30000 / selectedService?.pricePerKm) } Km will charge delivery fee of 30,000 VNĐ
                                            


                                        </div>
                                    }
                                    overlayStyle={{ 
                                        maxWidth: '400px',  // Increase tooltip width
                                        minWidth: '300px'   // Set minimum width
                                    }}
                                >
                                    <FontAwesomeIcon icon={faCircleInfo}  style={{marginLeft: '10px'}}/>
                                </Tooltip>
                        </div>
                    )}
                    <Form.Item>
                        {formIsComplete && (
                    <Button
                         className="submit-btn"
                        type="primary"
                        htmlType="submit"
                        onClick={handleContinue}                                
                    >
                            Continue
                    </Button>
                    )}
                </Form.Item>
                    </div>
                </Col>
               
                <Col span={16} className="map-section">
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        zoom={12}
                        center={pickUpLocation || center}
                        onLoad={onMapLoad}
                    >
                        {pickUpLocation && (
                            <Marker
                                position={pickUpLocation}
                                icon={{
                                    url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                                    scaledSize: new window.google.maps.Size(40, 40)
                                }}
                                title="Pick-up Location"
                            />
                        )}

                        {dropOffLocation && (
                            <Marker
                                position={dropOffLocation}
                                icon={{
                                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                                    scaledSize: new window.google.maps.Size(40, 40)
                                }}
                                title="Drop-off Location"
                            />
                        )}
                    </GoogleMap>

                    {/* Hiển thị thông tin khoảng cách */}
                    {distance !== null && (
                        <div className="distance-info" style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '20px',
                            backgroundColor: 'white',
                            padding: '10px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            zIndex: 1
                        }}>
                            <strong>Distance:</strong> {distance.toFixed(2)} km
                        </div>
                    )}
                </Col> 

            </Row>
            <Footer />
            </div>
        </LoadScriptNext>
    );
};

export default PlaceOrderPage;
