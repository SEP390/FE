import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Row, Col, Spin, Divider, message } from 'antd';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
// Import SideBar đã sửa thành GuardSidebar
import { GuardSidebar } from '../../../components/layout/GuardSidebar.jsx';
// Import axiosClient
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// === HÀM HỖ TRỢ ===
const translateGender = (gender) => {
    if (gender === 'MALE') return 'Nam';
    if (gender === 'FEMALE') return 'Nữ';
    return 'Khác';
};

// --- COMPONENT CHÍNH ---
export function RoomInforDetailGuard() {
    const { roomId } = useParams();
    const activeKey = 'guard-rooms';
    const [collapsed, setCollapsed] = useState(false);

    // State dữ liệu
    const [roomDetails, setRoomDetails] = useState(null);
    const [occupants, setOccupants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect gọi API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Tải song song thông tin phòng và danh sách người ở
                const roomResponsePromise = axiosClient.get(`/rooms/${roomId}`);
                const usersResponsePromise = axiosClient.get(`/rooms/${roomId}/users`);

                const [roomResponse, usersResponse] = await Promise.all([roomResponsePromise, usersResponsePromise]);

                // Set Room Info
                if (roomResponse && roomResponse.data) {
                    setRoomDetails(roomResponse.data);
                } else {
                    throw new Error("Không tìm thấy thông tin phòng.");
                }

                // Set Occupants: Lọc user có id hợp lệ
                if (usersResponse && usersResponse.data && Array.isArray(usersResponse.data)) {
                    const validUsers = usersResponse.data.filter(u => u && u.id);
                    setOccupants(validUsers);
                } else {
                    setOccupants([]);
                }

            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
                setError(err.response?.data?.message || "Đã có lỗi xảy ra khi tải dữ liệu.");
                message.error("Lỗi tải thông tin chi tiết phòng!");
            } finally {
                setLoading(false);
            }
        };

        if (roomId) fetchData();
        else {
            setError("ID phòng không hợp lệ.");
            setLoading(false);
        }
    }, [roomId]);

    // --- RENDER LOADING / ERROR ---
    if (loading || error) {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <GuardSidebar collapsed={collapsed} active={activeKey} />
                <Layout>
                    <Header style={{ background: '#fff', padding: '0 24px', height: 80, display: 'flex', alignItems: 'center' }}>
                        {/* ĐÃ SỬA: Quay lại /guard/rooms */}
                        <Link to="/guard/rooms" style={{ marginRight: 15, color: 'rgba(0, 0, 0, 0.65)', fontSize: '20px' }}><ArrowLeftOutlined /></Link>
                        <Title level={2} style={{ margin: 0 }}>{loading ? "Đang tải..." : "Lỗi"}</Title>
                    </Header>
                    <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', textAlign: 'center' }}>
                        {loading ? <Spin size="large" /> : <div style={{ color: 'red' }}>{error}</div>}
                    </Content>
                </Layout>
            </Layout>
        );
    }

    // --- RENDER MAIN CONTENT ---
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <GuardSidebar collapsed={collapsed} active={activeKey} />

            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                        {/* ĐÃ SỬA: Quay lại /guard/rooms */}
                        <Link to="/guard/rooms" style={{ marginRight: 15, color: 'rgba(0, 0, 0, 0.65)' }}>
                            <ArrowLeftOutlined />
                        </Link>
                        Thông tin chi tiết Phòng {roomDetails?.roomNumber || '...'} (Bảo vệ)
                    </Title>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

                    {/* 1. THÔNG TIN PHÒNG */}
                    <Card title="Thông tin chung" style={{ marginBottom: 20 }}>
                        <Row gutter={24}>
                            <Col xs={24} sm={8}><Text strong>Tòa nhà:</Text> {roomDetails?.dorm?.dormName || 'N/A'}</Col>
                            <Col xs={24} sm={8}><Text strong>Tầng:</Text> {roomDetails?.floor || 'N/A'}</Col>
                            <Col xs={24} sm={8}><Text strong>Sức chứa (Tối đa):</Text> {roomDetails?.totalSlot || roomDetails?.pricing?.totalSlot || 'N/A'}</Col>
                        </Row>
                    </Card>

                    {/* 2. DANH SÁCH SINH VIÊN */}
                    <Title level={4} style={{ marginTop: 30 }}>
                        <UserOutlined style={{ marginRight: 8 }} />
                        Danh sách sinh viên đang ở ({occupants.length} người)
                    </Title>
                    <Divider />

                    <Row gutter={[24, 24]}>
                        {occupants.map((student, index) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={student?.id || index}>
                                <Card
                                    title={<Text strong>{student?.fullName || student?.username || 'N/A'}</Text>}
                                    hoverable
                                >
                                    <p>Mã SV: <Text copyable>{student?.userCode || 'N/A'}</Text></p>
                                    <p>Email: <Text>{student?.email || 'N/A'}</Text></p>
                                    <p>SĐT: <Text>{student?.phoneNumber || 'N/A'}</Text></p>
                                    <p>Giới tính: <Text>{translateGender(student?.gender)}</Text></p>
                                    <p>Ngày sinh: <Text>{student?.dob ? dayjs(student.dob).format('DD/MM/YYYY') : 'N/A'}</Text></p>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Thông báo nếu phòng trống */}
                    {occupants.length === 0 && (
                        <div style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
                            Phòng này hiện chưa có sinh viên nào.
                        </div>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}