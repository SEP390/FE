import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Button, Spin, Alert, Descriptions, Tag, Space, Typography, Image, Avatar
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined, HomeOutlined } from "@ant-design/icons";
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';
import { RequireRole } from "../../../components/authorize/RequireRole.jsx";
import { LayoutManager } from '../../../components/layout/LayoutManager.jsx';

const { Title, Text } = Typography;

export function ResidentDetail() {
    const { residentId } = useParams();
    const navigate = useNavigate();
    const activeKey = 'manager-residents';

    const [residentData, setResidentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!residentId) return;
            setLoading(true);
            try {
                const response = await axiosClient.get(`/users/residents/${residentId}`);
                if (response && response.data) {
                    // Dữ liệu từ BaseResponse.data
                    setResidentData(response.data.data || response.data);
                }
            } catch (err) {
                setError("Không thể tải thông tin chi tiết sinh viên.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [residentId]);

    const translateGender = (gender) => {
        if (gender === 'MALE') return 'Nam';
        if (gender === 'FEMALE') return 'Nữ';
        return 'Khác';
    };

    if (loading) return (
        <LayoutManager active={activeKey} header="Chi tiết sinh viên">
            <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" tip="Đang tải dữ liệu..." /></div>
        </LayoutManager>
    );

    if (error || !residentData) return (
        <LayoutManager active={activeKey} header="Chi tiết sinh viên">
            <div style={{ padding: 24 }}><Alert message="Lỗi" description={error || "Dữ liệu không tồn tại"} type="error" showIcon /></div>
        </LayoutManager>
    );

    return (
        <RequireRole role="MANAGER">
            <LayoutManager active={activeKey} header={"Chi tiết sinh viên"}>
                <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>

                    {/* 1. Nút quay lại */}
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        style={{ marginBottom: 20 }}
                    >
                        Quay lại danh sách
                    </Button>

                    {/* 2. KHỐI HEADER (Giữ nguyên giao diện hiển thị ảnh) */}
                    <Card bordered={false} style={{ marginBottom: 24, borderRadius: '8px' }}>
                        <Space align="center" size={24}>
                            {/* Hiển thị ảnh khớp với logic StaffDetailPage đã chạy được của bạn */}
                            {residentData.image ? (
                                <Image
                                    width={100}
                                    height={100}
                                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                                    src={residentData.image}
                                    alt="Avatar"
                                />
                            ) : (
                                <Avatar size={100} icon={<UserOutlined />} />
                            )}

                            <div>
                                <Title level={3} style={{ marginBottom: 4 }}>{residentData.fullName || 'N/A'}</Title>
                                <Text type="secondary" style={{ fontSize: '16px' }}>@{residentData.username}</Text>
                            </div>
                            <Tag color="blue" style={{ padding: '4px 12px', marginLeft: 20 }}>SINH VIÊN</Tag>
                        </Space>
                    </Card>

                    {/* 3. CÁC KHỐI NỘI DUNG */}
                    <Row gutter={[24, 24]}>
                        {/* Khối Thông tin cá nhân */}
                        <Col xs={24} md={16}>
                            <Card title="Thông tin cá nhân" bordered={false} style={{ height: '100%', borderRadius: '8px' }}>
                                <Descriptions column={1} layout="horizontal">
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
                                <Descriptions column={1} layout="horizontal">
                                    <Descriptions.Item label="Email">{residentData.email || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">{residentData.phoneNumber || 'N/A'}</Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        {/* Khối Thông tin phòng ở (Đã loại bỏ Vị trí giường/Slot) */}
                        <Col span={24}>
                            <Card
                                title={<span><HomeOutlined /> Thông tin phòng ở hiện tại</span>}
                                bordered={false}
                                style={{ borderRadius: '8px' }}
                            >
                                <Descriptions column={2} bordered size="middle">
                                    <Descriptions.Item label="Phòng">
                                        <Text strong>{residentData.roomNumber || "Thông tin phòng chưa cập nhật"}</Text>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Tầng">
                                        <Text strong>
                                            {residentData.floor !== undefined && residentData.floor !== null
                                                ? `Tầng ${residentData.floor}`
                                                : "Thông tin tầng chưa cập nhật"}
                                        </Text>
                                    </Descriptions.Item>
                                </Descriptions>

                                {/* Alert chỉ hiện nếu chưa có số phòng */}
                                {!residentData.roomNumber && (
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