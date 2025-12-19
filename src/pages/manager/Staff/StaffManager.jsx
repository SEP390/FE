import React, { useState, useEffect } from 'react';
import {
    Typography, Row, Col, Table, Input, Select, Button, Tag, Space,
    Dropdown, Menu, Modal, Form, DatePicker, Upload, App, Card
} from 'antd';
import {
    SearchOutlined,
    UserAddOutlined,
    MoreOutlined,
    EditOutlined,
    UnlockOutlined,
    ClearOutlined,
    EyeOutlined,
    UploadOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

// Nhập LayoutManager đồng nhất
import { LayoutManager } from '../../../components/layout/LayoutManager.jsx';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';
import { RequireRole } from "../../../components/authorize/RequireRole.jsx";

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Hàm tạo mật khẩu ngẫu nhiên theo yêu cầu:
 * - Ít nhất 6 ký tự.
 * - Đúng 1 chữ hoa, 1 số, 1 ký tự đặc biệt.
 * - Còn lại là chữ thường.
 */
const generateCustomPassword = (length = 10) => {
    const finalLength = length < 6 ? 6 : length;
    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numberChars = "0123456789";
    const specialChars = "!@#$%^&*()";
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";

    let password = "";
    password += upperChars[Math.floor(Math.random() * upperChars.length)];
    password += numberChars[Math.floor(Math.random() * numberChars.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    for (let i = password.length; i < finalLength; i++) {
        password += lowerChars[Math.floor(Math.random() * lowerChars.length)];
    }

    return password.split("").sort(() => 0.5 - Math.random()).join("");
};

export function StaffManager() {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const activeKey = 'manager-staff';

    // --- Trạng thái ---
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterPosition, setFilterPosition] = useState(undefined);

    // Trạng thái Modal
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
    const [formAddStaff] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [formEditStaff] = Form.useForm();

    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resettingStaff, setResettingStaff] = useState(null);
    const [formResetPassword] = Form.useForm();

    // --- Gọi API ---
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/employees');
            if (response && response.data) {
                const dataWithKey = response.data.map(staff => ({
                    ...staff,
                    key: staff.employeeId,
                    phone: staff.phoneNumber || staff.phone || 'Chưa cập nhật'
                }));
                setStaffData(dataWithKey);
            }
        } catch (error) {
            message.error("Không thể tải danh sách nhân viên!");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchStaff(); }, []);

    // --- Logic Lọc ---
    const filteredData = staffData.filter(staff => {
        const searchTarget = `${staff.username || ''} ${staff.email || ''} ${staff.phone || ''}`.toLowerCase();
        const matchesSearch = searchTarget.includes(searchText.toLowerCase());
        const matchesPosition = filterPosition ? staff.role === filterPosition : true;
        return matchesSearch && matchesPosition;
    });

    // --- Xử lý sự kiện ---
    const handleFileChange = ({ fileList: newFileList }) => setFileList(newFileList.slice(-1));

    const uploadFileAndGetUrl = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const token = localStorage.getItem("token");
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/uploads`, formData, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return response.data.data;
    };

    const handleAddStaff = async (values) => {
        setIsSubmittingAdd(true);
        try {
            let imageUrl = null;
            if (fileList.length > 0) {
                imageUrl = await uploadFileAndGetUrl(fileList[0].originFileObj);
            }

            const payload = {
                username: values.username,
                fullName: values.fullName,
                password: values.password,
                userCode: values.userCode,
                email: values.email,
                dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null,
                gender: values.gender,
                role: values.role,
                phoneNumber: values.phoneNumber,
                hireDate: values.hireDate ? dayjs(values.hireDate).format('YYYY-MM-DD') : null,
                contractEndDate: values.contractEndDate ? dayjs(values.contractEndDate).format('YYYY-MM-DD') : null,
                image: imageUrl
            };

            await axiosClient.post('/employees', payload);
            message.success(`Đã thêm nhân viên thành công!`);
            setIsAddModalVisible(false);
            formAddStaff.resetFields();
            setFileList([]);
            fetchStaff();
        } catch (error) {
            message.error("Thêm nhân viên thất bại!");
        } finally { setIsSubmittingAdd(false); }
    };

    const handleUpdateStaff = async (values) => {
        setIsSubmittingEdit(true);
        try {
            const payload = {
                phoneNumber: values.phoneNumber,
                dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null,
                role: values.role,
                hireDate: values.hireDate ? dayjs(values.hireDate).format('YYYY-MM-DD') : null,
                contractEndDate: values.contractEndDate ? dayjs(values.contractEndDate).format('YYYY-MM-DD') : null,
            };
            await axiosClient.put(`/employees/${editingStaff.employeeId}`, payload);
            message.success("Cập nhật thông tin thành công!");
            setIsEditModalVisible(false);
            fetchStaff();
        } catch (error) { message.error("Cập nhật thất bại!"); }
        finally { setIsSubmittingEdit(false); }
    };

    const handleOkResetPassword = async () => {
        const values = await formResetPassword.validateFields();
        setIsResettingPassword(true);
        try {
            await axiosClient.put(`/employees/${resettingStaff.employeeId}/passwords`, { newPassword: values.newPassword });
            message.success("Đã đặt lại mật khẩu thành công!");
            setIsResetModalVisible(false);
            formResetPassword.resetFields();
        } catch (error) { message.error("Lỗi khi đặt lại mật khẩu!"); }
        finally { setIsResettingPassword(false); }
    };

    const columns = [
        { title: 'STT', key: 'stt', width: 70, render: (_, __, index) => index + 1 },
        { title: 'Tên đăng nhập', dataIndex: 'username', key: 'username', sorter: (a, b) => (a.username || '').localeCompare(b.username || '') },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        {
            title: 'Chức vụ',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const colors = { GUARD: 'cyan', CLEANER: 'green', TECHNICAL: 'orange' };
                const labels = { GUARD: 'Bảo vệ', CLEANER: 'Lao công', TECHNICAL: 'Kỹ thuật' };
                return <Tag color={colors[role] || 'blue'}>{labels[role] || role}</Tag>;
            }
        },
        {
            title: 'Thao tác', key: 'action', render: (_, record) => (
                <Dropdown overlay={
                    <Menu onClick={({ key }) => {
                        if (key === 'view') navigate(`/manager/staff/details/${record.employeeId}`);
                        if (key === 'edit') {
                            setEditingStaff(record);
                            axiosClient.get(`/employees/${record.employeeId}`).then(res => {
                                formEditStaff.setFieldsValue({
                                    ...res.data,
                                    dob: res.data.dob ? dayjs(res.data.dob) : null,
                                    hireDate: res.data.hireDate ? dayjs(res.data.hireDate) : null,
                                    contractEndDate: res.data.contractEndDate ? dayjs(res.data.contractEndDate) : null,
                                });
                            });
                            setIsEditModalVisible(true);
                        }
                        if (key === 'reset') { setResettingStaff(record); setIsResetModalVisible(true); }
                    }}>
                        <Menu.Item key="view" icon={<EyeOutlined />}>Xem chi tiết</Menu.Item>
                        <Menu.Item key="edit" icon={<EditOutlined />}>Chỉnh sửa</Menu.Item>
                        <Menu.Divider />
                        <Menu.Item key="reset" icon={<UnlockOutlined />}>Đặt lại mật khẩu</Menu.Item>
                    </Menu>
                } trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            )
        },
    ];

    return (
        <RequireRole role="MANAGER">
            <LayoutManager active={activeKey} header="Quản lý nhân viên">
                <Card bordered={false}>
                    <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                        <Col><Title level={4} style={{ margin: 0 }}>Danh sách nhân viên</Title></Col>
                        <Col><Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsAddModalVisible(true)}>+ Thêm nhân viên</Button></Col>
                    </Row>

                    <Row gutter={16} style={{ marginBottom: 20 }}>
                        <Col flex="400px"><Input placeholder="Tìm kiếm theo tên, email, SĐT..." prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} /></Col>
                        <Col>
                            <Select placeholder="Chức vụ" style={{ width: 150 }} value={filterPosition} onChange={setFilterPosition} allowClear>
                                <Option value="GUARD">Bảo vệ</Option>
                                <Option value="CLEANER">Lao công</Option>
                                <Option value="TECHNICAL">Kỹ thuật</Option>
                            </Select>
                        </Col>
                        <Col><Button onClick={() => { setSearchText(''); setFilterPosition(undefined); }} icon={<ClearOutlined />}>Xóa lọc</Button></Col>
                    </Row>

                    <Table columns={columns} dataSource={filteredData} loading={loading} bordered pagination={{ pageSize: 10 }} />
                </Card>

                {/* MODAL THÊM */}
                <Modal title="Thêm nhân viên mới" open={isAddModalVisible} onCancel={() => setIsAddModalVisible(false)} footer={null} width={700}>
                    <Form form={formAddStaff} layout="vertical" onFinish={handleAddStaff}>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item label="Tên đăng nhập" name="username" rules={[{required: true, message: 'Vui lòng nhập tên đăng nhập!'}]}><Input /></Form.Item></Col>
                            <Col span={12}>
                                <Form.Item label="Mật khẩu" name="password" rules={[{required: true, message: 'Vui lòng nhập mật khẩu!'}]}>
                                    <Input.Password
                                        addonAfter={<ReloadOutlined style={{cursor:'pointer'}} onClick={() => formAddStaff.setFieldsValue({password: generateCustomPassword(10)})} title="Tạo mật khẩu ngẫu nhiên" />}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item label="Họ và tên" name="fullName" rules={[{required: true, message: 'Vui lòng nhập họ tên!'}]}><Input /></Form.Item></Col>
                            <Col span={12}><Form.Item label="Email" name="email" rules={[{required: true, type: 'email', message: 'Email không hợp lệ!'}]}><Input /></Form.Item></Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Số điện thoại"
                                    name="phoneNumber"
                                    rules={[
                                        {required: true, message: 'Vui lòng nhập số điện thoại!'},
                                        {pattern: /^\d{9,11}$/, message: 'SĐT không hợp lệ! Phải là chữ số và có độ dài từ 9 đến 11 ký tự.'}
                                    ]}
                                >
                                    <Input placeholder="Ví dụ: 0912345678" />
                                </Form.Item>
                            </Col>
                            <Col span={12}><Form.Item label="Giới tính" name="gender" rules={[{required: true, message: 'Vui lòng chọn giới tính!'}]}><Select options={[{value:'MALE', label:'Nam'}, {value:'FEMALE', label:'Nữ'}]}/></Form.Item></Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item label="Mã nhân viên" name="userCode"><Input placeholder="VD: NV001" /></Form.Item></Col>
                            <Col span={12}><Form.Item label="Chức vụ" name="role" rules={[{required: true, message: 'Vui lòng chọn chức vụ!'}]}><Select options={[{value:'GUARD', label:'Bảo vệ'}, {value:'CLEANER', label:'Lao công'}, {value:'TECHNICAL', label:'Kỹ thuật'}]}/></Form.Item></Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    label="Ngày sinh"
                                    name="dob"
                                    rules={[
                                        {required: true, message: 'Vui lòng chọn ngày sinh!'},
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                const hireDate = getFieldValue('hireDate');
                                                if (!value || !hireDate || value.isBefore(hireDate)) return Promise.resolve();
                                                return Promise.reject(new Error('Ngày sinh phải trước ngày vào làm!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <DatePicker style={{width:'100%'}} format="DD/MM/YYYY" placeholder="Chọn ngày"/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Ngày vào làm"
                                    name="hireDate"
                                    rules={[
                                        {required: true, message: 'Vui lòng chọn ngày vào làm!'},
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                const contractEndDate = getFieldValue('contractEndDate');
                                                if (!value || !contractEndDate || value.isBefore(contractEndDate)) return Promise.resolve();
                                                return Promise.reject(new Error('Ngày vào làm phải trước ngày kết thúc HĐ!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <DatePicker style={{width:'100%'}} format="DD/MM/YYYY" placeholder="Chọn ngày"/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Kết thúc HĐ" name="contractEndDate" rules={[{required: true, message: 'Vui lòng chọn ngày kết thúc!'}]}>
                                    <DatePicker style={{width:'100%'}} format="DD/MM/YYYY" placeholder="Chọn ngày"/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item label="Ảnh đại diện">
                            <Upload listType="picture" fileList={fileList} onChange={handleFileChange} beforeUpload={() => false} maxCount={1}><Button icon={<UploadOutlined />}>Chọn ảnh</Button></Upload>
                        </Form.Item>
                        <Space style={{width:'100%', justifyContent:'flex-end'}}><Button onClick={() => setIsAddModalVisible(false)}>Hủy</Button><Button type="primary" htmlType="submit" loading={isSubmittingAdd}>Thêm nhân viên</Button></Space>
                    </Form>
                </Modal>

                {/* MODAL SỬA */}
                <Modal title="Cập nhật thông tin nhân viên" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} footer={null} width={650}>
                    <Form form={formEditStaff} layout="vertical" onFinish={handleUpdateStaff}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Số điện thoại"
                                    name="phoneNumber"
                                    rules={[
                                        {required: true, message: 'Số điện thoại không được để trống!'},
                                        {pattern: /^\d{9,11}$/, message: 'SĐT không hợp lệ! Vui lòng nhập từ 9 đến 11 chữ số.'}
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}><Form.Item label="Chức vụ" name="role" rules={[{required: true, message: 'Vui lòng chọn chức vụ!'}]}><Select options={[{value:'GUARD', label:'Bảo vệ'}, {value:'CLEANER', label:'Lao công'}, {value:'TECHNICAL', label:'Kỹ thuật'}]}/></Form.Item></Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    label="Ngày sinh"
                                    name="dob"
                                    rules={[
                                        {required: true, message: 'Vui lòng chọn ngày sinh!'},
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                const hireDate = getFieldValue('hireDate');
                                                if (!value || !hireDate || value.isBefore(hireDate)) return Promise.resolve();
                                                return Promise.reject(new Error('Ngày sinh phải trước ngày vào làm!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <DatePicker style={{width:'100%'}} format="DD/MM/YYYY" placeholder="Chọn ngày"/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="Ngày vào làm"
                                    name="hireDate"
                                    rules={[
                                        {required: true, message: 'Vui lòng chọn ngày vào làm!'},
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                const contractEndDate = getFieldValue('contractEndDate');
                                                if (!value || !contractEndDate || value.isBefore(contractEndDate)) return Promise.resolve();
                                                return Promise.reject(new Error('Ngày vào làm phải trước ngày kết thúc HĐ!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <DatePicker style={{width:'100%'}} format="DD/MM/YYYY" placeholder="Chọn ngày"/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label="Kết thúc HĐ" name="contractEndDate" rules={[{required: true, message: 'Vui lòng chọn ngày kết thúc!'}]}>
                                    <DatePicker style={{width:'100%'}} format="DD/MM/YYYY" placeholder="Chọn ngày"/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Space style={{width:'100%', justifyContent:'flex-end', marginTop: 10}}><Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button><Button type="primary" htmlType="submit" loading={isSubmittingEdit}>Cập nhật</Button></Space>
                    </Form>
                </Modal>

                {/* MODAL RESET MẬT KHẨU */}
                <Modal title={<span><UnlockOutlined /> Đặt lại mật khẩu cho: <b>{resettingStaff?.username}</b></span>} open={isResetModalVisible} onOk={handleOkResetPassword} onCancel={() => setIsResetModalVisible(false)} confirmLoading={isResettingPassword} okText="Xác nhận" cancelText="Hủy">
                    <Form form={formResetPassword} layout="vertical">
                        <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{required: true, min: 6, message: 'Mật khẩu phải tối thiểu 6 ký tự!'}]}>
                            <Input.Password
                                placeholder="Nhập mật khẩu hoặc nhấn biểu tượng để tạo ngẫu nhiên"
                                addonAfter={<ReloadOutlined style={{cursor:'pointer', color:'#1890ff'}} onClick={() => formResetPassword.setFieldsValue({newPassword: generateCustomPassword(12)})} title="Tạo mật khẩu mạnh" />}
                            />
                        </Form.Item>
                        <Text type="secondary" style={{fontSize:'12px'}}>* Bao gồm đúng 1 chữ hoa, 1 số, 1 ký tự đặc biệt và các chữ thường.</Text>
                    </Form>
                </Modal>
            </LayoutManager>
        </RequireRole>
    );
}