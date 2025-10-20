import { useState } from 'react';
import { Layout, Menu, Typography, Card, Row, Col, List, Tag } from 'antd';
import { HomeOutlined } from "@ant-design/icons";
// Thêm Link từ react-router-dom
import { Link } from 'react-router-dom';
import { SideBarManager } from '../../components/layout/SideBarManger';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// --- DỮ LIỆU MOCK (Giả lập) ---
// Thêm thuộc tính linkTo để xác định đường dẫn
const mockStats = [
    { label: "Tổng số sinh viên", value: 200, linkTo: "/manager/students" },
    { label: "Đơn chờ duyệt", value: 200, linkTo: "/manager/requests" },
    { label: "Phòng Trống", value: 200, linkTo: "/manager/rooms" },
    { label: "Tỉ lệ lấp đầy", value: "200%", linkTo: "/manager/rooms" },
    // THÊM MỤC MỚI CHO QUẢN LÝ NHÂN VIÊN
    { label: "Tổng số nhân viên", value: 50, linkTo: "/manager/staff" },
];

const mockRecentRequests = [
// ... (giữ nguyên)
    { name: "Nguyễn văn A", type: "đơn xin chuyển phòng", status: "Chờ duyệt" },
    { name: "Nguyễn văn A", type: "đơn xin Check out", status: "Đã duyệt" },
    { name: "Nguyễn văn A", type: "đơn xin chuyển phòng", status: "Từ chối" },
];

const mockStaffFeedback = [
// ... (giữ nguyên)
    { content: "Báo cáo sai phạm của sinh viên A" },
    { content: "Báo cáo lịch xong tắc tuần mới" },
    { content: "Báo cáo sai phạm của sinh viên A" },
];

// --- COMPONENT CHÍNH ---
export function DashboardManager() {
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'manager-home';

    // Cần tính toán lại số cột cho Row Stats nếu bạn có 5 mục.
    // Nếu bạn muốn giữ lại layout 4 cột, bạn có thể chỉ hiển thị 4 mục đầu tiên hoặc điều chỉnh span.
    // Tạm thời, tôi sẽ hiển thị tất cả 5 mục và sử dụng 5 cột (span=4.8) hoặc sử dụng 2 Row.
    // Phương án đơn giản nhất: Chỉ hiển thị 4 mục quan trọng nhất trên Dashboard.

    // Tuy nhiên, để đáp ứng yêu cầu, tôi sẽ chỉ sửa mảng mockStats mà không thay đổi cấu trúc Row/Col
    // Nếu bạn muốn hiển thị mục này, bạn nên thay thế một mục ít quan trọng hơn
    // Hoặc sửa <Row> thành hai <Row> hoặc thay đổi span.

    // **Để giữ layout 4 cột, tôi sẽ thay thế 'Tỉ lệ lấp đầy' bằng 'Tổng số nhân viên'.**
    const statsToDisplay = [
        { label: "Tổng số sinh viên", value: 200, linkTo: "/manager/students" },
        { label: "Đơn chờ duyệt", value: 200, linkTo: "/manager/requests" },
        { label: "Phòng Trống", value: 200, linkTo: "/manager/rooms" },
        { label: "Tổng số nhân viên", value: 50, linkTo: "/manager/staff" }, // MỤC MỚI
    ];
    // Hoặc dùng mockStats.slice(0, 4) nếu bạn sửa mảng mockStats gốc

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
                        {statsToDisplay.map((stat, index) => ( // SỬ DỤNG statsToDisplay ĐÃ CHỈNH SỬA
                            <Col span={6} key={index}>
                                <Link to={stat.linkTo}>
                                    <Card
                                        bordered={true}
                                        hoverable
                                        style={{ textAlign: 'center', cursor: 'pointer' }}
                                    >
                                        <Text type="secondary">{stat.label}</Text>
                                        <Title level={2} style={{ margin: '8px 0 0 0' }}>{stat.value}</Title>
                                    </Card>
                                </Link>
                            </Col>
                        ))}
                    </Row>

                    {/* RECENT ACTIVITY & FEEDBACK */}
                    {/* ... (Phần Đơn gần đây và Phản hồi giữ nguyên) */}
                    <Row gutter={24}>
                        {/* ĐƠN GẦN ĐÂY - GẮN LINK VÀO TIÊU ĐỀ */}
                        <Col span={12}>
                            <Link to="/manager/requests">
                                <Title level={3} style={{ marginBottom: 20, cursor: 'pointer', color: '#1890ff' }}>
                                    Đơn gần đây
                                </Title>
                            </Link>
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

                        {/* PHẢN HỒI TỪ NHÂN VIÊN - GẮN LINK VÀO TIÊU ĐỀ */}
                        <Col span={12}>
                            <Link to="/manager/violations">
                                <Title level={3} style={{ marginBottom: 20, cursor: 'pointer', color: '#1890ff' }}>
                                    Phản hồi từ nhân viên
                                </Title>
                            </Link>
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