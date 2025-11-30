import React, { useState, useEffect } from 'react';
import {
    Layout, Typography, Calendar, Tag, Space, message, Spin, Row, Col, Select, Button
} from 'antd';
import {
    ClockCircleOutlined, UserOutlined, EnvironmentOutlined, FilterOutlined, LogoutOutlined, MenuOutlined // <-- Thêm LogoutOutlined, MenuOutlined
} from "@ant-design/icons";
import { GuardSidebar } from '../../../components/layout/GuardSidebar.jsx';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom'; // <-- Thêm useNavigate

// --- CẤU HÌNH DAYJS ---
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {useToken} from "../../../hooks/useToken.js";
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// --- COMPONENT CHÍNH ---
export function GuardSchedule() {
    // Layout State
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'guard-schedule';

    // Data States
    const [scheduleData, setScheduleData] = useState({});
    const [loading, setLoading] = useState(false);

    // Guard Info State
    const [guardId, setGuardId] = useState(null);
    const [guardInfo, setGuardInfo] = useState(null);
    const [loadingInfo, setLoadingInfo] = useState(true);
    const [error, setError] = useState(null);

    // Filter State
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    // Khởi tạo useNavigate
    const navigate = useNavigate();

    // === LOGIC LOGOUT VÀ TOGGLE SIDEBAR ===
    const {setToken} = useToken();
    const handleLogout = () => {
        setToken(null);
        message.success('Đã đăng xuất thành công!');
        navigate('/');
    };
    const toggleSideBar = () => {
        setCollapsed(prev => !prev);
    }
    // === KẾT THÚC LOGIC LOGOUT VÀ TOGGLE ===


    // --- 1. FETCH USER INFO VÀ DORM ID ---
    const fetchGuardInfo = async () => {
        setLoadingInfo(true);
        setError(null);

        try {
            // Dùng endpoint đã được xác nhận là chính xác: /users/profile
            const response = await axiosClient.get('/users/profile');
            const userData = response.data;

            // SỬA LỖI LOGIC: Lấy ID từ StudentId hoặc username (DÙNG TẠM VÌ THIẾU UUID)
            const employeeId = userData?.StudentId || userData?.username;

            if (employeeId) {
                setGuardId(String(employeeId));
                setGuardInfo(userData);
            } else {
                setError("Lỗi cấu trúc dữ liệu: Response API không chứa trường ID người dùng.");
                message.error("Lỗi cấu trúc dữ liệu người dùng.");
            }

        } catch (error) {
            console.error("Lỗi tải thông tin cá nhân:", error);
            const status = error.response?.status;

            if (status === 401 || status === 403) {
                setError(`Lỗi xác thực (${status}). Vui lòng kiểm tra quyền truy cập của tài khoản Guard.`);
            } else {
                setError(error.message);
            }
            message.error("Không thể tải thông tin Bảo vệ!");
        } finally {
            setLoadingInfo(false);
        }
    };

    // --- 2. FETCH SCHEDULE DỰA TRÊN GUARD ID ---
    const fetchSchedule = async (dateObj, employeeId) => {
        if (!employeeId) return;

        setLoading(true);
        const from = dateObj.startOf('month').format('YYYY-MM-DD');
        const to = dateObj.endOf('month').format('YYYY-MM-DD');

        try {
            // Gửi employeeId cố định của Bảo vệ và size lớn để lấy hết lịch
            const response = await axiosClient.get(`/schedules`, {
                params: { from, to, employeeId: employeeId, size: 1000 }
            });

            // Xử lý an toàn cấu trúc Response
            const listSchedules = response.data?.data?.content || response.data?.data || response.data || [];

            const schedulesArray = Array.isArray(listSchedules) ? listSchedules :
                (listSchedules.content ? listSchedules.content : []);

            const dataByDate = {};
            if (Array.isArray(schedulesArray)) {
                schedulesArray.forEach(item => {
                    const dateKey = item.workDate;
                    if (dateKey) {
                        if (!dataByDate[dateKey]) dataByDate[dateKey] = [];
                        dataByDate[dateKey].push(item);
                    }
                });
            }
            setScheduleData(dataByDate);
        } catch (error) {
            console.error("Lỗi tải lịch:", error);
            message.error("Không thể tải lịch làm việc!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchGuardInfo(); }, []);
    useEffect(() => { fetchSchedule(currentMonth, guardId); }, [currentMonth, guardId]);


    // --- 3. RENDER Ô LỊCH ---
    const cellRender = (value) => {
        const dateKey = value.format('YYYY-MM-DD');
        const listData = scheduleData[dateKey] || [];

        // Không cần lọc theo dormId nữa, chỉ hiển thị lịch cá nhân
        const filteredListData = listData;

        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {filteredListData.map((item) => {
                    const simpleShiftName = item.shiftName.split('(')[0].trim();
                    return (
                        <li key={item.scheduleId} style={{ marginBottom: 2 }}>
                            <Tag
                                color="green"
                                style={{
                                    width: '100%', margin: 0,
                                    fontSize: '11px', padding: '0 4px', border: 'none',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}
                                title={`Ca: ${item.shiftName}\nKhu: ${item.dormName}`}
                            >
                                <ClockCircleOutlined style={{ marginRight: 4 }} />
                                <b>{simpleShiftName}</b> ({item.dormName})
                            </Tag>
                        </li>
                    )
                })}
            </ul>
        );
    };

    const onPanelChange = (value) => setCurrentMonth(value);

    // --- XỬ LÝ TRẠNG THÁI LOADING VÀ ERROR ---
    if (loadingInfo) {
        return (
            <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />
        );
    }

    if (error) {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <GuardSidebar collapsed={collapsed} active={activeKey} />
                <div style={{ padding: 50, textAlign: 'center', margin: 'auto', background: '#fff' }}>
                    <Title level={4} style={{ color: 'red' }}>Lỗi tải thông tin!</Title>
                    <Text type="danger">{error}</Text>
                    <p style={{ marginTop: 15 }}>Vui lòng kiểm tra kết nối hoặc đảm bảo tài khoản của bạn có quyền truy cập endpoint này.</p>
                </div>
            </Layout>
        );
    }

    // --- RENDER MAIN CONTENT ---
    return (
        <RequireRole role = "GUARD">
        <Layout style={{ minHeight: '100vh' }}>
            <GuardSidebar collapsed={collapsed} active={activeKey} />
            <Layout>
                {/* === HEADER TÍCH HỢP LOGOUT VÀ MENU TOGGLE === */}
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <MenuOutlined onClick={toggleSideBar} style={{ fontSize: '18px', cursor: 'pointer' }} />
                        <Title level={3} style={{ margin: 0 }}>Lịch làm việc Cá nhân</Title>
                    </div>
                    <Button
                        type="default"
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                    >
                        Đăng xuất
                    </Button>
                </Header>
                {/* === KẾT THÚC HEADER === */}

                <Content style={{ margin: '16px', padding: 24, background: '#fff' }}>
                    <Spin spinning={loading}>

                        {/* --- THÔNG TIN VÀ CHỌN THÁNG/NĂM --- */}
                        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                            <Col>
                                <Space direction="vertical" size={2}>
                                    <Text strong><UserOutlined /> Bảo vệ: {guardInfo?.fullName || guardInfo?.username || 'N/A'}</Text>
                                    {/* DÒNG NÀY ĐÃ ĐƯỢC XÓA */}
                                </Space>
                            </Col>
                            <Col>
                                <Space>
                                    <FilterOutlined style={{ color: '#888' }} />
                                    {/* Lọc tháng/năm tự động của Calendar */}
                                </Space>
                            </Col>
                        </Row>

                        {/* CALENDAR */}
                        <Calendar
                            cellRender={cellRender}
                            onPanelChange={onPanelChange}
                            headerRender={({ value, onChange }) => {
                                // Lấy code render header từ Manager Schedule để đồng bộ
                                const currentYear = value.year();
                                const currentMonth = value.month();
                                const monthOptions = [];
                                for (let i = 0; i < 12; i++) {
                                    monthOptions.push(<Option key={i} value={i}>Tháng {i + 1}</Option>);
                                }
                                const yearOptions = [];
                                for (let i = currentYear - 10; i < currentYear + 10; i++) {
                                    yearOptions.push(<Option key={i} value={i}>Năm {i}</Option>);
                                }
                                return (
                                    <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <Select
                                            value={currentMonth}
                                            onChange={(newMonth) => {
                                                const now = value.clone().month(newMonth);
                                                onChange(now);
                                            }}
                                            style={{ width: 110 }}
                                        >
                                            {monthOptions}
                                        </Select>
                                        <Select
                                            value={currentYear}
                                            onChange={(newYear) => {
                                                const now = value.clone().year(newYear);
                                                onChange(now);
                                            }}
                                            style={{ width: 110 }}
                                        >
                                            {yearOptions}
                                        </Select>
                                    </div>
                                );
                            }}
                        />

                        {/* Thông báo nếu không có lịch */}
                        {!loading && Object.keys(scheduleData).length === 0 && (
                            <div style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
                                Không có lịch làm việc được phân công trong tháng này.
                            </div>
                        )}
                    </Spin>
                </Content>
            </Layout>
        </Layout>
        </RequireRole>
    );
}