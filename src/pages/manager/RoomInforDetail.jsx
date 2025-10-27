import React, { useState, useEffect } from 'react';
import { Layout, Typography, List, Card, Space, Tag, Divider, Row, Col, Button, Spin, Alert } from 'antd';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { SideBarManager } from '../../components/layout/SideBarManger';
import axiosClient from '../../api/axiosClient/axiosClient';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// Component chính
export function RoomInforDetail() {
    // Lấy roomId từ URL
    const { roomId } = useParams();

    // State cho sidebar
    const activeKey = 'manager-rooms';
    const [collapsed, setCollapsed] = useState(false);

    // State cho dữ liệu và loading/error
    const [roomDetails, setRoomDetails] = useState(null);
    const [occupants, setOccupants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect để gọi API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Gọi API 1: Lấy chi tiết phòng
                const roomResponse = await axiosClient.get(`/rooms/${roomId}`);

                // Gọi API 2: Lấy danh sách sinh viên
                const usersResponse = await axiosClient.get(`/rooms/${roomId}/users`);

                if (roomResponse && roomResponse.data) {
                    setRoomDetails(roomResponse.data);
                } else {
                    throw new Error("Không tìm thấy thông tin phòng.");
                }

                if (usersResponse && usersResponse.data) {
                    setOccupants(usersResponse.data);
                }

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu chi tiết phòng:", err);
                setError(err.response?.data?.message || err.message || "Đã có lỗi xảy ra.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roomId]);

    // HIỂN THỊ LOADING HOẶC LỖI
    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <SideBarManager collapsed={collapsed} active={activeKey} />
                <Layout>
                    <Header style={{ background: '#fff', padding: '0 24px', height: 80, display: 'flex', alignItems: 'center' }}>
                        <Link to="/manager/rooms" style={{ marginRight: 15, color: 'rgba(0, 0, 0, 0.65)', fontSize: '20px' }}><ArrowLeftOutlined /></Link>
                        <Title level={2} style={{ margin: 0 }}>Đang tải...</Title>
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
                        <Link to="/manager/rooms" style={{ marginRight: 15, color: 'rgba(0, 0, 0, 0.65)', fontSize: '20px' }}><ArrowLeftOutlined /></Link>
                        <Title level={2} style={{ margin: 0 }}>Lỗi</Title>
                    </Header>
                    <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                        <Alert message="Lỗi tải dữ liệu" description={error} type="error" showIcon />
                    </Content>
                </Layout>
            </Layout>
        );
    }

    // Nếu không loading, không lỗi, và có dữ liệu
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />

            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                        <Link to="/manager/rooms" style={{ marginRight: 15, color: 'rgba(0, 0, 0, 0.65)' }}>
                            <ArrowLeftOutlined />
                        </Link>
                        Thông tin chi tiết Phòng {roomDetails?.roomNumber || roomId}
                    </Title>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

                    {/* Hiển thị thông tin phòng từ API */}
                    <Card title="Thông tin chung" style={{ marginBottom: 20 }}>
                        <Row gutter={24}>
                            <Col span={8}><Text strong>Tòa nhà:</Text> {roomDetails?.dorm?.dormName || 'N/A'}</Col>
                            <Col span={8}><Text strong>Tầng:</Text> {roomDetails?.floor || 'N/A'}</Col>
                            <Col span={8}><Text strong>Sức chứa (Tối đa):</Text> {roomDetails?.totalSlot || roomDetails?.pricing?.totalSlot || 'N/A'}</Col>
                        </Row>
                    </Card>

                    {/* Hiển thị danh sách sinh viên từ API */}
                    <Title level={4} style={{ marginTop: 30 }}>
                        <UserOutlined style={{ marginRight: 8 }} />
                        Danh sách sinh viên đang ở ({occupants.length} người)
                    </Title>
                    <Divider />

                    <Row gutter={[24, 24]}>
                        {/* !!! Sửa lại các 'student.FIELD_NAME' cho đúng với DTO 'RoomUserResponse' */}
                        {occupants.map(student => (
                            <Col xs={24} sm={12} md={8} lg={6} key={student.id}>
                                <Card
                                    title={<Text strong>{student.fullName || student.username || 'N/A'}</Text>}
                                    extra={student.isRoomLeader && <Tag color="gold">Trưởng phòng</Tag>}
                                    hoverable
                                >
                                    <p>Mã SV: <Text copyable>{student.studentCode || 'N/A'}</Text></p>
                                    <p>Ngành học: <Text>{student.majorName || 'N/A'}</Text></p>
                                    <p>Ngày vào: <Text>{student.checkInDate ? new Date(student.checkInDate).toLocaleDateString('vi-VN') : 'N/A'}</Text></p>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {occupants.length === 0 && (
                        <Text type="secondary">Phòng {roomDetails?.roomNumber || roomId} hiện chưa có sinh viên.</Text>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}