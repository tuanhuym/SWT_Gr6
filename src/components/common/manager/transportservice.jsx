import React, { useState, useEffect } from 'react';
import { useQuery, ApolloProvider, ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { Button, Table, Modal, Form, Input, Switch, Select } from 'antd';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const GET_TRANSPORT_SERVICE = gql`
  query FindAllTransportService($data: FindAllTransportServiceInputData!) {
    findAllTransportService(data: $data) {
      transportServiceId
      name
      type
      pricePerKm
      pricePerKg
      pricePerAmount
      description
      isActive
    }
  }
`;

const client = new ApolloClient({
  uri: 'http://26.61.210.173:3001/graphql',
  cache: new InMemoryCache(),
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
  },
  defaultOptions: {
    watchQuery: { fetchPolicy: 'network-only', errorPolicy: 'all' },
    query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
  },
});

function TransportService() {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const { loading: queryLoading, error, data: apiData, refetch } = useQuery(GET_TRANSPORT_SERVICE, {
    client,
    variables: { data: { options: { take: 10, skip: 0 } } },
    onError: (error) => {
      console.error('GraphQL Error:', error);
      toast.error("Error fetching transport services: " + error.message);
    },
  });

  useEffect(() => {
    if (apiData) {
      setData(apiData.findAllTransportService || []);
      setLoading(false);
    }
  }, [apiData]);

  const openAddModal = () => {
    form.resetFields();
    setFormData(null);
    setShowForm(true);
  };

  const openEditModal = (record) => {
    setFormData(record);
    form.setFieldsValue(record);
    setShowForm(true);
  };

  const handleCreate = async (values) => {
    try {
      // Send a POST request to create a new transport service with Authorization header
      const response = await axios.post(
        'http://26.61.210.173:3001/api/transport/create-transport-service',
        {
          name: values.name,
          type: values.type,
          description: values.description,
          pricePerKm: values.pricePerKm,
          pricePerKg: values.pricePerKg,
          pricePerAmount: values.pricePerAmount
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
          }
        }
      );

      if (response.data) {
        toast.success("Transport service added successfully");
        refetch(); // Refetch data to reflect changes
        setShowForm(false); // Close the form modal
      }
    } catch (error) {
      console.error("Error adding transport service:", error);
      toast.error("Failed to add transport service");
    }
  };


  const handleEdit = async (values) => {
    try {
      console.log("Edit Payload:", values);
      // Send a PATCH request to update the transport service
      const response = await axios.patch(
        'http://26.61.210.173:3001/api/transport/update-transport-service',
        {
          transportServiceId: values.transportServiceId,
          name: values.name,
          type: values.type,
          description: values.description,
          pricePerKm: values.pricePerKm,
          pricePerKg: values.pricePerKg,
          pricePerAmount: values.pricePerAmount
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
          }
        }
      );

      if (response.data) {
        console.log("Edit Response:", response.data);
        toast.success("Transport service updated successfully");
        refetch(); // Refetch data to reflect changes
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error updating transport service:", error.response?.data || error.message);
      toast.error("Failed to update transport service");
    }
  };



  const handleSubmit = async (values) => {
    if (formData) {
      await handleEdit(values);
    } else {
      await handleCreate(values);
    }
  };

  const handleToggleActive = async (record) => {
    try {
      console.log("Toggle Status Payload:", { transportServiceId: record.transportServiceId });
      const response = await axios.patch(
        'http://26.61.210.173:3001/api/transport/toggle-transport-service',
        { transportServiceId: record.transportServiceId },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
          }
        }
      );

      if (response.data) {
        console.log("Toggle Status Response:", response.data);
        toast.success("Transport service status updated successfully");
        refetch();
      }
    } catch (error) {
      console.error("Error toggling transport service status:", error.response?.data || error.message);
      toast.error("Failed to update transport service status");
    }
  };

  const columns = [
    { title: 'Service ID', dataIndex: 'transportServiceId' },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Price per KM', dataIndex: 'pricePerKm' },
    { title: 'Price per KG', dataIndex: 'pricePerKg' },
    { title: 'Price per Amount', dataIndex: 'pricePerAmount' },
    { title: 'Description', dataIndex: 'description' },
    {
      title: 'Status',
      dataIndex: 'isActive',
      render: (text, record) => (
        <Button
          type="primary"
          onClick={() => handleToggleActive(record)}
          style={{
            opacity: record.isActive ? 1 : 0.5,
            backgroundColor: record.isActive ? '#ff7700' : '#ccc',
            borderColor: '#ff7700',
          }}
        >
          {record.isActive ? 'Active' : 'Inactive'}
        </Button>
      ),
    },
    {
      title: 'Actions',
      render: (text, record) => (
        <Button onClick={() => openEditModal(record)}>Edit</Button>
      ),
    },
  ];

  return (
    <ApolloProvider client={client}>
      <ToastContainer />
      <div>
        <h1 className='section-title'>Transport Services</h1>
        <button
          onClick={openAddModal}
          className='new-route-button'
          
        >
          Add Service
        </button>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading || queryLoading}
          style={{
            // Custom styles for the table header
            header: {
              backgroundColor: '#ff7700', // Set header background color to orange
              color: 'white', // Set header text color to white
            }
          }}
          rowKey="transportServiceId"
          pagination={{
            pageSize: 5, // Set the number of rows per page to 5
            showSizeChanger: false, // Optional: Hide the option to change page size
          }}
        />
        <Modal
          title={formData ? "Edit Transport Service" : "Add Transport Service"}
          open={showForm}
          onCancel={() => setShowForm(false)}
          footer={null}
        >
          <Form
            form={form}
            initialValues={formData || {}}
            onFinish={handleSubmit}
            layout="horizontal"
          >
            <Form.Item
              label="Service Type"
              name="type"
              rules={formData ? [] : [{ required: true, message: 'Please choose the service type!' }]}
            >
              <Select>
                <Select.Option value="air">Air</Select.Option>
                <Select.Option value="road">Road</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Service Name"
              name="name"
              rules={formData ? [] : [{ required: true, message: 'Please input service name!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
              rules={formData ? [] : [{ required: true, message: 'Please input description!' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              label="Price per KM"
              name="pricePerKm"
              rules={formData ? [] : [{ required: true, message: 'Please input price per KM!' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Price per KG"
              name="pricePerKg"
              rules={formData ? [] : [{ required: true, message: 'Please input price per KG!' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              label="Price per Amount"
              name="pricePerAmount"
              rules={formData ? [] : [{ required: true, message: 'Please input price per Amount!' }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item name="transportServiceId" style={{ display: 'none' }}>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#ff7700', borderColor: '#ff7700' }}>
                Save
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ApolloProvider>
  );
}

export default TransportService;
