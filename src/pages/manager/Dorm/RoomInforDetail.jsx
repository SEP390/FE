import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Row, Col, Spin, Divider, Tag } from 'antd'; // Thêm Tag
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// === HÀM HỖ TRỢ ===
const translateGender = (gender) => {
    if (gender === 'MALE') return 'Nam';
    if (gender === 'FEMALE') return 'Nữ';
    return 'Khác';
};

// --- COMPONENT CHÍNH ---
export function RoomInforDetail() {
    const { roomId } = useParams();
    const activeKey = 'manager-rooms';
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
                // API 1: Lấy thông tin phòng
                const roomResponsePromise = axiosClient.get(`/rooms/${roomId}`);
                // API 2: Lấy danh sách sinh viên đang ở. API BE là /api/rooms/{id}/users.
                // Nếu baseURL của axiosClient đã là /api, thì gọi như sau:
                const usersResponsePromise = axiosClient.get(`/rooms/${roomId}/users`);

                const [roomResponse, usersResponse] = await Promise.all([roomResponsePromise, usersResponsePromise]);

                // Set Room Info
                if (roomResponse && roomResponse.data) {
                    setRoomDetails(roomResponse.data);
                } else {
                    throw new Error("Không tìm thấy thông tin phòng.");
                }

                // Set Occupants
                if (usersResponse && usersResponse.data && Array.isArray(usersResponse.data)) {
                    const validUsers = usersResponse.data.filter(u => u && u.id);
                    setOccupants(validUsers);
                } else {
                    setOccupants([]);
                }

            } catch (err) {
                console.error("Lỗi tải dữ liệu:", err);
                // Xử lý lỗi 401/404 rõ ràng hơn
                if (err.response?.status === 401) {
                    setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn. Vui lòng đăng nhập lại.");
                } else if (err.response?.status === 404) {
                    setError("Không tìm thấy phòng hoặc dữ liệu liên quan (Lỗi 404).");
                } else {
                    setError(err.response?.data?.message || "Đã có lỗi xảy ra khi tải dữ liệu.");
                }
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

    // --- RENDER LOADING ---
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

    // --- RENDER ERROR ---
    if (error) {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <SideBarManager collapsed={collapsed} active={activeKey} />
                <Layout>
                    <Header style={{ background: '#fff', padding: '0 24px', height: 80 }}>
                        <Link to="/manager/rooms"><ArrowLeftOutlined /> Quay lại</Link>
                    </Header>
                    <Content style={{ padding: 24 }}>
                        <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
                    </Content>
                </Layout>
            </Layout>
        );
    }

    // --- RENDER MAIN CONTENT ---
    return (
        <RequireRole role = "MANAGER">
            <Layout style={{ minHeight: '100vh' }}>
                <SideBarManager collapsed={collapsed} active={activeKey} />

                <Layout>
                    <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                        <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                            <Link to="/manager/rooms" style={{ marginRight: 15, color: 'rgba(0, 0, 0, 0.65)' }}>
                                <ArrowLeftOutlined />
                            </Link>
                            Thông tin chi tiết Phòng {roomDetails?.roomNumber || '...'}
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
                                        {/* HIỂN THỊ TÊN SLOT (VỊ TRÍ GIƯỜNG) */}
                                        <p>Vị trí giường:
                                            <Tag color="green" style={{marginLeft: 5, fontSize: 13, fontWeight: 'bold'}}>
                                                {/* Truy cập qua student?.slot?.slotName */}
                                                {student?.slot?.slotName || 'N/A'}
                                            </Tag>
                                        </p>
                                        <Divider style={{margin: '10px 0'}} />

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
        </RequireRole>
    );
}