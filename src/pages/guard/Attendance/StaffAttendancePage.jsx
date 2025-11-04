import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Button, Space, message, Descriptions, Tag, Spin, Empty, Alert } from 'antd';
import { ClockCircleOutlined, LoginOutlined, LogoutOutlined, CheckCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { GuardSidebar } from '../../../components/layout/GuardSidebar'; // Điểu chỉnh đường dẫn import
import axiosClient from '../../../api/axiosClient/axiosClient'; // Đảm bảo đường dẫn này đúng
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export function StaffAttendancePage() {
    const [collapsed] = useState(false);
    // Key này phải khớp với key trong GuardSidebar.jsx
    const activeKey = 'guard-schedule';

    const [assignment, setAssignment] = useState(null); // Ca làm việc của hôm nay
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentTime, setCurrentTime] = useState(dayjs());

    // Cập nhật đồng hồ mỗi giây
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // API: Lấy ca làm việc được phân công của TÔI cho HÔM NAY
    const fetchTodaysAssignment = async () => {
        setLoading(true);
        try {
            // API backend (cần tạo): /assignments/me/today
            const response = await axiosClient.get('/assignments/me/today');
            setAssignment(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                // 404 nghĩa là không có ca
                setAssignment(null);
            } else {
                message.error("Không thể tải ca làm việc. " + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    // Tải ca làm việc khi trang được mở
    useEffect(() => {
        fetchTodaysAssignment();
    }, []);

    // API: Xử lý Check-in
    const handleCheckIn = async () => {
        setSubmitting(true);
        try {
            // API backend (cần tạo): /attendance/{id}/check-in
            const response = await axiosClient.post(`/attendance/${assignment.id}/check-in`);
            setAssignment(response.data); // Cập nhật state với data mới từ backend
            message.success('Check-in thành công!');
        } catch (error) {
            message.error("Check-in thất bại. " + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    // API: Xử lý Check-out
    const handleCheckOut = async () => {
        setSubmitting(true);
        try {
            // API backend (cần tạo): /attendance/{id}/check-out
            const response = await axiosClient.post(`/attendance/${assignment.id}/check-out`);
            setAssignment(response.data); // Cập nhật state với data mới từ backend
            message.success('Check-out thành công!');
        } catch (error) {
            message.error("Check-out thất bại. " + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    // Hiển thị nút bấm (Check-in, Check-out, hoặc Đã xong)
    const renderActions = () => {
        if (!assignment) return null;

        const { status, shiftStartTime } = assignment;

        // Ví dụ: Chỉ cho phép check-in 15 phút trước giờ bắt đầu
        // Chuyển shiftStartTime (vd: "06:00:00") thành đối tượng dayjs
        const startTime = dayjs(`${dayjs().format('YYYY-MM-DD')}T${shiftStartTime}`);
        const canCheckIn = currentTime.isAfter(startTime.subtract(15, 'minute'));

        switch (status) {
            case 'PENDING': // Chờ check-in
                return (
                    <>
                        <Button
                            type="primary"
                            icon={<LoginOutlined />}
                            size="large"
                            loading={submitting}
                            onClick={handleCheckIn}
                            disabled={!canCheckIn} // Vô hiệu hóa nút nếu chưa đến giờ
                        >
                            Check-in (Bắt đầu ca)
                        </Button>
                        {!canCheckIn &&
                            <Alert
                                message={`Bạn chỉ có thể check-in 15 phút trước khi ca bắt đầu (từ ${startTime.subtract(15, 'minute').format('HH:mm')}).`}
                                type="info"
                                showIcon
                                style={{marginTop: 16}}
                            />
                        }
                    </>
                );
            case 'IN_PROGRESS': // Đang trong ca
                return (
                    <Button
                        type="danger"
                        icon={<LogoutOutlined />}
                        size="large"
                        loading={submitting}
                        onClick={handleCheckOut}
                    >
                        Check-out (Kết thúc ca)
                    </Button>
                );
            case 'COMPLETED': // Đã hoàn thành
                return (
                    <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: '16px', padding: '10px' }}>
                        Đã hoàn thành ca
                    </Tag>
                );
            default:
                return null;
        }
    };

    // Hiển thị nội dung chính (Card thông tin)
    const renderContent = () => {
        if (loading) {
            return <Spin tip="Đang tải ca làm việc..." size="large" style={{ display: 'block', marginTop: 100 }} />;
        }

        if (!assignment) {
            return <Empty description="Bạn không có ca làm việc nào được phân công hôm nay." style={{ marginTop: 100 }} />;
        }

        const roleColor = assignment.position === 'Bảo vệ' ? 'blue' : 'green';

        return (
            <Card
                title={`Ca làm việc của bạn: ${dayjs().format('DD/MM/YYYY')}`}
                style={{ maxWidth: 700, margin: '0 auto' }}
            >
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Nhân viên">
                        <Text strong>{assignment.staffName}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Chức vụ">
                        <Tag color={roleColor}>{assignment.position}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Ca làm việc">
                        <Text strong>{assignment.shiftName}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Thời gian (Dự kiến)">
                        <Tag icon={<ClockCircleOutlined />} color="default">
                            {assignment.shiftStartTime} - {assignment.shiftEndTime}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Khu vực được phân công">
                        <Tag icon={<EnvironmentOutlined />} color={roleColor}>
                            {assignment.area}
                            {/* Backend sẽ trả về "Dorm A" cho Bảo vệ */}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Thời gian Check-in">
                        {assignment.actualCheckIn ? <Text strong>{dayjs(assignment.actualCheckIn).format('HH:mm:ss')}</Text> : <Text italic>Chưa check-in</Text>}
                    </Descriptions.Item>

                    <Descriptions.Item label="Thời gian Check-out">
                        {assignment.actualCheckOut ? <Text strong>{dayjs(assignment.actualCheckOut).format('HH:mm:ss')}</Text> : <Text italic>Chưa check-out</Text>}
                    </Descriptions.Item>

                    <Descriptions.Item label="Trạng thái">
                        <Tag color={
                            assignment.status === 'PENDING' ? 'gold' :
                                assignment.status === 'IN_PROGRESS' ? 'processing' : 'success'
                        }>
                            {assignment.status === 'PENDING' ? 'Chờ Check-in' :
                                assignment.status === 'IN_PROGRESS' ? 'Đang làm việc' : 'Đã hoàn thành'}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>

                <Space direction="vertical" align="center" style={{ width: '100%', marginTop: 24 }}>
                    {renderActions()}
                </Space>
            </Card>
        );
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <GuardSidebar collapsed={collapsed} active={activeKey} />
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                        Lịch làm việc & Chấm công
                    </Title>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#f0f2f5' }}>
                    <Title level={3} style={{ textAlign: 'center' }}>
                        Thời gian hệ thống: {currentTime.format('HH:mm:ss DD/MM/YYYY')}
                    </Title>
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
}