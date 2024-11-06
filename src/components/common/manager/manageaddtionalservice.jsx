import React, { useState, useEffect } from 'react';
import { useQuery, ApolloProvider, ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { Button, Table, Modal, Form, Input, Select } from 'antd';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const GET_ADDITIONAL_SERVICE = gql`
  query FindAllAdditionalService($data: FindAllTransportServiceInputData!) {
    findAllAdditionalService(data: $data) {
      price
      name
      isActive
      forTransportType
      description
      additionalServiceId
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

function ManageAdditionalService() {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  const { loading: queryLoading, error, data: apiData, refetch } = useQuery(GET_ADDITIONAL_SERVICE, {
    client,
    variables: { data: { options: { take: 10, skip: 0 } } },
    onError: (error) => {
      console.error('GraphQL Error:', error);
      toast.error("Error fetching additional services: " + error.message);
    },
  });

  useEffect(() => {
    if (apiData) {
      setData(apiData.findAllAdditionalService || []);
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
      const response = await axios.post(
        'http://26.61.210.173:3001/api/transport/create-additional-service',
        {
          name: values.name,
          forTransportType: values.forTransportType,
          description: values.description,
          price: values.price
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
          }
        }
      );

      if (response.data) {
        toast.success("Additional service added successfully");
        refetch();
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error adding additional service:", error);
      toast.error("Failed to add additional service");
    }
  };
  const handleToggleActive = async (record) => {
    try {
      console.log("Toggle Status Payload:", { additionalServiceId: record.additionalServiceId });
      const response = await axios.patch(
        'http://26.61.210.173:3001/api/transport/toggle-additional-service',
        { additionalServiceId: record.additionalServiceId },
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
  const handleEdit = async (values) => {
    try {
      const response = await axios.patch(
        'http://26.61.210.173:3001/api/transport/update-additional-service',
        {
          additionalServiceId: values.additionalServiceId,
          name: values.name,
          forTransportType: values.forTransportType,
          description: values.description,
          price: values.price
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`
          }
        }
      );

      if (response.data) {
        toast.success("Additional service updated successfully");
        refetch();
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error updating additional service:", error);
      toast.error("Failed to update additional service");
    }
  };

  const handleSubmit = async (values) => {
    if (formData) {
      await handleEdit(values);
    } else {
      await handleCreate(values);
    }
  };

  const columns = [
    { title: 'Service ID', dataIndex: 'additionalServiceId' },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Type', dataIndex: 'forTransportType' },
    { title: 'Price', dataIndex: 'price' },
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
            color: 'white',
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
        <h1 className='section-title'>Manage Additional Services</h1>
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
          rowKey="additionalServiceId"
          pagination={{
            pageSize: 5, // Set the number of rows per page to 5
            showSizeChanger: false,
          }}
        />
        <Modal
          title={formData ? "Edit Additional Service" : "Add Additional Service"}
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
            <Form.Item label="For Transport Type" name="forTransportType">
              <Select>
                <Select.Option value="air">Air</Select.Option>
                <Select.Option value="road">Road</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Service Name" name="name" rules={[{ required: true, message: 'Please input service name!' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item label="Price" name="price" rules={[{ required: true, message: 'Please input price!' }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="additionalServiceId" style={{ display: 'none' }}>
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

export default ManageAdditionalService;