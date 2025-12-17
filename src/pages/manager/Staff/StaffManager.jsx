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

// Import LayoutManager đồng nhất
import { LayoutManager } from '../../../components/layout/LayoutManager.jsx';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';
import { generateRandomPassword } from '../../../util/password.js';
import { RequireRole } from "../../../components/authorize/RequireRole.jsx";

const { Title } = Typography;
const { Option } = Select;

export function StaffManager() {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const activeKey = 'manager-staff';

    // --- States ---
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterPosition, setFilterPosition] = useState(undefined);

    // Modal States
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

    // --- API Calls ---
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/employees');
            if (response && response.data) {
                const dataWithKey = response.data.map(staff => ({
                    ...staff,
                    key: staff.employeeId,
                    phone: staff.phoneNumber || staff.phone || 'N/A'
                }));
                setStaffData(dataWithKey);
            }
        } catch (error) {
            message.error("Không thể tải danh sách nhân viên!");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchStaff(); }, []);

    // --- logic Filter ---
    const filteredData = staffData.filter(staff => {
        const searchTarget = `${staff.username || ''} ${staff.email || ''} ${staff.phone || ''}`.toLowerCase();
        const matchesSearch = searchTarget.includes(searchText.toLowerCase());
        const matchesPosition = filterPosition ? staff.role === filterPosition : true;
        return matchesSearch && matchesPosition;
    });

    // --- Handlers ---
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
                ...values,
                image: imageUrl,
                dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null,
                hireDate: values.hireDate ? dayjs(values.hireDate).format('YYYY-MM-DD') : null,
                contractEndDate: values.contractEndDate ? dayjs(values.contractEndDate).format('YYYY-MM-DD') : null,
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
                birthDate: values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : null,
                role: values.role,
                hireDate: values.hireDate ? dayjs(values.hireDate).format('YYYY-MM-DD') : null,
                contractEndDate: values.contractEndDate ? dayjs(values.contractEndDate).format('YYYY-MM-DD') : null,
            };
            await axiosClient.put(`/employees/${editingStaff.employeeId}`, payload);
            message.success("Cập nhật thành công!");
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
            message.success("Đã đặt lại mật khẩu!");
            setIsResetModalVisible(false);
            formResetPassword.resetFields();
        } catch (error) { message.error("Lỗi khi reset mật khẩu!"); }
        finally { setIsResettingPassword(false); }
    };

    const columns = [
        { title: 'STT', key: 'stt', width: 70, render: (_, __, index) => index + 1 },
        { title: 'Username', dataIndex: 'username', key: 'username', sorter: (a, b) => a.username.localeCompare(b.username) },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'Chức vụ', dataIndex: 'role', key: 'role', render: (role) => <Tag color="blue">{role}</Tag> },
        {
            title: 'Hành động', key: 'action', render: (_, record) => (
                <Dropdown overlay={
                    <Menu onClick={({ key }) => {
                        if (key === 'view') navigate(`/manager/staff/details/${record.employeeId}`);
                        if (key === 'edit') {
                            setEditingStaff(record);
                            axiosClient.get(`/employees/${record.employeeId}`).then(res => {
                                formEditStaff.setFieldsValue({
                                    ...res.data,
                                    birthDate: res.data.dob ? dayjs(res.data.dob) : null,
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
                        <Menu.Item key="reset" icon={<UnlockOutlined />}>Reset mật khẩu</Menu.Item>
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
                        <Col flex="400px"><Input placeholder="Tìm kiếm nhân viên..." prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} /></Col>
                        <Col>
                            <Select placeholder="Chức vụ" style={{ width: 150 }} value={filterPosition} onChange={setFilterPosition} allowClear>
                                {[...new Set(staffData.map(i => i.role))].map(r => <Option key={r} value={r}>{r}</Option>)}
                            </Select>
                        </Col>
                        <Col><Button onClick={() => { setSearchText(''); setFilterPosition(undefined); }} icon={<ClearOutlined />}>Xóa lọc</Button></Col>
                    </Row>

                    <Table columns={columns} dataSource={filteredData} loading={loading} bordered pagination={{ pageSize: 10 }} />
                </Card>

                {/* Modal Add/Edit/Reset logic remains same as your original, just ensured consistency */}
                <Modal title="Thêm nhân viên" open={isAddModalVisible} onCancel={() => setIsAddModalVisible(false)} footer={null} width={650}>
                    <Form form={formAddStaff} layout="vertical" onFinish={handleAddStaff}>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item label="Username" name="username" rules={[{required: true}]}><Input /></Form.Item></Col>
                            <Col span={12}>
                                <Form.Item label="Mật khẩu" name="password" rules={[{required: true}]}>
                                    <Input.Password addonAfter={<ReloadOutlined onClick={() => formAddStaff.setFieldsValue({password: generateRandomPassword()})} />} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item label="Email" name="email" rules={[{required: true, type: 'email'}]}><Input /></Form.Item>
                        <Form.Item label="Chức vụ" name="role" rules={[{required: true}]}><Select options={[{value:'GUARD', label:'Bảo vệ'},{value:'CLEANER', label:'Lao công'},{value:'TECHNICAL', label:'Kỹ thuật'}]}/></Form.Item>
                        <Row gutter={16}>
                            <Col span={8}><Form.Item label="Ngày sinh" name="dob"><DatePicker style={{width:'100%'}}/></Form.Item></Col>
                            <Col span={8}><Form.Item label="Ngày vào làm" name="hireDate"><DatePicker style={{width:'100%'}}/></Form.Item></Col>
                            <Col span={8}><Form.Item label="Kết thúc HĐ" name="contractEndDate"><DatePicker style={{width:'100%'}}/></Form.Item></Col>
                        </Row>
                        <Form.Item label="Ảnh đại diện">
                            <Upload listType="picture" fileList={fileList} onChange={handleFileChange} beforeUpload={() => false} maxCount={1}><Button icon={<UploadOutlined />}>Chọn ảnh</Button></Upload>
                        </Form.Item>
                        <Space style={{width: '100%', justifyContent: 'flex-end'}}><Button onClick={() => setIsAddModalVisible(false)}>Hủy</Button><Button type="primary" htmlType="submit" loading={isSubmittingAdd}>Lưu</Button></Space>
                    </Form>
                </Modal>

                <Modal title="Sửa nhân viên" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} footer={null}>
                    <Form form={formEditStaff} layout="vertical" onFinish={handleUpdateStaff}>
                        <Form.Item label="Số điện thoại" name="phoneNumber"><Input /></Form.Item>
                        <Form.Item label="Ngày sinh" name="birthDate"><DatePicker style={{width:'100%'}}/></Form.Item>
                        <Form.Item label="Chức vụ" name="role"><Select options={[{value:'GUARD', label:'Bảo vệ'},{value:'CLEANER', label:'Lao công'},{value:'TECHNICAL', label:'Kỹ thuật'}]}/></Form.Item>
                        <Space style={{width: '100%', justifyContent: 'flex-end'}}><Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button><Button type="primary" htmlType="submit" loading={isSubmittingEdit}>Cập nhật</Button></Space>
                    </Form>
                </Modal>

                <Modal title="Reset mật khẩu" open={isResetModalVisible} onOk={handleOkResetPassword} onCancel={() => setIsResetModalVisible(false)} confirmLoading={isResettingPassword}>
                    <Form form={formResetPassword} layout="vertical">
                        <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{required: true, min: 6}]}><Input.Password /></Form.Item>
                    </Form>
                </Modal>
            </LayoutManager>
        </RequireRole>
    );
}