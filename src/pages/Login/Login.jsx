import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Eye, EyeSlash, Person, Lock } from 'react-bootstrap-icons';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', variant: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setAlert({ show: false, message: '', variant: '' });

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Replace this with your actual login logic
            console.log('Login data:', formData);

            // Show success message
            setAlert({
                show: true,
                message: 'Đăng nhập thành công!',
                variant: 'success'
            });

            // Reset form
            setFormData({ email: '', password: '' });

        } catch {
            setAlert({
                show: true,
                message: 'Đăng nhập thất bại. Vui lòng thử lại.',
                variant: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <Container fluid className="h-100">
                <Row className="h-100 justify-content-center align-items-center">
                    <Col xs={12} sm={10} md={8} lg={6} xl={5}>
                        <Card className="login-card shadow">
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <h2 className="login-title">Đăng Nhập</h2>
                                    <p className="text-muted">Chào mừng bạn trở lại!</p>
                                </div>

                                {alert.show && (
                                    <Alert
                                        variant={alert.variant}
                                        dismissible
                                        onClose={() => setAlert({ show: false, message: '', variant: '' })}
                                        className="mb-3"
                                    >
                                        {alert.message}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <Person />
                                            </span>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                placeholder="Nhập email của bạn"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                isInvalid={!!errors.email}
                                                disabled={loading}
                                            />
                                        </div>
                                        {errors.email && (
                                            <Form.Control.Feedback type="invalid">
                                                {errors.email}
                                            </Form.Control.Feedback>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Mật khẩu</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <Lock />
                                            </span>
                                            <Form.Control
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                placeholder="Nhập mật khẩu của bạn"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                isInvalid={!!errors.password}
                                                disabled={loading}
                                            />
                                            <Button
                                                variant="outline-secondary"
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={loading}
                                            >
                                                {showPassword ? <EyeSlash /> : <Eye />}
                                            </Button>
                                        </div>
                                        {errors.password && (
                                            <Form.Control.Feedback type="invalid">
                                                {errors.password}
                                            </Form.Control.Feedback>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            label="Ghi nhớ đăng nhập"
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            size="lg"
                                            disabled={loading}
                                            className="login-btn"
                                        >
                                            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                                        </Button>
                                    </div>
                                </Form>

                                <div className="text-center mt-3">
                                    <a href="#forgot-password" className="text-decoration-none">
                                        Quên mật khẩu?
                                    </a>
                                </div>

                                <div className="text-center mt-3">
                                    <span className="text-muted">Chưa có tài khoản? </span>
                                    <a href="#register" className="text-decoration-none">
                                        Đăng ký ngay
                                    </a>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;
