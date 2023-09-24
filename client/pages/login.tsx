import React, { useState } from 'react';
import { Alert, Button, Form, Input, Typography } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/router';
import { setCookie } from 'cookies-next';

const { Title } = Typography;

const Login: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState('');

  const onFinish = async (values: any) => {
    axios.post('/bi/auth/login', values)
      .then(result => {
        if(result.data.token) {
          setCookie('login', '1');
          router.push('/');
        }
      })
      .catch(error => {
        setError(JSON.stringify(error?.response?.data));
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    setError(JSON.stringify(errorInfo));
  };

  type FieldType = {
    username?: string;
    password?: string;
  };

  return (
    <div className="login">
      { error
        ? <Alert
          message="Error"
          description={error}
          type="error"
          className="alert"
        />
        : null
      }
      <Title level={2} className="text-center">Login</Title>
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;