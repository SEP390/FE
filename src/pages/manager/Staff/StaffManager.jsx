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
    ReloadOutlined
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';

// Import SideBarManager
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';
// Import axiosClient
import axiosClient from '../../../api/axiosClient/axiosClient.js';
// Import dayjs for DatePicker
import dayjs from 'dayjs';
// Import hàm tạo mật khẩu
import { generateRandomPassword } from '../../../util/password.js';

const { Header, Content } = Layout;
const { Title, Text, Link } = Typography;
const { Option } = Select;

// --- COMPONENT CHÍNH ---
export function StaffManager() {
    // (States chung)
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'manager-staff';
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterPosition, setFilterPosition] = useState(undefined);
    // --- ĐÃ XÓA: filterArea và dorms states ---

    // (State Modals - giữ nguyên)
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
    const [formAddStaff] = Form.useForm();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [formEditStaff] = Form.useForm();
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resettingStaff, setResettingStaff] = useState(null);
    const [formResetPassword] = Form.useForm();

    const navigate = useNavigate();

    // --- API Calls ---
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/employees');
            // 'response' đã là BaseResponse {status, message, data}
            if (response && response.data) {
                // response.data là List<GetAllEmployeeResponse>
                const dataWithKey = response.data.map(staff => ({
                    ...staff,
                    key: staff.employeeId,
                    phone: staff.phone || 'N/A'
                    // --- ĐÃ XÓA: dormName ---
                }));
                setStaffData(dataWithKey);
            } else { setStaffData([]); }
        } catch (error) {
            console.error("Lỗi khi tải danh sách nhân viên:", error.response || error);
            message.error("Không thể tải danh sách nhân viên!");
            setStaffData([]);
        } finally { setLoading(false); }
    };

    // --- ĐÃ XÓA: fetchDorms() ---

    useEffect(() => {
        fetchStaff();
        // --- ĐÃ XÓA: fetchDorms() ---
    }, []);

    // --- Filtering Logic ---
    const filteredData = staffData.filter(staff => {
        const searchTarget = `${staff.username || ''} ${staff.email || ''} ${staff.phone || ''}`.toLowerCase();
        const matchesSearch = searchTarget.includes(searchText.toLowerCase());
        const matchesPosition = filterPosition ? staff.role === filterPosition : true;
        // --- ĐÃ XÓA: matchesArea ---
        return matchesSearch && matchesPosition;
    });

    const handleClearFilters = () => {
        setSearchText('');
        setFilterPosition(undefined);
        // --- ĐÃ XÓA: setFilterArea(undefined) ---
    };

    // --- Handlers cho Modals (giữ nguyên) ---
    const showAddModal = () => setIsAddModalVisible(true);
    const handleCancelAdd = () => { setIsAddModalVisible(false); formAddStaff.resetFields(); };
    const handleAddStaff = async (values) => {
        setIsSubmittingAdd(true);
        try {
            const formattedValues = {
                ...values,
                dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null,
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

    const showEditModal = (record) => {
        setEditingStaff(record);
        // 'response' đã là BaseResponse {status, message, data}
        axiosClient.get(`/employees/${record.employeeId}`)
            .then(response => {
                if (response && response.data) {
                    const details = response.data; // Đây là GetEmployeeByIdResponse
                    formEditStaff.setFieldsValue({
                        phoneNumber: details.phoneNumber,
                        role: details.role,
                        birthDate: details.dob ? dayjs(details.dob) : null,
                    });
                }
            })
            .catch(err => {
                message.error("Không thể tải chi tiết nhân viên để sửa!");
                formEditStaff.setFieldsValue({
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

    const handleGenerateAddPassword = () => {
        const newPassword = generateRandomPassword();
        formAddStaff.setFieldsValue({ password: newPassword });
    };

    const handleGenerateResetPassword = () => {
        const newPassword = generateRandomPassword();
        formResetPassword.setFieldsValue({
            newPassword: newPassword,
            confirmPassword: newPassword
        });
    };

    // --- Hàm xử lý điều hướng ---
    const handleNavigateToDetails = (employeeId) => {
        if (!employeeId) {
            message.error("Không tìm thấy ID nhân viên.");
            return;
        }
        navigate(`/manager/staff/details/${employeeId}`);
    };

    // --- Dropdown Actions (giữ nguyên) ---
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

    // --- ĐÃ SỬA: Cập nhật Cột ---
    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => (a.username || '').localeCompare(b.username || ''),
            render: (text, record) => (
                <Link strong onClick={() => handleNavigateToDetails(record.employeeId)}>
                    {text || 'N/A'}
                </Link>
            )
        },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        // --- ĐÃ XÓA: Cột 'Khu vực' ---
        { title: 'Chức vụ', dataIndex: 'role', key: 'role', filters: [...new Set(staffData.map(item => item.role).filter(Boolean))].map(role => ({ text: role, value: role })), onFilter: (value, record) => (record.role || '').indexOf(value) === 0, render: (role) => <Tag color="blue">{role || 'N/A'}</Tag> },
        { title: 'Hành động', key: 'action', render: (text, record) => ( <Dropdown overlay={() => getActionMenu(record)} trigger={['click']}><Button type="text" icon={<MoreOutlined />} /></Dropdown> ) },
    ];
    // --- KẾT THÚC SỬA ---


    // --- PHẦN RENDER (Return) ---
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>Quản lý nhân viên</Title>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

                    <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                        <Col><Title level={4} style={{ margin: 0 }}>Danh sách nhân viên</Title></Col>
                        <Col><Button type="primary" icon={<UserAddOutlined />} onClick={showAddModal}>+ Thêm nhân viên</Button></Col>
                    </Row>

                    {/* --- ĐÃ SỬA: Hàng Filter --- */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 20, alignItems: 'center' }}>
                        <Col flex="400px"><Input placeholder="Tìm kiếm (Username, Email, SĐT)..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} /></Col>
                        {/* --- ĐÃ XÓA: Bộ lọc 'Khu vực' --- */}
                        <Col> <Select placeholder="Lọc theo Chức vụ" style={{ width: 150 }} value={filterPosition} onChange={setFilterPosition} allowClear> {[...new Set(staffData.map(item => item.role).filter(Boolean))].map(role => (<Option key={role} value={role}>{role}</Option>))} </Select> </Col>
                        <Col><Button onClick={handleClearFilters} icon={<ClearOutlined />}>Xóa bộ lọc</Button></Col>
                    </Row>
                    {/* --- KẾT THÚC SỬA --- */}

                    <Table columns={columns} dataSource={filteredData} loading={loading} pagination={{ pageSize: 10 }} bordered />
                </Content>
            </Layout>

            {/* (Modal Thêm Nhân Viên - ĐÃ SỬA) */}
            <Modal title="Thêm nhân viên mới" open={isAddModalVisible} onCancel={handleCancelAdd} footer={null} destroyOnClose>
                <Form form={formAddStaff} layout="vertical" onFinish={handleAddStaff} name="add_staff_form">
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="username" label="Username" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={12}><Form.Item label="Mật khẩu" required><Space.Compact style={{ width: '100%' }}><Form.Item name="password" noStyle rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}><Input.Password placeholder="Nhập hoặc tạo mật khẩu" /></Form.Item><Button icon={<ReloadOutlined />} onClick={handleGenerateAddPassword} /></Space.Compact></Form.Item></Col>
                    </Row>
                    <Form.Item name="fullName" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
                    <Row gutter={16}><Col span={12}><Form.Item name="email" label="Email" rules={[{ required: true }, { type: 'email' }]}><Input /></Form.Item></Col><Col span={12}><Form.Item name="phoneNumber" label="SĐT" rules={[{ required: true }]}><Input /></Form.Item></Col></Row>
                    <Row gutter={16}><Col span={12}><Form.Item name="dob" label="Ngày sinh" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY"/></Form.Item></Col><Col span={12}><Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}><Select><Option value="MALE">Nam</Option><Option value="FEMALE">Nữ</Option><Option value="OTHER">Khác</Option></Select></Form.Item></Col></Row>
                    <Form.Item name="userCode" label="Mã NV (Tùy chọn)"><Input /></Form.Item>

                    {/* --- SỬA ĐỔI Ở ĐÂY --- */}
                    <Form.Item name="role" label="Chức vụ" rules={[{ required: true }]}>
                        <Select>
                            <Option value="TECHNICAL">Kỹ thuật</Option>
                            <Option value="GUARD">Bảo vệ</Option>
                            <Option value="CLEANER">Lao công</Option>
                        </Select>
                    </Form.Item>
                    {/* --- KẾT THÚC SỬA ĐỔI --- */}

                    <Form.Item style={{ textAlign: 'right', marginTop: 24 }}><Space><Button onClick={handleCancelAdd}>Hủy</Button><Button type="primary" htmlType="submit" loading={isSubmittingAdd}>Thêm</Button></Space></Form.Item>
                </Form>
            </Modal>

            {/* (Modal Sửa Nhân Viên - ĐÃ SỬA) */}
            <Modal title={`Cập nhật thông tin ${editingStaff?.username || ''}`} open={isEditModalVisible} onCancel={handleCancelEdit} footer={null} destroyOnClose >
                <Form form={formEditStaff} layout="vertical" onFinish={handleUpdateStaff} name="edit_staff_form">
                    <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="birthDate" label="Ngày sinh" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY"/></Form.Item>

                    {/* --- SỬA ĐỔI Ở ĐÂY --- */}
                    {/* (Giữ lại Manager để bạn có thể sửa các quản lý viên khác) */}
                    <Form.Item name="role" label="Chức vụ" rules={[{ required: true }]}>
                        <Select>
                            <Option value="TECHNICAL">Kỹ thuật</Option>
                            <Option value="GUARD">Bảo vệ</Option>
                            <Option value="CLEANER">Lao công</Option>
                            <Option value="MANAGER">Quản lý</Option>
                        </Select>
                    </Form.Item>
                    {/* --- KẾT THÚC SỬA ĐỔI --- */}

                    <Form.Item style={{ textAlign: 'right', marginTop: 24 }}><Space><Button onClick={handleCancelEdit}> Hủy </Button><Button type="primary" htmlType="submit" loading={isSubmittingEdit}> Cập nhật </Button></Space></Form.Item>
                </Form>
            </Modal>

            {/* (Modal Reset Mật khẩu - giữ nguyên) */}
            <Modal
                title={`Reset mật khẩu cho ${resettingStaff?.username || ''}`}
                open={isResetModalVisible}
                onOk={handleOkResetPassword}
                onCancel={handleCancelResetPassword}
                confirmLoading={isResettingPassword}
                destroyOnClose
            >
                <Form form={formResetPassword} layout="vertical" name="reset_password_form">
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
                                onClick={handleGenerateResetPassword}
                            />
                        </Space.Compact>
                    </Form.Item>
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