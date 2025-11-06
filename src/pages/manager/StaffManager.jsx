import React, { useState, useEffect } from 'react';
import {
    Layout, Typography, Row, Col, Table, Input, Select, Button, Tag, Space,
    Dropdown, Menu, message, Spin, Modal, Form, DatePicker
} from 'antd';
import {
    SearchOutlined,
    UserAddOutlined,
    MoreOutlined,
    EditOutlined,
    UnlockOutlined,
    ClearOutlined,
    ReloadOutlined // --- MỚI: Thêm icon
} from "@ant-design/icons";

// Import SideBarManager
import { SideBarManager } from '../../components/layout/SideBarManger';
// Import axiosClient
import axiosClient from '../../api/axiosClient/axiosClient';
// Import dayjs for DatePicker
import dayjs from 'dayjs';
// --- MỚI: Import hàm tạo mật khẩu ---
import { generateRandomPassword } from '../../util/password'; // (Hãy kiểm tra lại đường dẫn này)

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

    // (State Modal Reset Mật khẩu)
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resettingStaff, setResettingStaff] = useState(null);
    const [formResetPassword] = Form.useForm();

    // --- API Calls ---
    // (fetchStaff và fetchDorms giữ nguyên, không thay đổi)
    const fetchStaff = async () => {
        setLoading(true);
        try {
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
    useEffect(() => {
        fetchStaff();
        fetchDorms();
    }, []);

    // --- Filtering Logic (Giữ nguyên) ---
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

    // --- Handlers cho Modal Add (Giữ nguyên) ---
    const showAddModal = () => setIsAddModalVisible(true);
    const handleCancelAdd = () => { setIsAddModalVisible(false); formAddStaff.resetFields(); };
    const handleAddStaff = async (values) => {
        setIsSubmittingAdd(true);
        try {
            const formattedValues = {
                ...values,
                dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null,
                dormId: values.dormId || null
            };
            await axiosClient.post('/employees', formattedValues);
            message.success(`Đã thêm nhân viên ${values.username} thành công!`);
            handleCancelAdd(); fetchStaff();
        } catch (error) {
            message.error(`Thêm nhân viên thất bại! ` + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmittingAdd(false);
        }
    };

    // --- Handlers cho Modal Sửa (Giữ nguyên) ---
    const showEditModal = (record) => {
        setEditingStaff(record);
        axiosClient.get(`/employees/${record.employeeId}`)
            .then(response => {
                if (response && response.data) {
                    const details = response.data;
                    formEditStaff.setFieldsValue({
                        dormId: dorms.find(d => d.dormName === record.dormName)?.id || undefined,
                        phoneNumber: details.phoneNumber,
                        role: details.role,
                        birthDate: details.dob ? dayjs(details.dob) : null,
                    });
                }
            })
            .catch(err => {
                message.error("Không thể tải chi tiết nhân viên để sửa!");
                formEditStaff.setFieldsValue({
                    dormId: dorms.find(d => d.dormName === record.dormName)?.id || undefined,
                    phoneNumber: record.phone,
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
            const payload = {
                dormId: values.dormId || null,
                phoneNumber: values.phoneNumber,
                birthDate: values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : null,
                role: values.role,
                EmployeeId: employeeId
            };
            await axiosClient.put(`/employees/${employeeId}`, payload);
            message.success(`Đã cập nhật nhân viên ${editingStaff.username}!`);
            handleCancelEdit(); fetchStaff();
        } catch (error) {
            console.error("Lỗi khi cập nhật nhân viên:", error.response || error);
            message.error(`Cập nhật thất bại! ` + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    // --- Handlers cho Modal Reset Mật khẩu (Giữ nguyên) ---
    const showResetPasswordModal = (record) => {
        setResettingStaff(record);
        setIsResetModalVisible(true);
    };
    const handleCancelResetPassword = () => {
        setIsResetModalVisible(false);
        formResetPassword.resetFields();
        setResettingStaff(null);
    };
    const handleOkResetPassword = async () => {
        if (!resettingStaff) return;
        try {
            const values = await formResetPassword.validateFields();
            setIsResettingPassword(true);
            const payload = { newPassword: values.newPassword };
            const resetPasswordPath = `/employees/${resettingStaff.employeeId}/passwords`;

            await axiosClient.put(resetPasswordPath, payload);
            message.success(`Đã đặt lại mật khẩu cho ${resettingStaff.username}!`);
            handleCancelResetPassword();
        } catch (error) {
            console.error("Lỗi khi reset mật khẩu:", error.response || error);
            message.error(`Reset mật khẩu thất bại! ` + (error.response?.data?.message || error.message));
        } finally {
            setIsResettingPassword(false);
        }
    };

    // --- MỚI: Handlers cho nút Tạo Mật Khẩu ---
    /**
     * Tạo mật khẩu cho form Thêm Nhân Viên
     */
    const handleGenerateAddPassword = () => {
        const newPassword = generateRandomPassword();
        // Cập nhật trường 'password' trong formAddStaff
        formAddStaff.setFieldsValue({ password: newPassword });
    };

    /**
     * Tạo mật khẩu cho form Reset Mật Khẩu
     */
    const handleGenerateResetPassword = () => {
        const newPassword = generateRandomPassword();
        // Cập nhật cả 2 trường để validation khớp
        formResetPassword.setFieldsValue({
            newPassword: newPassword,
            confirmPassword: newPassword
        });
    };

    // --- Dropdown Actions (Giữ nguyên) ---
    const handleMenuClick = (key, record) => {
        if (key === 'edit') {
            showEditModal(record);
        } else if (key === 'resetPass') {
            showResetPasswordModal(record);
        }
    };
    const getActionMenu = (record) => (
        <Menu onClick={({ key }) => handleMenuClick(key, record)}>
            <Menu.Item key="edit" icon={<EditOutlined />}>
                Chỉnh sửa thông tin
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="resetPass" icon={<UnlockOutlined />}>
                Reset mật khẩu
            </Menu.Item>
        </Menu>
    );

    // --- Columns (Giữ nguyên) ---
    const columns = [
        { title: 'Username', dataIndex: 'username', key: 'username', sorter: (a, b) => (a.username || '').localeCompare(b.username || ''), render: (text) => <Text strong>{text || 'N/A'}</Text> },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'Khu vực', dataIndex: 'dormName', key: 'dormName', filters: [...new Set(staffData.map(item => item.dormName).filter(Boolean))].map(name => ({ text: name, value: name })), onFilter: (value, record) => (record.dormName || '').indexOf(value) === 0, render: (text) => text || 'N/A' },
        { title: 'Chức vụ', dataIndex: 'role', key: 'role', filters: [...new Set(staffData.map(item => item.role).filter(Boolean))].map(role => ({ text: role, value: role })), onFilter: (value, record) => (record.role || '').indexOf(value) === 0, render: (role) => <Tag color="blue">{role || 'N/A'}</Tag> },
        { title: 'Hành động', key: 'action', render: (text, record) => ( <Dropdown overlay={() => getActionMenu(record)} trigger={['click']}><Button type="text" icon={<MoreOutlined />} /></Dropdown> ) },
    ];

    // --- PHẦN RENDER (Return) ---
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>Quản lý nhân viên</Title>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                    {/* (Header, Filter, Bảng - Giữ nguyên) */}
                    <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                        <Col><Title level={4} style={{ margin: 0 }}>Danh sách nhân viên</Title></Col>
                        <Col><Button type="primary" icon={<UserAddOutlined />} onClick={showAddModal}>+ Thêm nhân viên</Button></Col>
                    </Row>
                    <Row gutter={[16, 16]} style={{ marginBottom: 20, alignItems: 'center' }}>
                        <Col flex="400px"><Input placeholder="Tìm kiếm (Username, Email, SĐT)..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} /></Col>
                        <Col> <Select placeholder="Lọc theo Khu vực" style={{ width: 150 }} value={filterArea} onChange={setFilterArea} allowClear loading={dorms.length === 0}> {dorms.map(dorm => (<Option key={dorm.id} value={dorm.dormName}>{dorm.dormName}</Option>))} </Select> </Col>
                        <Col> <Select placeholder="Lọc theo Chức vụ" style={{ width: 150 }} value={filterPosition} onChange={setFilterPosition} allowClear> {[...new Set(staffData.map(item => item.role).filter(Boolean))].map(role => (<Option key={role} value={role}>{role}</Option>))} </Select> </Col>
                        <Col><Button onClick={handleClearFilters} icon={<ClearOutlined />}>Xóa bộ lọc</Button></Col>
                    </Row>
                    <Table columns={columns} dataSource={filteredData} loading={loading} pagination={{ pageSize: 10 }} bordered />
                </Content>
            </Layout>

            {/* --- MỚI: CẬP NHẬT MODAL THÊM NHÂN VIÊN --- */}
            <Modal title="Thêm nhân viên mới" open={isAddModalVisible} onCancel={handleCancelAdd} footer={null} destroyOnClose>
                <Form form={formAddStaff} layout="vertical" onFinish={handleAddStaff} name="add_staff_form">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="username" label="Username" rules={[{ required: true }]}><Input /></Form.Item>
                        </Col>

                        {/* --- MỚI: Cập nhật ô Mật khẩu --- */}
                        <Col span={12}>
                            <Form.Item label="Mật khẩu" required>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Form.Item
                                        name="password"
                                        noStyle
                                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                                    >
                                        <Input.Password placeholder="Nhập hoặc tạo mật khẩu" />
                                    </Form.Item>
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleGenerateAddPassword} // Gắn handler
                                    />
                                </Space.Compact>
                            </Form.Item>
                        </Col>
                        {/* --- Kết thúc cập nhật --- */}
                    </Row>

                    <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
                    <Row gutter={16}><Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}><Input /></Form.Item></Col><Col span={12}><Form.Item name="phoneNumber" label="SĐT" rules={[{ required: true }]}><Input /></Form.Item></Col></Row>
                    <Row gutter={16}><Col span={12}><Form.Item name="dob" label="Ngày sinh" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY"/></Form.Item></Col><Col span={12}><Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}><Select><Option value="MALE">Nam</Option><Option value="FEMALE">Nữ</Option><Option value="OTHER">Khác</Option></Select></Form.Item></Col></Row>
                    <Form.Item name="userCode" label="Mã NV (Tùy chọn)"><Input /></Form.Item>
                    <Form.Item name="role" label="Chức vụ" rules={[{ required: true }]}><Select><Option value="GUARD">Bảo vệ</Option><Option value="CLEANER">Lao công</Option><Option value="MANAGER">Quản lý</Option></Select></Form.Item>
                    <Form.Item name="dormId" label="Khu vực làm việc"><Select placeholder="Chọn khu vực (nếu có)" loading={dorms.length === 0} allowClear>{dorms.map(dorm => (<Option key={dorm.id} value={dorm.id}>{dorm.dormName}</Option> ))}</Select></Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginTop: 24 }}><Space><Button onClick={handleCancelAdd}>Hủy</Button><Button type="primary" htmlType="submit" loading={isSubmittingAdd}>Thêm</Button></Space></Form.Item>
                </Form>
            </Modal>

            {/* (Modal Sửa Nhân Viên - giữ nguyên) */}
            <Modal title={`Cập nhật thông tin ${editingStaff?.username || ''}`} open={isEditModalVisible} onCancel={handleCancelEdit} footer={null} destroyOnClose >
                <Form form={formEditStaff} layout="vertical" onFinish={handleUpdateStaff} name="edit_staff_form">
                    <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="birthDate" label="Ngày sinh" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY"/></Form.Item>
                    <Form.Item name="role" label="Chức vụ" rules={[{ required: true }]}><Select><Option value="GUARD">Bảo vệ</Option><Option value="CLEANER">Lao công</Option><Option value="MANAGER">Quản lý</Option></Select></Form.Item>
                    <Form.Item name="dormId" label="Khu vực làm việc"><Select loading={dorms.length === 0} allowClear>{dorms.map(dorm => (<Option key={dorm.id} value={dorm.id}>{dorm.dormName}</Option> ))}</Select></Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginTop: 24 }}><Space><Button onClick={handleCancelEdit}> Hủy </Button><Button type="primary" htmlType="submit" loading={isSubmittingEdit}> Cập nhật </Button></Space></Form.Item>
                </Form>
            </Modal>

            {/* --- MỚI: CẬP NHẬT MODAL RESET MẬT KHẨU --- */}
            <Modal
                title={`Reset mật khẩu cho ${resettingStaff?.username || ''}`}
                open={isResetModalVisible}
                onOk={handleOkResetPassword}
                onCancel={handleCancelResetPassword}
                confirmLoading={isResettingPassword}
                destroyOnClose
            >
                <Form form={formResetPassword} layout="vertical" name="reset_password_form">

                    {/* --- MỚI: Cập nhật ô Mật khẩu mới --- */}
                    <Form.Item label="Mật khẩu mới" required>
                        <Space.Compact style={{ width: '100%' }}>
                            <Form.Item
                                name="newPassword"
                                noStyle
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                                ]}
                                hasFeedback
                            >
                                <Input.Password placeholder="Nhập hoặc tạo mật khẩu" />
                            </Form.Item>
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={handleGenerateResetPassword} // Gắn handler
                            />
                        </Space.Compact>
                    </Form.Item>
                    {/* --- Kết thúc cập nhật --- */}

                    {/* (Trường Xác nhận mật khẩu giữ nguyên) */}
                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        dependencies={['newPassword']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>
                </Form>
            </Modal>

        </Layout>
    );
}