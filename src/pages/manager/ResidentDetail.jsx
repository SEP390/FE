import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Divider, Row, Col, Button, Spin, Alert, Descriptions, Tag } from 'antd';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { SideBarManager } from '../../components/layout/SideBarManger'; // Đảm bảo đường dẫn đúng
import axiosClient from '../../api/axiosClient/axiosClient'; // Đảm bảo đường dẫn đúng
import dayjs from 'dayjs'; // Import dayjs

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// === HÀM HỖ TRỢ (đặt bên ngoài component) ===
// Dịch GenderEnum sang tiếng Việt
const translateGender = (gender) => {
    if (gender === 'MALE') return 'Nam';
    if (gender === 'FEMALE') return 'Nữ';
    return 'Khác';
};

// Dịch RoleEnum sang tiếng Việt
const translateRole = (role) => {
    if (role === 'RESIDENT') return 'Sinh viên';
    if (role === 'GUARD') return 'Bảo vệ';
    if (role === 'CLEANER') return 'Lao công';
    if (role === 'MANAGER') return 'Quản lý';
    if (role === 'ADMIN') return 'Quản trị viên';
    return role; // Trả về giá trị gốc nếu không khớp
}

// --- COMPONENT CHÍNH ---
// Đảm bảo export function (named export)
export function ResidentDetail() {
    // Lấy ID từ URL (phải khớp với tên tham số trong Route)
    const { residentId } = useParams();

    // State cho sidebar
    const activeKey = 'manager-residents'; // Đặt active key cho đúng trang
    const [collapsed, setCollapsed] = useState(false);

    // State cho dữ liệu và loading/error
    const [residentData, setResidentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect để gọi API
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
                // Gọi API GET /api/users/{id}
                const response = await axiosClient.get(`/users/${residentId}`);

                if (response && response.data) {
                    setResidentData(response.data); // Dữ liệu từ GetUserByIdResponse
                } else {
                    console.warn("API user details response missing data:", response);
                    throw new Error("Không tìm thấy thông tin người ở.");
                }

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu chi tiết:", err);
                if (err.response?.status === 401) {
                    setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
                } else {
                    setError(err.response?.data?.message || err.message || "Đã có lỗi xảy ra.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [residentId]); // Gọi lại khi residentId thay đổi

    // --- HIỂN THỊ LOADING HOẶC LỖI ---
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

    // --- HIỂN THỊ DỮ LIỆU ---
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />

            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                        <Link to="/manager/residents" style={{ marginRight: 15, color: 'rgba(0, 0, 0, 0.65)' }}>
                            <ArrowLeftOutlined />
                        </Link>
                        Chi tiết người ở: {residentData?.fullName || residentData?.username || '...'}
                    </Title>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

                    <Card title={<Space><UserOutlined /> Thông tin cá nhân</Space>}>
                        {/* Dùng Antd Descriptions để hiển thị thông tin chi tiết */}
                        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>

                            {/* Hiển thị các trường từ DTO GetUserByIdResponse */}
                            <Descriptions.Item label="Họ và tên">{residentData.fullName || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Username">{residentData.username || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Mã SV (User Code)">{residentData.userCode || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Email">{residentData.email || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">{residentData.phoneNumber || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Giới tính">{translateGender(residentData.gender)}</Descriptions.Item>
                            <Descriptions.Item label="Ngày sinh">
                                {residentData.dob ? dayjs(residentData.dob).format('DD/MM/YYYY') : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Vai trò">
                                <Tag color="blue">{translateRole(residentData.role)}</Tag>
                            </Descriptions.Item>

                            {/* Hiển thị ID (nếu cần gỡ lỗi) */}
                            {/* <Descriptions.Item label="UserID (debug)">{residentData.userID || 'N/A'}</Descriptions.Item> */}
                        </Descriptions>
                    </Card>

                    {/* Bạn có thể thêm Card khác ở đây để hiển thị thông tin phòng (nếu DTO có) */}
                    {/* Ví dụ:
                     <Card title="Thông tin Cư trú" style={{ marginTop: 20 }}>
                         <Descriptions bordered column={1}>
                            <Descriptions.Item label="Tòa nhà">...</Descriptions.Item>
                            <Descriptions.Item label="Số phòng">...</Descriptions.Item>
                         </Descriptions>
                    </Card>
                    */}

                </Content>
            </Layout>
        </Layout>
    );
}