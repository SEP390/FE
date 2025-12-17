import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Button, Spin, Alert, Descriptions, Tag, Space, Avatar, Typography
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined, HomeOutlined } from "@ant-design/icons";
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';
import { RequireRole } from "../../../components/authorize/RequireRole.jsx";
import { LayoutManager } from '../../../components/layout/LayoutManager.jsx';

const { Title, Text } = Typography;

// Hàm chuyển đổi dữ liệu từ BE sang hiển thị FE
const translateGender = (gender) => {
    if (gender === 'MALE') return 'Nam';
    if (gender === 'FEMALE') return 'Nữ';
    return 'Khác';
};

const translateRole = (role) => {
    if (role === 'RESIDENT') return 'Sinh viên';
    if (role === 'MANAGER') return 'Quản lý';
    return role;
};

export function ResidentDetail() {
    const { residentId } = useParams();
    const navigate = useNavigate();
    const activeKey = 'manager-residents';

    const [residentData, setResidentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!residentId) {
                setError("Không tìm thấy ID sinh viên.");
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                // Gọi API lấy chi tiết theo ID
                const response = await axiosClient.get(`/users/residents/${residentId}`);
                if (response && response.data) {
                    setResidentData(response.data);
                } else {
                    throw new Error("Không có dữ liệu trả về.");
                }
            } catch (err) {
                console.error("Lỗi tải chi tiết:", err);
                setError("Không thể tải thông tin sinh viên.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [residentId]);

    if (loading) return (
        <LayoutManager active={activeKey} header="Chi tiết sinh viên">
            <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
        </LayoutManager>
    );

    if (error) return (
        <LayoutManager active={activeKey} header="Chi tiết sinh viên">
            <div style={{ padding: 24 }}><Alert message="Lỗi" description={error} type="error" showIcon /></div>
        </LayoutManager>
    );

    return (
        <RequireRole role="MANAGER">
            <LayoutManager active={activeKey} header={"Chi tiết sinh viên"}>
                <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>

                    {/* Nút quay lại */}
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        style={{ marginBottom: 20 }}
                    >
                        Quay lại danh sách
                    </Button>

                    {/* Khối Header giống trong ảnh của bạn */}
                    <Card bordered={false} style={{ marginBottom: 24, borderRadius: '8px' }}>
                        <Space align="center" size={24}>
                            <Avatar size={100} icon={<UserOutlined />} src={residentData.image} />
                            <div>
                                <Title level={3} style={{ marginBottom: 4 }}>{residentData.fullName || 'N/A'}</Title>
                                <Text type="secondary" style={{ fontSize: '16px' }}>@{residentData.username || 'resident1'}</Text>
                            </div>
                            <Tag color="blue" style={{ padding: '4px 12px', marginLeft: 20 }}>
                                {translateRole(residentData.role)}
                            </Tag>
                        </Space>
                    </Card>

                    <Row gutter={[24, 24]}>
                        {/* Khối Thông tin cá nhân */}
                        <Col xs={24} md={16}>
                            <Card title="Thông tin cá nhân" bordered={false} style={{ height: '100%', borderRadius: '8px' }}>
                                <Descriptions column={1} layout="horizontal" labelStyle={{ color: '#8c8c8c' }}>
                                    <Descriptions.Item label="Họ và tên">{residentData.fullName || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Mã SV">{residentData.userCode || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Ngày sinh">
                                        {residentData.dob ? dayjs(residentData.dob).format('DD/MM/YYYY') : 'N/A'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Giới tính">{translateGender(residentData.gender)}</Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        {/* Khối Thông tin liên lạc */}
                        <Col xs={24} md={8}>
                            <Card title="Thông tin liên lạc" bordered={false} style={{ height: '100%', borderRadius: '8px' }}>
                                <Descriptions column={1} layout="horizontal" labelStyle={{ color: '#8c8c8c' }}>
                                    <Descriptions.Item label="Email">{residentData.email || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">{residentData.phoneNumber || 'N/A'}</Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        {/* KHỐI THÔNG TIN PHÒNG Ở - BỔ SUNG MỚI */}
                        <Col span={24}>
                            <Card
                                title={<span><HomeOutlined /> Thông tin phòng ở hiện tại</span>}
                                bordered={false}
                                style={{ borderRadius: '8px' }}
                                headStyle={{ borderBottom: '1px solid #f0f0f0' }}
                            >
                                <Descriptions column={3} bordered size="middle">
                                    <Descriptions.Item label="Vị trí giường (Slot)">
                                        <Tag color="volcano" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                            {residentData.slotName || "Chưa xếp chỗ"}
                                        </Tag>
                                    </Descriptions.Item>

                                    {/* Các trường roomName, buildingName nếu sau này BE bổ sung sẽ tự hiện */}
                                    <Descriptions.Item label="Phòng">
                                        <Text strong>{residentData.roomName || "Thông tin phòng chưa cập nhật"}</Text>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Tòa nhà">
                                        <Text strong>{residentData.buildingName || "Thông tin tòa chưa cập nhật"}</Text>
                                    </Descriptions.Item>
                                </Descriptions>

                                {!residentData.slotName && (
                                    <Alert
                                        message="Thông báo"
                                        description="Sinh viên này hiện chưa được xếp vào bất kỳ phòng nào trong hệ thống."
                                        type="warning"
                                        showIcon
                                        style={{ marginTop: 16 }}
                                    />
                                )}
                            </Card>
                        </Col>
                    </Row>
                </div>
            </LayoutManager>
        </RequireRole>
    );
}