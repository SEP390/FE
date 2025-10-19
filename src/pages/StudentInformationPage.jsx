import React from "react";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import { Card, Typography, Row, Col, Divider } from "antd";

const { Title, Text } = Typography;

export function StudentInformationPage() {
    // Thông tin sinh viên (fix cứng)
    const student = {
        name: "Nguyễn Tùng Lâm",
        dob: "2004-08-12",
        gender: "Male",
        phone: "(038) 7032 0 96",
        mail: "lamnthe180046@fpt.edu.vn",
        bed: "N/A",
        balance: "0 VND",
    };

    return (
        <AppLayout>
            <div className="p-6">
                <Title level={3}>Student Information</Title>

                <Row gutter={[16, 16]}>
                    {/* Cột trái: Thông tin cơ bản */}
                    <Col xs={24} md={12}>
                        <Card
                            bordered
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                        >
                            <Title level={4} style={{ color: "#004aad", marginBottom: 16 }}>
                                {student.name}
                            </Title>
                            <Text>
                                {student.dob} - {student.gender}
                            </Text>
                            <br />
                            <Text strong>Phone: </Text>
                            <Text>{student.phone}</Text>
                            <br />
                            <Text strong>Mail: </Text>
                            <a href={`mailto:${student.mail}`}>{student.mail}</a>
                            <br />
                            <Text strong>Bed: </Text>
                            <Text>{student.bed}</Text>
                            <br />
                            <Text strong>Balance: </Text>
                            <Text>{student.balance}</Text>
                        </Card>
                    </Col>

                    {/* Cột phải: More information */}
                    <Col xs={24} md={12}>
                        <Card
                            bordered
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                        >
                            <Title level={4}>More Information</Title>
                            <Divider />
                            <Text type="secondary">
                                (Hiển thị các thông tin bổ sung như: địa chỉ, CMND, ngày nhập
                                KTX, thời hạn phòng, v.v...)
                            </Text>
                        </Card>
                    </Col>
                </Row>
            </div>
        </AppLayout>
    );
}
