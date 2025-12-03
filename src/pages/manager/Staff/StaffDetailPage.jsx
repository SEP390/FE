import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import {Layout, Typography, Spin, Descriptions, Button, Image, Row, Col, Tag, App} from 'antd';
import { ArrowLeftOutlined, UserOutlined, ContactsOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';
import { useCollapsed } from '../../../hooks/useCollapsed.js';
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";

const { Header, Content } = Layout;
const { Title } = Typography;

// --- HELPERS: CHUẨN HÓA DỮ LIỆU HIỂN THỊ ---

// 1. Chuẩn hóa vai trò (Bao gồm TECHNICAL)
const getRoleText = (role) => {
    switch (role) {
        case 'GUARD':
            return <Tag color="blue">Bảo vệ</Tag>;
        case 'CLEANER':
            return <Tag color="green">Lao công</Tag>;
        case 'TECHNICAL':
            return <Tag color="orange">Kỹ thuật</Tag>;
        case 'MANAGER':
            return <Tag color="red">Quản lý</Tag>;
        default:
            return <Tag color="default">N/A</Tag>;
    }
};

// 2. Chuẩn hóa giới tính
const getGenderText = (gender) => {
    switch (gender) {
        case 'MALE':
            return 'Nam';
        case 'FEMALE':
            return 'Nữ';
        default:
            return 'Khác';
    }
};


export function StaffDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const {message}=App.useApp();
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);

    // use global collapsed state
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);
    const activeKey = 'manager-staff';

    useEffect(() => {
        if (id) {
            setLoading(true);

            axiosClient.get(`/employees/${id}`)
                .then(response => {
                    if (response && response.data) {
                        setStaff(response.data);
                    } else {
                        setStaff(null);
                        message.error("Đã nhận được phản hồi nhưng cấu trúc dữ liệu không đúng.");
                    }
                })
                .catch(error => {
                    console.error("Lỗi khi tải chi tiết nhân viên:", error);
                    message.error("Không thể tải thông tin nhân viên!");
                    setStaff(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
            message.error("Không tìm thấy ID nhân viên trong URL.");
        }
    }, [id]);

    // --- Hàm render nội dung chính ---
    const renderContent = () => {
        if (loading) {
            return (
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', textAlign: 'center', marginTop: 80 }}>
                    <Spin tip="Đang tải..." size="large" />
                </Content>
            );
        }

        if (!staff) {
            return (
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', marginTop: 80 }}>
                    <Button
                        onClick={() => navigate('/manager/staff')}
                        icon={<ArrowLeftOutlined />}
                        style={{ marginBottom: 20 }}
                    >
                        Quay lại danh sách
                    </Button>
                    <Title level={3}>Không tìm thấy thông tin nhân viên.</Title>
                </Content>
            );
        }

        // Sử dụng trường 'imageUrl' từ Backend
        const imageUrl = staff.imageUrl;

        return (
            <RequireRole role = "MANAGER">
            <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', marginTop: 80 }}>
                <Button
                    onClick={() => navigate('/manager/staff')}
                    icon={<ArrowLeftOutlined />}
                    style={{ marginBottom: 20 }}
                >
                    Quay lại danh sách
                </Button>

                <Title level={2} style={{ marginBottom: 30 }}>Chi tiết nhân viên: {staff.fullName || 'N/A'}</Title>

                <Row gutter={32}>
                    {/* Cột 1: Hình ảnh */}
                    <Col span={6} style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: 20 }}>
                            {/* Dùng imageUrl và kiểm tra tính hợp lệ */}
                            {imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http') ? (
                                <Image
                                    width={200}
                                    height={200}
                                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                                    src={imageUrl}
                                    alt={`Ảnh của ${staff.fullName}`}
                                />
                            ) : (
                                <div style={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: '50%',
                                    backgroundColor: '#f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <UserOutlined style={{ fontSize: 80, color: '#999' }} />
                                </div>
                            )}
                        </div>
                        <Title level={4}>{staff.fullName || 'N/A'}</Title>
                        <Typography.Text type="secondary">{getRoleText(staff.role)}</Typography.Text>
                    </Col>

                    {/* Cột 2: Chi tiết mô tả */}
                    <Col span={18}>
                        <Title level={4} style={{ marginTop: 0 }}><ContactsOutlined /> Thông tin cá nhân & Liên hệ</Title>
                        <Descriptions bordered column={2} size="middle" style={{ marginBottom: 20 }}>
                            <Descriptions.Item label="Mã NV">{staff.userCode || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Chức vụ">{getRoleText(staff.role)}</Descriptions.Item>

                            <Descriptions.Item label="Email" span={2}>{staff.email || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="SĐT">{staff.phoneNumber || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Giới tính">{getGenderText(staff.gender)}</Descriptions.Item>

                            {/* Sử dụng dob từ BE */}
                            <Descriptions.Item label="Ngày sinh" span={2}>{staff.dob ? dayjs(staff.dob).format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
                        </Descriptions>

                        <Title level={4}><FileTextOutlined /> Thông tin Hợp đồng</Title>
                        <Descriptions bordered column={1} size="middle">
                            {/* Sử dụng hireDate từ BE */}
                            <Descriptions.Item label="Ngày bắt đầu HĐ">{staff.hireDate ? dayjs(staff.hireDate).format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
                            {/* Sử dụng contractEndDate từ BE */}
                            <Descriptions.Item label="Ngày kết thúc HĐ">{staff.contractEndDate ? dayjs(staff.contractEndDate).format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </Content>
            </RequireRole>
        );
    };

    // --- CẤU TRÚC CHÍNH (Layout có Sidebar) ---
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />

            <Layout
                style={{
                    marginLeft: collapsed ? 80 : 260,
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80, position: 'fixed', top: 0, right: 0, zIndex: 999, left: collapsed ? 80 : 260, transition: 'left 0.3s ease' }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>Chi tiết nhân viên</Title>
                </Header>

                {renderContent()}
            </Layout>
         </Layout>
     );
}