import React, { useState } from 'react';
import { Card, Form, Input, Button, Checkbox, Alert, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi/authApi';

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setAlert({ show: false, message: '', type: '' });

    // values: { username, password, remember? }
    const payload = {
      username: values.username,
      password: values.password,
    };

    const res = await authApi(payload);

    if (res.ok) {
      console.log(res.data);
      message.success('Đăng nhập thành công!');
      // res.data giả sử { token, fullName }
      localStorage.setItem('token', res.data?.data.token || '');
      localStorage.setItem('fullName', res.data?.data.fullName || '');
      navigate('/');
    } else {
      setAlert({
        show: true,
        message: res.message || 'Đăng nhập thất bại!',
        type: 'error',
      });
    }

    setLoading(false);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-20 py-10"
      style={{
        backgroundImage:
          'url(https://tse4.mm.bing.net/th/id/OIP.eccxXLX9-Ui0XHoOKK8YfQHaDs?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-md mx-8">
        <Card className="shadow-2xl border-2 border-gray-300 rounded-xl backdrop-blur-sm bg-white/95">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Đăng Nhập
            </h2>
            <p className="text-gray-600">Chào mừng bạn trở lại!</p>
          </div>

          {alert.show && (
            <Alert
              message={alert.message}
              type={alert.type}
              closable
              onClose={() => setAlert({ show: false, message: '', type: '' })}
              className="mb-4"
            />
          )}

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              label="Tên đăng nhập"
              name="username" // <— đổi từ "email" sang "username"
              rules={[
                { required: true, message: 'Tên đăng nhập là bắt buộc' },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Nhập tên đăng nhập"
                disabled={loading}
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: 'Mật khẩu là bắt buộc' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập mật khẩu của bạn"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                disabled={loading}
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox disabled={loading}>Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 h-12 text-lg font-semibold"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center space-y-3">
            <div>
              <a href="#forgot-password" className="text-blue-600 hover:text-blue-800 text-sm">
                Quên mật khẩu?
              </a>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Chưa có tài khoản? </span>
              <a href="#register" className="text-blue-600 hover:text-blue-800 font-medium">
                Đăng ký ngay
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;