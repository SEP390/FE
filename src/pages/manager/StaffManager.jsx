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
    UnlockOutlined,
    ClearOutlined
} from "@ant-design/icons";

// Import SideBarManager
import { SideBarManager } from '../../components/layout/SideBarManger';
// Import axiosClient
import axiosClient from '../../api/axiosClient/axiosClient';
// Import dayjs for DatePicker
import dayjs from 'dayjs';
// Import customParseFormat plugin for dayjs if needed for dob parsing
// import customParseFormat from 'dayjs/plugin/customParseFormat';
// dayjs.extend(customParseFormat);

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// --- COMPONENT CHÍNH ---
export function StaffManager() {
    // (States chung: collapsed, activeKey, staffData, loading, filters, dorms)
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'manager-staff';
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterPosition, setFilterPosition] = useState(undefined);
    const [filterArea, setFilterArea] = useState(undefined);
    const [dorms, setDorms] = useState([]);

    // (State Modal Add)
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
    const [formAddStaff] = Form.useForm();

    // (State Modal Sửa)
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [formEditStaff] = Form.useForm();

    // --- API Calls ---
    const fetchStaff = async () => {
        setLoading(true);
        try {
            // !!! LƯU Ý BE: Cần sửa lỗi NullPointerException trong service getAllEmployee() !!!
            const response = await axiosClient.get('/employees');
            if (response && response.data) {
                const dataWithKey = response.data.map(staff => ({ ...staff, key: staff.employeeId }));
                setStaffData(dataWithKey);
            } else { setStaffData([]); }
        } catch (error) {
            console.error("Lỗi khi tải danh sách nhân viên:", error.response || error);
            message.error("Không thể tải danh sách nhân viên!");
            setStaffData([]);
        } finally { setLoading(false); }
    };

    const fetchDorms = async () => {
        try {
            const response = await axiosClient.get('/dorms');
            if (response && response.data) {
                setDorms(response.data);
            }
        } catch (error) { message.error("Không thể tải danh sách khu vực!"); }
    };

    // useEffect gọi APIs khi component mount
    useEffect(() => {
        fetchStaff();
        fetchDorms();
    }, []);

    // --- Filtering Logic ---
    const filteredData = staffData.filter(staff => {
        const searchTarget = `${staff.username || ''} ${staff.email || ''} ${staff.phone || ''}`.toLowerCase();
        const matchesSearch = searchTarget.includes(searchText.toLowerCase());
        const matchesPosition = filterPosition ? staff.role === filterPosition : true;
        const matchesArea = filterArea ? staff.dormName === filterArea : true;
        return matchesSearch && matchesPosition && matchesArea;
    });
    const handleClearFilters = () => {
        setSearchText(''); setFilterPosition(undefined); setFilterArea(undefined);
    };

    // --- Handlers cho Modal Add ---
    const showAddModal = () => setIsAddModalVisible(true);
    const handleCancelAdd = () => { setIsAddModalVisible(false); formAddStaff.resetFields(); };
    const handleAddStaff = async (values) => {
        setIsSubmittingAdd(true);
        try {
            const formattedValues = {
                ...values,
                dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null,
                // dormId không được gửi khi tạo mới (theo DTO và Service)
            };
            delete formattedValues.dormId;

            await axiosClient.post('/employees', formattedValues);
            message.success(`Đã thêm nhân viên ${values.username}!`);
            handleCancelAdd(); fetchStaff();
        } catch (error) {
            message.error(`Thêm nhân viên thất bại! ` + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmittingAdd(false);
        }
    };

    // --- Handlers cho Modal Sửa ---
    const showEditModal = (record) => {
        setEditingStaff(record);
        // Gọi API GET /employees/{id} để lấy thông tin chi tiết (vì bảng thiếu 'dob')
        axiosClient.get(`/employees/${record.employeeId}`)
            .then(response => {
                if (response && response.data) {
                    const details = response.data;
                    formEditStaff.setFieldsValue({
                        // Tìm dormId từ dormName (của record) so với danh sách dorms
                        dormId: dorms.find(d => d.dormName === record.dormName)?.id || undefined,
                        phoneNumber: details.phoneNumber, // Lấy SĐT chi tiết
                        role: details.role,
                        birthDate: details.dob ? dayjs(details.dob) : null, // Lấy dob chi tiết
                    });
                }
            })
            .catch(err => {
                message.error("Không thể tải chi tiết nhân viên để sửa!");
                // Điền thông tin cơ bản nếu API chi tiết lỗi
                formEditStaff.setFieldsValue({
                    dormId: dorms.find(d => d.dormName === record.dormName)?.id || undefined,
                    phoneNumber: record.phone, // Dùng tạm 'phone'
                    role: record.role,
                });
            });

        setIsEditModalVisible(true);
    };

    const handleCancelEdit = () => { setIsEditModalVisible(false); setEditingStaff(null); formEditStaff.resetFields(); };

    const handleUpdateStaff = async (values) => {
        if (!editingStaff) return;
        setIsSubmittingEdit(true);
        try {
            const employeeId = editingStaff.employeeId;
            // Tạo payload khớp với UpdateEmployeeRequest DTO
            const payload = {
                dormId: values.dormId || null,
                phoneNumber: values.phoneNumber,
                birthDate: values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : null,
                role: values.role,
                EmployeeId: employeeId // DTO BE có trường này
            };

            // === GỌI ĐÚNG API PUT ===
            // Endpoint: @PutMapping("/api/employees/{id}")
            await axiosClient.put(`/employees/${employeeId}`, payload);
            // === KẾT THÚC GỌI API ===

            message.success(`Đã cập nhật nhân viên ${editingStaff.username}!`);
            handleCancelEdit(); fetchStaff();
        } catch (error) {
            console.error("Lỗi khi cập nhật nhân viên:", error.response || error);
            message.error(`Cập nhật thất bại! ` + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    // --- Dropdown Actions ---
    const handleMenuClick = (key, record) => {
        if (key === 'edit') {
            showEditModal(record);
        } else if (key === 'resetPass') {
            message.info('Chức năng reset mật khẩu chưa được triển khai.');
        }
    };
    const getActionMenu = (record) => (
        <Menu onClick={({ key }) => handleMenuClick(key, record)}>
            <Menu.Item key="edit" icon={<EditOutlined />}>
                Chỉnh sửa thông tin
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="resetPass" icon={<UnlockOutlined />}>Reset mật khẩu (Cần BE)</Menu.Item>
        </Menu>
    );


    // === Định nghĩa columns (Khớp GetAllEmployeeResponse) ===
    const columns = [
        {
            title: 'Username', dataIndex: 'username', key: 'username',
            sorter: (a, b) => (a.username || '').localeCompare(b.username || ''),
            render: (text) => <Text strong>{text || 'N/A'}</Text>
        },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' }, // Dùng 'phone'
        {
            title: 'Khu vực', dataIndex: 'dormName', key: 'dormName',
            filters: [...new Set(staffData.map(item => item.dormName).filter(Boolean))].map(name => ({ text: name, value: name })),
            onFilter: (value, record) => (record.dormName || '').indexOf(value) === 0,
            render: (text) => text || 'N/A'
        },
        {
            title: 'Chức vụ', dataIndex: 'role', key: 'role',
            filters: [...new Set(staffData.map(item => item.role).filter(Boolean))].map(role => ({ text: role, value: role })),
            onFilter: (value, record) => (record.role || '').indexOf(value) === 0,
            render: (role) => <Tag color="blue">{role || 'N/A'}</Tag>
        },
        {
            title: 'Hành động', key: 'action',
            render: (text, record) => ( <Dropdown overlay={() => getActionMenu(record)} trigger={['click']}><Button type="text" icon={<MoreOutlined />} /></Dropdown> ),
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
                            <Select placeholder="Lọc theo Khu vực" style={{ width: 150 }} value={filterArea} onChange={setFilterArea} allowClear loading={dorms.length === 0}>
                                {dorms.map(dorm => (<Option key={dorm.id} value={dorm.dormName}>{dorm.dormName}</Option>))}
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

            {/* Modal Thêm Nhân Viên (Đã XÓA dormId) */}
            <Modal title="Thêm nhân viên mới" open={isAddModalVisible} onCancel={handleCancelAdd} footer={null} destroyOnClose>
                <Form form={formAddStaff} layout="vertical" onFinish={handleAddStaff} name="add_staff_form">
                    <Row gutter={16}><Col span={12}><Form.Item name="username" label="Username" rules={[{ required: true }]}><Input /></Form.Item></Col><Col span={12}><Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}><Input.Password /></Form.Item></Col></Row>
                    <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
                    <Row gutter={16}><Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}><Input /></Form.Item></Col><Col span={12}><Form.Item name="phoneNumber" label="SĐT" rules={[{ required: true }]}><Input /></Form.Item></Col></Row>
                    <Row gutter={16}><Col span={12}><Form.Item name="dob" label="Ngày sinh" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY"/></Form.Item></Col><Col span={12}><Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}><Select><Option value="MALE">Nam</Option><Option value="FEMALE">Nữ</Option><Option value="OTHER">Khác</Option></Select></Form.Item></Col></Row>
                    <Form.Item name="userCode" label="Mã NV (Tùy chọn)"><Input /></Form.Item>
                    <Form.Item name="role" label="Chức vụ" rules={[{ required: true }]}><Select><Option value="GUARD">Bảo vệ</Option><Option value="CLEANER">Lao công</Option><Option value="MANAGER">Quản lý</Option></Select></Form.Item>
                    {/* Đã xóa Form.Item dormId */}
                    <Form.Item style={{ textAlign: 'right', marginTop: 24 }}><Space><Button onClick={handleCancelAdd}>Hủy</Button><Button type="primary" htmlType="submit" loading={isSubmittingAdd}>Thêm</Button></Space></Form.Item>
                </Form>
            </Modal>

            {/* Modal Sửa Nhân Viên */}
            <Modal title={`Cập nhật thông tin ${editingStaff?.username || ''}`} open={isEditModalVisible} onCancel={handleCancelEdit} footer={null} destroyOnClose >
                <Form form={formEditStaff} layout="vertical" onFinish={handleUpdateStaff} name="edit_staff_form">
                    {/* Các trường khớp với UpdateEmployeeRequest */}
                    <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="birthDate" label="Ngày sinh" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY"/></Form.Item>
                    <Form.Item name="role" label="Chức vụ" rules={[{ required: true }]}><Select><Option value="GUARD">Bảo vệ</Option><Option value="CLEANER">Lao công</Option><Option value="MANAGER">Quản lý</Option></Select></Form.Item>
                    <Form.Item name="dormId" label="Khu vực làm việc"><Select loading={dorms.length === 0} allowClear>{dorms.map(dorm => (<Option key={dorm.id} value={dorm.id}>{dorm.dormName}</Option> ))}</Select></Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginTop: 24 }}><Space><Button onClick={handleCancelEdit}> Hủy </Button><Button type="primary" htmlType="submit" loading={isSubmittingEdit}> Cập nhật </Button></Space></Form.Item>
                </Form>
            </Modal>

        </Layout>
    );
}