import React, { useState } from 'react'; // Cần useState cho sidebar
import { Layout, Typography, List, Card, Space, Tag, Divider, Row, Col, Button } from 'antd';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { SideBarManager } from '../../components/layout/SideBarManger';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// DỮ LIỆU MOCK (Giả lập)
const mockOccupants = {
    '101': [
        { id: 1, name: 'Trần Văn B', studentId: 'SV001', major: 'IT', checkInDate: '2023-08-15', isLeader: true },
        { id: 2, name: 'Lê Thị C', studentId: 'SV002', major: 'Kinh tế', checkInDate: '2023-08-16', isLeader: false },
        { id: 3, name: 'Phạm Văn D', studentId: 'SV003', major: 'Marketing', checkInDate: '2023-08-15', isLeader: false },
    ],
    '205': [
        { id: 4, name: 'Nguyễn Văn E', studentId: 'SV004', major: 'IT', checkInDate: '2023-08-20', isLeader: true },
        { id: 5, name: 'Hoàng Thị F', studentId: 'SV005', major: 'Thiết kế', checkInDate: '2023-08-20', isLeader: false },
    ],
    // Thêm dữ liệu cho các phòng khác...
};

// Component chính với tên file mới
export function RoomInforDetail() {
    // Lấy số phòng từ URL
    const { roomNumber } = useParams();
    const occupants = mockOccupants[roomNumber] || [];

    // Giữ lại sidebar
    const activeKey = 'manager-rooms';
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />

            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                        <Link to="/manager/rooms" style={{ marginRight: 15, color: 'rgba(0, 0, 0, 0.65)' }}>
                            <ArrowLeftOutlined />
                        </Link>
                        Thông tin chi tiết Phòng {roomNumber}
                    </Title>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

                    {/* Phần Thông tin chung về phòng (Nếu có) */}
                    <Card title="Thông tin chung" style={{ marginBottom: 20 }}>
                        <Row gutter={24}>
                            <Col span={8}><Text strong>Tòa nhà:</Text> A1</Col>
                            <Col span={8}><Text strong>Tầng:</Text> 1</Col>
                            <Col span={8}><Text strong>Sức chứa (Tối đa):</Text> 4</Col>
                        </Row>
                    </Card>

                    {/* Danh sách sinh viên */}
                    <Title level={4} style={{ marginTop: 30 }}>
                        <UserOutlined style={{ marginRight: 8 }} />
                        Danh sách sinh viên đang ở ({occupants.length} người)
                    </Title>
                    <Divider />

                    <Row gutter={[24, 24]}>
                        {occupants.map(student => (
                            <Col xs={24} sm={12} md={8} lg={6} key={student.id}>
                                <Card
                                    title={<Text strong>{student.name}</Text>}
                                    extra={student.isLeader && <Tag color="gold">Trưởng phòng</Tag>}
                                    hoverable
                                >
                                    <p>Mã SV: <Text copyable>{student.studentId}</Text></p>
                                    <p>Ngành học: <Text>{student.major}</Text></p>
                                    <p>Ngày vào: <Text>{student.checkInDate}</Text></p>
                                    <Button type="link" size="small">Xem hồ sơ</Button>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {occupants.length === 0 && (
                        <Text type="secondary">Phòng {roomNumber} hiện chưa có sinh viên.</Text>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}