import React, { useState, useEffect } from 'react';
// === SỬA LỖI: Thêm Avatar, Row, Col, Space ===
import {
    Layout, Typography, Card, Divider, Row, Col, Button, Spin, Alert, Descriptions, Tag, Space, Avatar
} from 'antd';
// === KẾT THÚC SỬA ===
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// (Các hàm hỗ trợ translateGender và translateRole giữ nguyên)
const translateGender = (gender) => {
    if (gender === 'MALE') return 'Nam';
    if (gender === 'FEMALE') return 'Nữ';
    return 'Khác';
};
const translateRole = (role) => {
    if (role === 'RESIDENT') return 'Sinh viên';
    if (role === 'GUARD') return 'Bảo vệ';
    if (role === 'CLEANER') return 'Lao công';
    if (role === 'MANAGER') return 'Quản lý';
    if (role === 'ADMIN') return 'Quản trị viên';
    return role;
}


// --- COMPONENT CHÍNH ---
export function ResidentDetail() {
    const { residentId } = useParams();
    const activeKey = 'manager-residents';
    const [collapsed, setCollapsed] = useState(false);
    const [residentData, setResidentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect để gọi API (Giữ nguyên logic)
    useEffect(() => {
        const fetchData = async () => {
            if (!residentId) {
                setError("Không tìm thấy ID của người ở.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // API đã sửa đúng đường dẫn
                const response = await axiosClient.get(`/users/residents/${residentId}`);
                if (response && response.data) {
                    setResidentData(response.data);
                } else {
                    throw new Error("Không tìm thấy thông tin người ở.");
                }
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu chi tiết:", err);
                if (err.response?.status === 401) {
                    setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
                } else if (err.response?.status === 404) {
                    setError("Không tìm thấy người ở này (Lỗi 404).");
                } else {
                    setError(err.response?.data?.message || err.message || "Đã có lỗi xảy ra.");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [residentId]);

    // --- HIỂN THỊ LOADING HOẶC LỖI (Giữ nguyên) ---
    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <SideBarManager collapsed={collapsed} active={activeKey} />
                <Layout>
                    <Header style={{ background: '#fff', padding: '0 24px', height: 80, display: 'flex', alignItems: 'center' }}>
                        <Link to="/manager/residents" style={{ marginRight: 15, color: 'rgba(0, 0, 0, 0.65)', fontSize: '20px' }}><ArrowLeftOutlined /></Link>
                        <Title level={2} style={{ margin: 0 }}>Đang tải chi tiết...</Title>
                    </Header>
                    <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', textAlign: 'center' }}>
                        <Spin size="large" />
                    </Content>
                </Layout>
            </Layout>
        );
    }
    if (error) {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <SideBarManager collapsed={collapsed} active={activeKey} />
                <Layout>
                    <Header style={{ background: '#fff', padding: '0 24px', height: 80, display: 'flex', alignItems: 'center' }}>
                        <Link to="/manager/residents" style={{ marginRight: 15, color: 'rgba(0, 0, 0, 0.65)', fontSize: '20px' }}><ArrowLeftOutlined /></Link>
                        <Title level={2} style={{ margin: 0 }}>Lỗi</Title>
                    </Header>
                    <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                        <Alert message="Lỗi tải dữ liệu" description={error} type="error" showIcon />
                        <Button onClick={() => window.location.reload()} style={{ marginTop: 16 }}>Thử lại</Button>
                    </Content>
                </Layout>
            </Layout>
        );
    }

    // --- === GIAO DIỆN MỚI === ---
    return (
        <RequireRole role = "MANAGER">
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />

            <Layout>
                {/* Header giữ nguyên */}
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                        <Link to="/manager/residents" style={{ marginRight: 15, color: 'rgba(0, 0, 0, 0.65)' }}>
                            <ArrowLeftOutlined />
                        </Link>
                        Chi tiết sinh viên
                    </Title>
                </Header>

                {/* Content giữ nguyên */}
                <Content style={{ margin: '24px 16px', padding: 24, background: '#f0f2f5' }}>

                    {/* === 1. THẺ PROFILE HEADER === */}
                    <Card bordered={false} style={{ marginBottom: 24 }}>
                        <Space align="center" size={24}>
                            <Avatar size={80} icon={<UserOutlined />} />
                            <div>
                                <Title level={3} style={{ marginBottom: 4 }}>
                                    {residentData.fullName || 'N/A'}
                                </Title>
                                <Text type="secondary" style={{ fontSize: '16px' }}>
                                    @{residentData.username || 'N/A'}
                                </Text>
                            </div>
                            <Tag color="blue" style={{ fontSize: '14px', padding: '5px 10px', marginLeft: 32 }}>
                                {translateRole(residentData.role)}
                            </Tag>
                        </Space>
                    </Card>

                    {/* === 2. BỐ CỤC 2 CỘT === */}
                    <Row gutter={[24, 24]}>

                        {/* CỘT BÊN TRÁI: Thông tin cá nhân */}
                        <Col xs={24} md={16}>
                            <Card title="Thông tin cá nhân" bordered={false}>
                                {/* Bỏ 'bordered', dùng layout 'horizontal' để 2 cột */}
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

                        {/* CỘT BÊN PHẢI: Thông tin liên lạc (ĐÃ XÓA "Thông tin cư trú" bên dưới) */}
                        <Col xs={24} md={8}>
                            <Card title="Thông tin liên lạc" bordered={false}>
                                <Descriptions column={1} layout="horizontal">
                                    <Descriptions.Item label="Email">{residentData.email || 'N/A'}</Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">{residentData.phoneNumber || 'N/A'}</Descriptions.Item>
                                </Descriptions>
                            </Card>

                            {/*
                            // ĐÃ XÓA PHẦN NÀY:
                            <Card title="Thông tin cư trú" bordered={false} style={{ marginTop: 24 }}>
                                <Text type='secondary'>Chưa có thông tin phòng.</Text>
                            </Card>
                            */}
                        </Col>
                    </Row>

                </Content>
            </Layout>
        </Layout>
</RequireRole>
    );
}