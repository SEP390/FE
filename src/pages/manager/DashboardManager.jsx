import { useState } from 'react';
import { Layout, Menu, Typography, Card, Row, Col, List, Tag } from 'antd';
import { HomeOutlined } from "@ant-design/icons";
import { SideBarManager } from '../../components/layout/SideBarManger';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// --- DỮ LIỆU MOCK (Giả lập) ---
const mockStats = [
    { label: "Tổng số sinh viên", value: 200 },
    { label: "Đơn chờ duyệt", value: 200 },
    { label: "Phòng Trống", value: 200 },
    { label: "Tỉ lệ lấp đầy", value: "200%" }, // Giả định là %
];

const mockRecentRequests = [
    { name: "Nguyễn văn A", type: "đơn xin chuyển phòng", status: "Chờ duyệt" },
    { name: "Nguyễn văn A", type: "đơn xin Check out", status: "Đã duyệt" },
    { name: "Nguyễn văn A", type: "đơn xin chuyển phòng", status: "Từ chối" },
];

const mockStaffFeedback = [
    { content: "Báo cáo sai phạm của sinh viên A" },
    { content: "Báo cáo lịch xong tắc tuần mới" },
    { content: "Báo cáo sai phạm của sinh viên A" },
];

// --- COMPONENT CHÍNH ---
export function DashboardManager() {
    const [collapsed, setCollapsed] = useState(false);
    // Sử dụng 'manager-home' làm key active mặc định
    const activeKey = 'manager-home';

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* 1. SIDEBAR */}
            <SideBarManager collapsed={collapsed} active={activeKey} />

            {/* 2. KHU VỰC NỘI DUNG */}
            <Layout>
                {/* Header Title */}
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                        Quản lý ký túc xá
                    </Title>
                </Header>

                {/* Main Content */}
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

                    {/* DASH BOARD STATS */}
                    <Title level={3} style={{ marginBottom: 24, borderBottom: '1px solid #f0f0f0', paddingBottom: 10 }}>
                        Dash Board
                        <Text type="secondary" style={{ float: 'right', fontSize: '14px' }}>All Status</Text>
                    </Title>

                    <Row gutter={16} style={{ marginBottom: 40 }}>
                        {mockStats.map((stat, index) => (
                            <Col span={6} key={index}>
                                <Card bordered={true} style={{ textAlign: 'center' }}>
                                    <Text type="secondary">{stat.label}</Text>
                                    <Title level={2} style={{ margin: '8px 0 0 0' }}>{stat.value}</Title>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* RECENT ACTIVITY & FEEDBACK */}
                    <Row gutter={24}>
                        {/* ĐƠN GẦN ĐÂY */}
                        <Col span={12}>
                            <Title level={3} style={{ marginBottom: 20 }}>Đơn gần đây</Title>
                            <Card bordered={true} style={{ minHeight: 300 }}>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={mockRecentRequests}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={<Text strong>{item.name}</Text>}
                                                description={
                                                    <>
                                                        • {item.type}
                                                        <Tag
                                                            color={
                                                                item.status === 'Chờ duyệt' ? 'processing' :
                                                                    item.status === 'Đã duyệt' ? 'success' :
                                                                        'error'
                                                            }
                                                            style={{ marginLeft: 10 }}
                                                        >
                                                            {item.status}
                                                        </Tag>
                                                    </>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>

                        {/* PHẢN HỒI TỪ NHÂN VIÊN */}
                        <Col span={12}>
                            <Title level={3} style={{ marginBottom: 20 }}>Phản hồi từ nhân viên</Title>
                            <Card bordered={true} style={{ minHeight: 300 }}>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={mockStaffFeedback}
                                    renderItem={item => (
                                        <List.Item>
                                            <List.Item.Meta
                                                title={<Text>{item.content}</Text>}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                    </Row>

                </Content>
            </Layout>
        </Layout>
    );
}