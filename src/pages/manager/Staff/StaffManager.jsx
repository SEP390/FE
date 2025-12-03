import React, { useState, useEffect } from 'react';
import {
    Layout, Typography, Row, Col, Table, Input, Select, Button, Tag, Space,
    Dropdown, Menu, Modal, Form, DatePicker, Upload, App
} from 'antd';
import {
    SearchOutlined,
    UserAddOutlined,
    MoreOutlined,
    EditOutlined,
    UnlockOutlined,
    ClearOutlined,
    ReloadOutlined,
    EyeOutlined,
    MenuOutlined,
    UploadOutlined
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

// Import SideBarManager
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';
// Import axiosClient
import axiosClient from '../../../api/axiosClient/axiosClient.js';
// Import dayjs for DatePicker
import dayjs from 'dayjs';
// Import hàm tạo mật khẩu (giả định file này tồn tại)
import { generateRandomPassword } from '../../../util/password.js';

// Import AppHeader (Giả định path đúng)
import { AppHeader } from '../../../components/layout/AppHeader.jsx';
// Thêm import hook quản lý state global (Giả định hook này có tồn tại)
import { useCollapsed } from '../../../hooks/useCollapsed.js';
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";


const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// --- COMPONENT CHÍNH ---
export function StaffManager() {
    // (States chung)
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);
    const {message}=App.useApp();

    const activeKey = 'manager-staff';
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filterPosition, setFilterPosition] = useState(undefined);

    // (State Modals)
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
    const [formAddStaff] = Form.useForm();
    const [fileList, setFileList] = useState([]); // STATE CHO UPLOAD
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
    const [formEditStaff] = Form.useForm();
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [resettingStaff, setResettingStaff] = useState(null);
    const [formResetPassword] = Form.useForm();

    const navigate = useNavigate();

    // === LOGIC TOGGLE SIDEBAR ===
    const toggleSideBar = () => {
        setCollapsed(prev => !prev);
    }
    // === KẾT THÚC LOGIC TOGGLE ===


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
            } else { setStaffData([]); }
        } catch (error) {
            console.error("Lỗi khi tải danh sách nhân viên:", error.response || error);
            message.error("Không thể tải danh sách nhân viên!");
            setStaffData([]);
        } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    // --- Filtering Logic ---
    const filteredData = staffData.filter(staff => {
        const searchTarget = `${staff.username || ''} ${staff.email || ''} ${staff.phone || ''}`.toLowerCase();
        const matchesSearch = searchTarget.includes(searchText.toLowerCase());
        const matchesPosition = filterPosition ? staff.role === filterPosition : true;
        return matchesSearch && matchesPosition;
    });

    const handleClearFilters = () => {
        setSearchText('');
        setFilterPosition(undefined);
    };

    // --- Handlers cho Modals ---
    const showAddModal = () => setIsAddModalVisible(true);
    const handleCancelAdd = () => {
        setIsAddModalVisible(false);
        formAddStaff.resetFields();
        setFileList([]); // RESET STATE FILE
    };

    // Hàm xử lý thay đổi trạng thái file trong component Upload
    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList.slice(-1)); // Chỉ giữ lại file cuối cùng (1 ảnh)
    };

    // HÀM ĐÃ SỬA: Sử dụng Axios thuần để truyền token và multipart/form-data chính xác
    const uploadFileAndGetUrl = async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            // Lấy token trực tiếp từ localStorage (Giả định key là "token")
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error("Lỗi xác thực: Không tìm thấy token.");
            }

            // Tự gọi API bằng Axios thuần (không dùng axiosClient)
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/uploads`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            // Kiểm tra cấu trúc phản hồi từ BE: {status, message, data: URL}
            if (response && response.data && response.data.data) {
                // response.data là BaseResponse, response.data.data là URL
                return response.data.data;
            }
            throw new Error("Không nhận được đường dẫn ảnh từ server.");
        } catch (error) {
            console.error("Lỗi khi tải ảnh lên:", error.response || error);
            if (error.response && error.response.status === 401) {
                throw new Error("Không được phép (401). Vui lòng đăng nhập lại.");
            }
            throw new Error(`Tải ảnh lên thất bại! ` + (error.response?.data?.message || error.message || 'Lỗi không xác định'));
        }
    };

    const handleAddStaff = async (values) => {
        setIsSubmittingAdd(true);
        let imageUrl = null; // Khởi tạo URL ảnh

        try {
            // 1. UPLOAD ẢNH NẾU CÓ
            if (fileList.length > 0) {
                const fileToUpload = fileList[0].originFileObj;
                imageUrl = await uploadFileAndGetUrl(fileToUpload); // Lấy URL ảnh
            }

            // 2. CHUẨN HÓA DỮ LIỆU VÀ GỌI API THÊM NHÂN VIÊN
            const formattedValues = {
                ...values,
                image: imageUrl, // <-- Gửi URL ảnh vào trường 'image'
                dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null,
                hireDate: values.hireDate ? dayjs(values.hireDate).format('YYYY-MM-DD') : null,
                contractEndDate: values.contractEndDate ? dayjs(values.contractEndDate).format('YYYY-MM-DD') : null,
            };

            // Loại bỏ trường ảo
            delete formattedValues.imageUpload;

            // API tạo nhân viên
            await axiosClient.post('/employees', formattedValues);
            message.success(`Đã thêm nhân viên ${values.username} thành công!`);
            handleCancelAdd();
            fetchStaff();
        } catch (error) {
            // Bắt lỗi tổng quát
            message.error(`Thêm nhân viên thất bại! ` + (error.message || error.response?.data?.message || 'Lỗi không xác định'));
        } finally {
            setIsSubmittingAdd(false);
        }
    };

    const showEditModal = (record) => {
        setEditingStaff(record);
        // Lấy chi tiết nhân viên để điền vào form
        axiosClient.get(`/employees/${record.employeeId}`)
            .then(response => {
                if (response && response.data) {
                    const details = response.data; // Đây là GetEmployeeByIdResponse
                    formEditStaff.setFieldsValue({
                        phoneNumber: details.phoneNumber,
                        role: details.role,
                        // DOB trong response BE là dob, FE dùng birthDate
                        birthDate: details.dob ? dayjs(details.dob) : null,
                        hireDate: details.hireDate ? dayjs(details.hireDate) : null,
                        contractEndDate: details.contractEndDate ? dayjs(details.contractEndDate) : null,
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
                // Tên trường trong payload phải khớp với UpdateEmployeeRequest của BE
                phoneNumber: values.phoneNumber,
                birthDate: values.birthDate ? dayjs(values.birthDate).format('YYYY-MM-DD') : null, // BE dùng birthDate
                role: values.role,
                hireDate: values.hireDate ? dayjs(values.hireDate).format('YYYY-MM-DD') : null,
                contractEndDate: values.contractEndDate ? dayjs(values.contractEndDate).format('YYYY-MM-DD') : null,
            };

            await axiosClient.put(`/employees/${employeeId}`, payload);
            message.success(`Đã cập nhật nhân viên ${editingStaff.username}!`);
            handleCancelEdit();
            fetchStaff();
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
        // Đường dẫn này phải khớp với route của trang chi tiết
        navigate(`/manager/staff/details/${employeeId}`);
    };

    // --- Dropdown Actions ---
    const handleMenuClick = (key, record) => {
        if (key === 'viewDetails') {
            handleNavigateToDetails(record.employeeId);
        } else if (key === 'edit') {
            showEditModal(record);
        } else if (key === 'resetPass') {
            showResetPasswordModal(record);
        }
    };

    const getActionMenu = (record) => (
        <Menu onClick={({ key }) => handleMenuClick(key, record)}>
            <Menu.Item key="viewDetails" icon={<EyeOutlined />}>
                Xem chi tiết
            </Menu.Item>
            <Menu.Item key="edit" icon={<EditOutlined />}>
                Chỉnh sửa thông tin
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="resetPass" icon={<UnlockOutlined />}>
                Reset mật khẩu
            </Menu.Item>
        </Menu>
    );

    // --- Cột Bảng ---
    const columns = [
        {
            title: 'STT',
            key: 'stt',
            width: 70,
            render: (text, record, index) => {
                const currentPage = 1;
                const pageSize = 10;
                return ((currentPage - 1) * pageSize) + index + 1;
            },
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => (a.username || '').localeCompare(b.username || ''),
            render: (text) => (
                <span>
                    {text || 'N/A'}
                </span>
            )
        },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'Chức vụ', dataIndex: 'role', key: 'role', render: (role) => <Tag color="blue">{role || 'N/A'}</Tag> },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
                <Dropdown overlay={() => getActionMenu(record)} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            )
        },
    ];

    // --- PHẦN RENDER (Return) ---
    return (
        <RequireRole role="MANAGER">
            <Layout style={{ minHeight: '100vh' }}>
                <SideBarManager collapsed={collapsed} active={activeKey} />
                <Layout
                    style={{
                        marginTop: 64,
                        marginLeft: collapsed ? 80 : 260,
                        transition: 'margin-left 0.3s ease',
                    }}
                >
                    <AppHeader
                        header={"Quản lý nhân viên"}
                        toggleSideBar={toggleSideBar}
                    />
                    <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

                        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                            <Col><Title level={4} style={{ margin: 0 }}>Danh sách nhân viên</Title></Col>
                            <Col><Button type="primary" icon={<UserAddOutlined />} onClick={showAddModal}>+ Thêm nhân viên</Button></Col>
                        </Row>

                        {/* --- Hàng Filter --- */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 20, alignItems: 'center' }}>
                            <Col flex="400px"><Input placeholder="Tìm kiếm (Username, Email, SĐT)..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} /></Col>
                            <Col>
                                <Select placeholder="Lọc theo Chức vụ" style={{ width: 150 }} value={filterPosition} onChange={setFilterPosition} allowClear>
                                    {[...new Set(staffData.map(item => item.role).filter(Boolean))].map(role => (<Option key={role} value={role}>{role}</Option>))}
                                </Select>
                            </Col>
                            <Col><Button onClick={handleClearFilters} icon={<ClearOutlined />}>Xóa bộ lọc</Button></Col>
                        </Row>
                        {/* --- KẾT THÚC Hàng Filter --- */}

                        <Table
                            columns={columns}
                            dataSource={filteredData}
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                            bordered
                        />
                    </Content>
                </Layout>
            </Layout>
        </RequireRole>
    );
}

