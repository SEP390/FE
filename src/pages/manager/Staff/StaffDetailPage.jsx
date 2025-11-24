import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import { Layout, Typography, Spin, Descriptions, Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
// === IMPORT THÊM SIDEBAR MANAGER ===
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';

const { Header, Content } = Layout;
const { Title } = Typography;

export function StaffDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);

    // State cho sidebar và active key (cần thiết cho Layout)
    const [collapsed, setCollapsed] = useState(false);
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

    // --- Hàm render nội dung chính (Loading, Error, Data) ---
    const renderContent = () => {
        // 1. Hiển thị loading
        if (loading) {
            return (
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', textAlign: 'center' }}>
                    <Spin tip="Đang tải..." size="large" />
                </Content>
            );
        }

        // 2. Xử lý khi API lỗi hoặc không tìm thấy data
        if (!staff) {
            return (
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
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

        // 3. Hiển thị thông tin nhân viên (Giao diện chính)
        return (
            <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                <Button
                    onClick={() => navigate('/manager/staff')}
                    icon={<ArrowLeftOutlined />}
                    style={{ marginBottom: 20 }}
                >
                    Quay lại danh sách
                </Button>

                <Title level={2} style={{ marginBottom: 30 }}>Chi tiết nhân viên: {staff.fullName || 'N/A'}</Title>

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Họ tên">{staff.fullName || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Mã NV">{staff.userCode || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Email">{staff.email || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="SĐT">{staff.phoneNumber || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Chức vụ">{staff.role || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">{staff.dob ? dayjs(staff.dob).format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Giới tính">{staff.gender || 'N/A'}</Descriptions.Item>
                </Descriptions>
            </Content>
        );
    };

    // --- CẤU TRÚC CHÍNH (Layout có Sidebar) ---
    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Thanh Sidebar được giữ lại */}
            <SideBarManager collapsed={collapsed} active={activeKey} />

            {/* Layout cho phần Nội dung và Header */}
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>Chi tiết nhân viên</Title>
                </Header>

                {/* Nội dung chính */}
                {renderContent()}
            </Layout>
        </Layout>
    );
}