import React from "react";
import AuthenTemplate from "./validationlogin";
import { Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    // Exclude confirmPassword from the values sent to the API
    const { confirmPassword, ...dataToSend } = values;

    try {
      const response = await api.post('http://26.61.210.173:3001/api/auth/sign-up', dataToSend);
      toast.success("Registration successful!");
      navigate('/login');
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed: Please check your information");
    }
  };

  return (
    <div>
      <ToastContainer />
      <AuthenTemplate>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Register</h2>
      <Form
        labelCol={{
          span: 24,
        }}
        onFinish={handleRegister}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 6, message: "Password must be at least 6 characters long!" },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        

        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            { required: true, message: "Please input your phone number!" },
            {
              pattern: /^((\+84)|0)([1-9]{1}[0-9]{8})$/,
              message: "Please enter a valid phone number!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            {
              type: "email",
              message: "Please enter a valid email!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <div style={{ marginBottom: '24px' }}>
          <Link to="/login">Already have account? Go to login page</Link>
        </div>
        <Button type="primary" htmlType="submit">
          Register
        </Button>
      </Form>
    </AuthenTemplate>
    </div>
  );
}

export default RegisterPage;
