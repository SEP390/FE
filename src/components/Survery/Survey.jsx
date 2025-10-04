import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';

function Survey() {
    const [formData, setFormData] = useState({
        sleepTime: '',
        drinkAlcohol: '',
        currentAbility: []
    });

    const handleRadioChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (name, value, checked) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked
                ? [...prev[name], value]
                : prev[name].filter(item => item !== value)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Survey Data:', formData);
        alert('Cảm ơn bạn đã tham gia khảo sát!');
    };

    // Inline styles
    const containerStyle = {
        padding: '40px 20px',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    const cardStyle = {
        maxWidth: '600px',
        width: '100%',
        border: '2px solid #6c757d',
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    };

    const headerStyle = {
        backgroundColor: '#ffffff',
        borderBottom: '2px solid #6c757d',
        padding: '20px'
    };

    const titleStyle = {
        fontFamily: 'Poppins, sans-serif',
        fontWeight: '600',
        color: '#333',
        margin: '0',
        fontSize: '1.5rem'
    };

    const bodyStyle = {
        padding: '30px'
    };

    const questionGroupStyle = {
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
    };

    const questionLabelStyle = {
        fontFamily: 'Poppins, sans-serif',
        fontWeight: '500',
        color: '#333',
        fontSize: '16px',
        marginBottom: '15px',
        display: 'block'
    };

    const submitBtnStyle = {
        backgroundColor: '#6c757d',
        border: '2px solid #6c757d',
        borderRadius: '8px',
        padding: '12px 30px',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: '600',
        fontSize: '16px',
        color: '#ffffff',
        minWidth: '120px'
    };

    return (
        <Container style={containerStyle}>
            <Card style={cardStyle}>
                <Card.Header className="text-center" style={headerStyle}>
                    <h3 style={titleStyle}>Survey</h3>
                </Card.Header>
                <Card.Body style={bodyStyle}>
                    <Form onSubmit={handleSubmit}>
                        {/* Câu hỏi 1: Thời gian ngủ */}
                        <div style={questionGroupStyle}>
                            <Form.Label style={questionLabelStyle}>
                                Bạn thường đi ngủ lúc mấy giờ?
                            </Form.Label>
                            <Row>
                                <Col md={4}>
                                    <Form.Check
                                        type="radio"
                                        name="sleepTime"
                                        id="before10"
                                        label="Trước 22h"
                                        checked={formData.sleepTime === 'before10'}
                                        onChange={() => handleRadioChange('sleepTime', 'before10')}
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Check
                                        type="radio"
                                        name="sleepTime"
                                        id="around10"
                                        label="22h-00"
                                        checked={formData.sleepTime === 'around10'}
                                        onChange={() => handleRadioChange('sleepTime', 'around10')}
                                    />
                                </Col>
                                <Col md={4}>
                                    <Form.Check
                                        type="radio"
                                        name="sleepTime"
                                        id="after00"
                                        label="Sau 0h"
                                        checked={formData.sleepTime === 'after00'}
                                        onChange={() => handleRadioChange('sleepTime', 'after00')}
                                    />
                                </Col>
                            </Row>
                        </div>

                        {/* Câu hỏi 2: Uống rượu/bia */}
                        <div style={questionGroupStyle}>
                            <Form.Label style={questionLabelStyle}>
                                Bạn có uống rượu/bia không?
                            </Form.Label>
                            <Row>
                                <Col md={6}>
                                    <Form.Check
                                        type="radio"
                                        name="drinkAlcohol"
                                        id="yes"
                                        label="Có"
                                        checked={formData.drinkAlcohol === 'yes'}
                                        onChange={() => handleRadioChange('drinkAlcohol', 'yes')}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Check
                                        type="radio"
                                        name="drinkAlcohol"
                                        id="no"
                                        label="Không"
                                        checked={formData.drinkAlcohol === 'no'}
                                        onChange={() => handleRadioChange('drinkAlcohol', 'no')}
                                    />
                                </Col>
                            </Row>
                        </div>

                        {/* Câu hỏi 3: Khả năng hiện tại */}
                        <div style={questionGroupStyle}>
                            <Form.Label style={questionLabelStyle}>
                                Khả năng đi lại của bạn hiện tại thế nào?
                            </Form.Label>
                            <Row>
                                <Col md={6}>
                                    <Form.Check
                                        type="checkbox"
                                        name="currentAbility"
                                        id="normal"
                                        label="Hoạt động bình thường"
                                        checked={formData.currentAbility.includes('normal')}
                                        onChange={(e) => handleCheckboxChange('currentAbility', 'normal', e.target.checked)}
                                    />
                                </Col>
                                <Col md={6}>
                                    <Form.Check
                                        type="checkbox"
                                        name="currentAbility"
                                        id="difficulty"
                                        label="Gặp khó khăn khi đi lại"
                                        checked={formData.currentAbility.includes('difficulty')}
                                        onChange={(e) => handleCheckboxChange('currentAbility', 'difficulty', e.target.checked)}
                                    />
                                </Col>
                            </Row>
                        </div>

                        {/* Submit Button */}
                        <div className="text-center mt-4">
                            <Button
                                type="submit"
                                variant="secondary"
                                size="lg"
                                style={submitBtnStyle}
                            >
                                Submit
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Survey;