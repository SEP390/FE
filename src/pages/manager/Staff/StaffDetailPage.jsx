import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import { Typography, Spin, Descriptions, Button, Image, Row, Col, Tag, App, Card } from 'antd';
import { ArrowLeftOutlined, UserOutlined, ContactsOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { LayoutManager } from '../../../components/layout/LayoutManager.jsx';
import { RequireRole } from "../../../components/authorize/RequireRole.jsx";

const { Title, Text } = Typography;

export function StaffDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const activeKey = 'manager-staff';

    useEffect(() => {
        if (id) {
            setLoading(true);
            axiosClient.get(`/employees/${id}`)
                .then(response => {
                    if (response && response.data) {
                        // Lấy dữ liệu từ BaseResponse.data theo đúng controller BE
                        setStaff(response.data.data || response.data);
                    } else {
                        message.error("Cấu trúc dữ liệu phản hồi không hợp lệ.");
                    }
                })
                .catch(error => {
                    message.error("Không thể tải thông tin chi tiết nhân viên!");
                })
                .finally(() => setLoading(false));
        }
    }, [id, message]);

    const getRoleTag = (role) => {
        const colors = { GUARD: 'blue', CLEANER: 'green', TECHNICAL: 'orange', MANAGER: 'red' };
        const labels = { GUARD: 'Bảo vệ', CLEANER: 'Lao công', TECHNICAL: 'Kỹ thuật', MANAGER: 'Quản lý' };
        return <Tag color={colors[role] || 'default'}>{labels[role] || role}</Tag>;
    };

    const renderContent = () => {
        if (loading) return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Đang tải dữ liệu nhân viên..." />
            </div>
        );

        if (!staff) return (
            <Card>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/manager/staff')}>
                    Quay lại
                </Button>
                <Title level={3} style={{ marginTop: 20 }}>Không tìm thấy dữ liệu nhân viên này.</Title>
            </Card>
        );

        return (
            <Card bordered={false}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/manager/staff')} style={{ marginBottom: 24 }}>
                    Quay lại danh sách
                </Button>

                <Row gutter={[32, 32]}>
                    {/* Cột trái: Ảnh đại diện và Tên hiển thị lớn */}
                    <Col xs={24} md={6} style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: 20 }}>
                            {staff.imageUrl ? (
                                <Image
                                    width={200}
                                    height={200}
                                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                                    src={staff.imageUrl}
                                    alt="Ảnh nhân viên"
                                />
                            ) : (
                                <div style={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: '50%',
                                    backgroundColor: '#f0f0f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto'
                                }}>
                                    <UserOutlined style={{ fontSize: 80, color: '#999' }} />
                                </div>
                            )}
                        </div>
                        {/* Hiển thị fullName ngay dưới ảnh */}
                        <Title level={3}>{staff.fullName || 'Chưa cập nhật tên'}</Title>
                        {getRoleTag(staff.role)}
                    </Col>

                    {/* Cột phải: Chi tiết thông tin */}
                    <Col xs={24} md={18}>
                        <Title level={4}><ContactsOutlined /> Thông tin cá nhân & Liên hệ</Title>
                        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="middle" style={{ marginBottom: 30 }}>
                            {/* Hiển thị Họ và tên trong bảng Descriptions */}
                            <Descriptions.Item label="Họ và tên" span={2}>
                                <Text strong>{staff.fullName || 'Chưa cập nhật'}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Mã nhân viên">{staff.userCode || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Chức vụ">{getRoleTag(staff.role)}</Descriptions.Item>

                            <Descriptions.Item label="Email" span={2}>{staff.email || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{staff.phoneNumber || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Giới tính">
                                {staff.gender === 'MALE' ? 'Nam' : staff.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                            </Descriptions.Item>

                            <Descriptions.Item label="Ngày sinh" span={2}>
                                {staff.dob ? dayjs(staff.dob).format('DD/MM/YYYY') : 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Title level={4}><FileTextOutlined /> Thông tin Hợp đồng</Title>
                        <Descriptions bordered column={2} size="middle">
                            <Descriptions.Item label="Ngày vào làm">
                                {staff.hireDate ? dayjs(staff.hireDate).format('DD/MM/YYYY') : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Kết thúc hợp đồng">
                                {staff.contractEndDate ? dayjs(staff.contractEndDate).format('DD/MM/YYYY') : 'N/A'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </Card>
        );
    };

    return (
        <RequireRole role="MANAGER">
            <LayoutManager active={activeKey} header="Chi tiết nhân viên">
                {renderContent()}
            </LayoutManager>
        </RequireRole>
    );
}