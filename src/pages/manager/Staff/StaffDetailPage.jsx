import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import { Layout, Typography, Spin, Descriptions, Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title } = Typography;

export function StaffDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            setLoading(true);

            axiosClient.get(`/employees/${id}`)
                .then(response => {
                    // --- ĐÂY LÀ PHẦN ĐÃ SỬA ---
                    // 'response' đã là BaseResponse {status, message, data}
                    // vì vậy chúng ta chỉ cần kiểm tra response.data
                    if (response && response.data) {
                        setStaff(response.data); // Gán object data (chứa fullName)
                    } else {
                        setStaff(null);
                        message.error("Đã nhận được phản hồi nhưng cấu trúc dữ liệu không đúng.");
                    }
                    // --- KẾT THÚC SỬA ---
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

    // Hiển thị loading
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' }}>
                <Spin tip="Đang tải..." size="large" />
            </div>
        );
    }

    // Xử lý khi API lỗi hoặc không tìm thấy data
    if (!staff) {
        return (
            <Layout>
                <Content style={{ padding: '24px 50px' }}>
                    <Button
                        onClick={() => navigate('/manager/staff')}
                        icon={<ArrowLeftOutlined />}
                        style={{ marginBottom: 20 }}
                    >
                        Quay lại danh sách
                    </Button>
                    <Title level={3}>Không tìm thấy thông tin nhân viên.</Title>
                </Content>
            </Layout>
        );
    }

    // Hiển thị thông tin nhân viên
    return (
        <Layout>
            <Content style={{ padding: '24px 50px' }}>
                <Button
                    onClick={() => navigate('/manager/staff')}
                    icon={<ArrowLeftOutlined />}
                    style={{ marginBottom: 20 }}
                >
                    Quay lại danh sách
                </Button>

                <Title level={2}>Chi tiết nhân viên: {staff.fullName || 'N/A'}</Title>

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
        </Layout>
    );
}