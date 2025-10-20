import React, { useState } from 'react';
import { Layout, Typography, Row, Col, Table, Input, Select, Button, Tag, Space, Dropdown, Menu } from 'antd';
import {
    SearchOutlined,
    UserAddOutlined,
    MoreOutlined,
    EditOutlined,
    UnlockOutlined,
    LockOutlined,
    ClearOutlined
} from "@ant-design/icons";

// Import SideBarManager từ file bạn đã có
import { SideBarManager } from '../../components/layout/SideBarManger';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// --- DỮ LIỆU MOCK (Giả lập) ---
const mockStaffData = [
    { key: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@fpt.edu.vn', phone: '090xxxxxx1', area: 'Dorm A', position: 'Bảo vệ', status: 'Active' },
    { key: '2', name: 'Trần Thị B', email: 'tranb@fpt.edu.vn', phone: '091xxxxxx2', area: 'Dorm C', position: 'Kế toán', status: 'Active' },
    { key: '3', name: 'Lê Văn C', email: 'levanc@fpt.edu.vn', phone: '092xxxxxx3', area: 'VP Tổng', position: 'Quản lý', status: 'Active' },
    { key: '4', name: 'Phạm Văn D', email: 'phamd@fpt.edu.vn', phone: '093xxxxxx4', area: 'Dorm B', position: 'Bảo vệ', status: 'Locked' },
    { key: '5', name: 'Hoàng Thị E', email: 'hoange@fpt.edu.vn', phone: '094xxxxxx5', area: 'VP Tổng', position: 'Lễ tân', status: 'Active' },
];

// --- CÁC HÀNH ĐỘNG TRONG DROPDOWN ---
const getActionMenu = (record) => (
    <Menu>
        <Menu.Item key="editInfo" icon={<EditOutlined />}>
            Chỉnh sửa thông tin nhân viên
        </Menu.Item>
        <Menu.Item key="editArea" icon={<EditOutlined />}>
            Chỉnh sửa khu vực làm việc
        </Menu.Item>
        <Menu.Item key="editPosition" icon={<EditOutlined />}>
            Chỉnh sửa chức vụ
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="resetPass" icon={<UnlockOutlined />}>
            Reset mật khẩu
        </Menu.Item>
        <Menu.Item
            key="toggleLock"
            icon={record.status === 'Active' ? <LockOutlined /> : <UnlockOutlined />}
            danger={record.status === 'Active'}
        >
            {record.status === 'Active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        </Menu.Item>
    </Menu>
);

// Định nghĩa các cột cho bảng
const columns = [
    {
        title: 'Họ và tên',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
        render: (text, record) => (
            <Space direction="vertical" size={0}>
                <Text strong>{text}</Text>
                <Tag color={record.status === 'Active' ? 'success' : 'red'} style={{ margin: 0 }}>
                    {record.status}
                </Tag>
            </Space>
        )
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
    },
    {
        title: 'Khu vực',
        dataIndex: 'area',
        key: 'area',
        filters: [
            { text: 'Dorm A', value: 'Dorm A' },
            { text: 'Dorm B', value: 'Dorm B' },
            { text: 'VP Tổng', value: 'VP Tổng' },
        ],
        onFilter: (value, record) => record.area.indexOf(value) === 0,
    },
    {
        title: 'Chức vụ',
        dataIndex: 'position',
        key: 'position',
        filters: [
            { text: 'Bảo vệ', value: 'Bảo vệ' },
            { text: 'Kế toán', value: 'Kế toán' },
            { text: 'Quản lý', value: 'Quản lý' },
        ],
        onFilter: (value, record) => record.position.indexOf(value) === 0,
        render: (position) => <Tag color="blue">{position}</Tag>
    },
    {
        title: 'Hành động',
        key: 'action',
        render: (text, record) => (
            <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
                <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
        ),
    },
];

// --- COMPONENT CHÍNH ---
export function StaffManager() {
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'manager-staff'; // Key active cho sidebar

    // State cho các bộ lọc
    const [searchText, setSearchText] = useState('');
    const [filterPosition, setFilterPosition] = useState(undefined);
    const [filterArea, setFilterArea] = useState(undefined);

    // Logic lọc dữ liệu
    const filteredData = mockStaffData.filter(staff => {
        const matchesSearch = staff.name.toLowerCase().includes(searchText.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchText.toLowerCase()) ||
            staff.phone.includes(searchText);

        const matchesPosition = filterPosition ? staff.position === filterPosition : true;
        const matchesArea = filterArea ? staff.area === filterArea : true;

        return matchesSearch && matchesPosition && matchesArea;
    });

    const handleClearFilters = () => {
        setSearchText('');
        setFilterPosition(undefined);
        setFilterArea(undefined);
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* 1. SIDEBAR */}
            <SideBarManager collapsed={collapsed} active={activeKey} />

            {/* 2. KHU VỰC NỘI DUNG */}
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                        Quản lý nhân viên
                    </Title>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

                    {/* KHU VỰC TIÊU ĐỀ VÀ THÊM NHÂN VIÊN */}
                    <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                        <Col>
                            <Title level={4} style={{ margin: 0 }}>Danh sách nhân viên</Title>
                        </Col>
                        <Col>
                            <Button type="primary" icon={<UserAddOutlined />}>
                                + Thêm nhân viên
                            </Button>
                        </Col>
                    </Row>

                    {/* KHU VỰC TÌM KIẾM VÀ LỌC */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 20, alignItems: 'center' }}>

                        {/* Thanh tìm kiếm chung */}
                        <Col flex="400px">
                            <Input
                                placeholder="Thanh tìm kiếm (Họ tên, Email, SĐT)..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Col>

                        {/* Lọc theo Khu vực */}
                        <Col>
                            <Select
                                placeholder="Lọc theo Khu vực"
                                style={{ width: 150 }}
                                value={filterArea}
                                onChange={setFilterArea}
                                allowClear
                            >
                                <Option value="Dorm A">Dorm A</Option>
                                <Option value="Dorm B">Dorm B</Option>
                                <Option value="Dorm C">Dorm C</Option>
                                <Option value="VP Tổng">VP Tổng</Option>
                            </Select>
                        </Col>

                        {/* Lọc theo Chức vụ */}
                        <Col>
                            <Select
                                placeholder="Lọc theo Chức vụ"
                                style={{ width: 150 }}
                                value={filterPosition}
                                onChange={setFilterPosition}
                                allowClear
                            >
                                <Option value="Bảo vệ">Bảo vệ</Option>
                                <Option value="Kế toán">Kế toán</Option>
                                <Option value="Quản lý">Quản lý</Option>
                                <Option value="Lễ tân">Lễ tân</Option>
                            </Select>
                        </Col>

                        {/* Nút xóa bộ lọc */}
                        <Col>
                            <Button onClick={handleClearFilters} icon={<ClearOutlined />}>
                                Xóa bộ lọc
                            </Button>
                        </Col>
                    </Row>

                    {/* BẢNG DANH SÁCH NHÂN VIÊN */}
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        pagination={{ pageSize: 10 }}
                        bordered
                    />

                </Content>
            </Layout>
        </Layout>
    );
}