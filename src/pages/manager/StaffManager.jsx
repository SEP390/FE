import React, { useState, useEffect } from 'react';
import {
    Layout, Typography, Row, Col, Table, Input, Select, Button, Tag, Space,
    Dropdown, Menu, message, Spin, Modal, Form, DatePicker // Import DatePicker
} from 'antd';
import {
    SearchOutlined,
    UserAddOutlined,
    MoreOutlined,
    EditOutlined,
    UnlockOutlined, // Giữ lại iconเผื่อ dùng sau
    ClearOutlined
} from "@ant-design/icons";

// Import SideBarManager
import { SideBarManager } from '../../components/layout/SideBarManger';
// Import axiosClient
import axiosClient from '../../api/axiosClient/axiosClient';
// Import dayjs for DatePicker (nếu dùng Antd v5+)
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// --- Dropdown Actions ---
const getActionMenu = (record) => (
    <Menu>
        <Menu.Item key="editInfo" icon={<EditOutlined />}>Chỉnh sửa thông tin</Menu.Item>
        <Menu.Item key="resetPass" icon={<UnlockOutlined />}>Reset mật khẩu (Cần BE)</Menu.Item>
    </Menu>
); // Đảm bảo kết thúc đúng

// --- COMPONENT CHÍNH ---
// !!! Đảm bảo dòng export này đúng !!!
export function StaffManager() {
    // (State cũ: collapsed, activeKey, staffData, loading, filters)
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'manager-staff';
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterPosition, setFilterPosition] = useState(undefined);
    const [filterArea, setFilterArea] = useState(undefined);

    // State cho danh sách Dorms
    const [dorms, setDorms] = useState([]);

    // (State Modal Add)
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formAddStaff] = Form.useForm();

    // Hàm gọi API lấy nhân viên
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/employees');
            if (response && response.data) {
                const dataWithKey = response.data.map(staff => ({ ...staff, key: staff.employeeId }));
                setStaffData(dataWithKey);
            } else { setStaffData([]); }
        } catch (error) {
            message.error("Không thể tải danh sách nhân viên!");
            setStaffData([]);
        } finally { setLoading(false); }
    };

    // Hàm fetch Dorms
    const fetchDorms = async () => {
        try {
            const response = await axiosClient.get('/dorms');
            if (response && response.data) {
                setDorms(response.data);
            }
        } catch (error) {
            message.error("Không thể tải danh sách khu vực!");
        }
    };

    // useEffect gọi cả 2 API
    useEffect(() => {
        fetchStaff();
        fetchDorms();
    }, []);

    // Logic lọc client-side
    const filteredData = staffData.filter(staff => {
        const searchTarget = `${staff.username || ''} ${staff.email || ''} ${staff.phone || ''}`.toLowerCase();
        const matchesSearch = searchTarget.includes(searchText.toLowerCase());
        const matchesPosition = filterPosition ? staff.role === filterPosition : true;
        const matchesArea = filterArea ? staff.dormName === filterArea : true;
        return matchesSearch && matchesPosition && matchesArea;
    });

    // Xóa bộ lọc
    const handleClearFilters = () => {
        setSearchText('');
        setFilterPosition(undefined);
        setFilterArea(undefined);
    };

    // --- Handlers cho Modal Add ---
    const showAddModal = () => setIsAddModalVisible(true);
    const handleCancelAdd = () => { setIsAddModalVisible(false); formAddStaff.resetFields(); };
    const handleAddStaff = async (values) => {
        setIsSubmitting(true);
        try {
            // Định dạng lại ngày sinh nếu cần (BE mong muốn LocalDate dạng "YYYY-MM-DD")
            const formattedValues = {
                ...values,
                dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null, // Format date
                dormId: values.dormId || null // Gửi null nếu không chọn
            };

            console.log("Payload gửi đi:", formattedValues); // Kiểm tra payload

            // Gọi API POST /api/employees
            await axiosClient.post('/employees', formattedValues);
            message.success(`Đã thêm nhân viên ${values.username} thành công!`);
            handleCancelAdd(); // Đóng modal và reset form
            fetchStaff(); // Tải lại danh sách nhân viên
        } catch (error) {
            console.error("Lỗi khi thêm nhân viên:", error);
            message.error(`Thêm nhân viên thất bại! ` + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    // === Định nghĩa columns (Khớp với GetAllEmployeeResponse) ===
    const columns = [
        {
            title: 'Họ và tên', // Tạm hiển thị username
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => (a.username || '').localeCompare(b.username || ''),
            render: (text) => <Text strong>{text || 'N/A'}</Text>
        },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        {
            title: 'Khu vực', dataIndex: 'dormName', key: 'dormName',
            filters: [...new Set(staffData.map(item => item.dormName).filter(Boolean))].map(name => ({ text: name, value: name })),
            onFilter: (value, record) => (record.dormName || '').indexOf(value) === 0,
        },
        {
            title: 'Chức vụ', dataIndex: 'role', key: 'role',
            filters: [...new Set(staffData.map(item => item.role).filter(Boolean))].map(role => ({ text: role, value: role })),
            onFilter: (value, record) => (record.role || '').indexOf(value) === 0,
            render: (role) => <Tag color="blue">{role || 'N/A'}</Tag>
        },
        {
            title: 'Hành động', key: 'action',
            render: (text, record) => ( <Dropdown overlay={getActionMenu(record)} trigger={['click']}><Button type="text" icon={<MoreOutlined />} /></Dropdown> ),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>Quản lý nhân viên</Title>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                    {/* Tiêu đề và nút Thêm */}
                    <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                        <Col><Title level={4} style={{ margin: 0 }}>Danh sách nhân viên</Title></Col>
                        <Col><Button type="primary" icon={<UserAddOutlined />} onClick={showAddModal}>+ Thêm nhân viên</Button></Col>
                    </Row>

                    {/* Tìm kiếm và Lọc */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 20, alignItems: 'center' }}>
                        <Col flex="400px"><Input placeholder="Tìm kiếm (Username, Email, SĐT)..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} /></Col>
                        <Col>
                            {/* Select Khu vực */}
                            <Select placeholder="Lọc theo Khu vực" style={{ width: 150 }} value={filterArea} onChange={setFilterArea} allowClear loading={dorms.length === 0}>
                                {dorms.map(dorm => (
                                    <Option key={dorm.id} value={dorm.dormName}>{dorm.dormName}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col>
                            <Select placeholder="Lọc theo Chức vụ" style={{ width: 150 }} value={filterPosition} onChange={setFilterPosition} allowClear>
                                {[...new Set(staffData.map(item => item.role).filter(Boolean))].map(role => (<Option key={role} value={role}>{role}</Option>))}
                            </Select>
                        </Col>
                        <Col><Button onClick={handleClearFilters} icon={<ClearOutlined />}>Xóa bộ lọc</Button></Col>
                    </Row>

                    {/* BẢNG */}
                    <Table columns={columns} dataSource={filteredData} loading={loading} pagination={{ pageSize: 10 }} bordered />

                </Content>
            </Layout>

            {/* === Modal Thêm Nhân Viên (ĐÃ CẬP NHẬT FORM) === */}
            <Modal
                title="Thêm nhân viên mới"
                open={isAddModalVisible} // Dùng open
                onCancel={handleCancelAdd}
                footer={null}
                destroyOnClose // Dùng destroyOnClose
            >
                <Form
                    form={formAddStaff}
                    layout="vertical"
                    onFinish={handleAddStaff}
                    name="add_staff_form"
                >
                    {/* --- CÁC TRƯỜNG FORM KHỚP VỚI CreateEmployeeRequest --- */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Vui lòng nhập username!' }]}>
                                <Input placeholder="Username đăng nhập" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                                <Input.Password placeholder="Mật khẩu ban đầu" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="fullName" label="Họ và tên đầy đủ" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                        <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
                                <Input placeholder="example@fpt.edu.vn" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            {/* Sửa name thành phoneNumber cho khớp DTO */}
                            <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
                                <Input placeholder="09xxxxxxxx" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}>
                                <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" format="DD/MM/YYYY"/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}>
                                <Select placeholder="Chọn giới tính">
                                    <Option value="MALE">Nam</Option>
                                    <Option value="FEMALE">Nữ</Option>
                                    <Option value="OTHER">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* User Code */}
                    <Form.Item name="userCode" label="Mã nhân viên (Tùy chọn)">
                        <Input placeholder="Mã định danh (nếu có)" />
                    </Form.Item>

                    <Form.Item name="role" label="Chức vụ" rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}>
                        <Select placeholder="Chọn chức vụ">
                            <Option value="GUARD">Bảo vệ</Option>
                            <Option value="JANITOR">Lao công</Option>
                            <Option value="MANAGER">Quản lý</Option>
                            {/* Thêm các role khác từ RoleEnum */}
                        </Select>
                    </Form.Item>

                    {/* Select Khu vực */}
                    <Form.Item
                        name="dormId" // !!! Đảm bảo name này khớp với DTO CreateEmployeeRequest !!!
                        label="Khu vực làm việc (Tòa nhà)"
                        rules={[{ required: false, message: 'Vui lòng chọn khu vực!' }]} // Đặt required=true nếu bắt buộc
                    >
                        <Select placeholder="Chọn khu vực (nếu có)" loading={dorms.length === 0} allowClear>
                            {dorms.map(dorm => (
                                <Option key={dorm.id} value={dorm.id}>{dorm.dormName}</Option> // Gửi đi ID
                            ))}
                        </Select>
                    </Form.Item>
                    {/* --- Kết thúc các trường Form --- */}

                    {/* Nút bấm */}
                    <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
                        <Space>
                            <Button onClick={handleCancelAdd}> Hủy </Button>
                            <Button type="primary" htmlType="submit" loading={isSubmitting}> Thêm nhân viên </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

        </Layout>
    );
}