import React, { useState, useEffect, useMemo } from 'react';
import {
    Layout, Typography, Calendar, Select, Button, Tag, Space, Modal, Form,
    Input, Row, Col, message, Spin, DatePicker, Checkbox
} from 'antd';
import { PlusOutlined, UserOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';
// Thêm 2 plugin này để so sánh ngày
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

// --- COMPONENT CHÍNH ---
export function ScheduleManager() {
    const [collapsed] = useState(false);
    const activeKey = 'manager-schedule';
    const [formSingle] = Form.useForm();
    const [formRecurring] = Form.useForm();

    // (States giữ nguyên)
    const [staffs, setStaffs] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [dorms, setDorms] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [scheduleData, setScheduleData] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingDependencies, setLoadingDependencies] = useState(true);
    const [isSingleModalVisible, setIsSingleModalVisible] = useState(false);
    const [isRecurringModalVisible, setIsRecurringModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    // === STATE MỚI CHO BỘ LỌC ===
    const [filterEmployeeId, setFilterEmployeeId] = useState(undefined); // undefined = "Tất cả"

    // --- HÀM LOAD DỮ LIỆU ---
    const fetchDependencies = async () => {
        setLoadingDependencies(true);
        try {
            const [staffRes, shiftRes, dormRes, semesterRes] = await Promise.all([
                axiosClient.get('/employees'),
                axiosClient.get('/shifts'),
                axiosClient.get('/dorms'),
                axiosClient.get('/semesters')
            ]);

            setStaffs(staffRes.data || []);
            const formattedShifts = (shiftRes.data || []).map(s => ({
                ...s,
                id: s.id || s.key,
                name: `${s.name} (${s.startTime} - ${s.endTime})`
            }));
            setShifts(formattedShifts);
            setDorms(dormRes.data || []);
            setSemesters(semesterRes.data || []);

        } catch (error) {
            console.error("Lỗi khi tải dependencies:", error);
            if (error.response?.status === 401) {
                message.error("Lỗi xác thực. Vui lòng đăng nhập lại.");
            } else {
                message.error("Lỗi khi tải dữ liệu (NV, Ca, Khu, Kỳ học)!");
            }
        } finally {
            setLoadingDependencies(false);
        }
    };

    const fetchSchedule = async (date) => {
        setLoading(true);
        const year = date.year();
        const month = date.month() + 1;

        try {
            // === LƯU Ý: API NÀY PHẢI ĐƯỢC SỬA Ở BACKEND ===
            // (Phải nhận 'year' và 'month', trả về List<...>)
            const response = await axiosClient.get(`/schedules`, {
                params: { year, month }
            });

            const dataByDate = {};
            (response.data || []).forEach(item => {
                // Backend PHẢI trả về 'employeeId' trong 'item'
                const dateKey = item.workDate;
                if (!dataByDate[dateKey]) {
                    dataByDate[dateKey] = [];
                }
                dataByDate[dateKey].push(item);
            });
            setScheduleData(dataByDate);

        } catch (error) {
            if (error.response?.status === 401) {
                message.error("Lỗi tải lịch (401): Chưa được cấp quyền.");
            } else {
                message.error("Không thể tải lịch làm việc! (Hãy kiểm tra API GET /schedules)");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDependencies();
        fetchSchedule(currentMonth);
    }, [currentMonth]);


    // --- HÀM RENDER LỊCH (ĐÃ SỬA) ---
    const cellRender = (value, info) => {
        if (info.type !== 'date') return null;
        const dateKey = value.format('YYYY-MM-DD');
        const listData = scheduleData[dateKey] || [];

        // === THÊM LOGIC LỌC Ở ĐÂY ===
        // Lọc dựa trên state 'filterEmployeeId'
        const filteredListData = listData.filter(item =>
            !filterEmployeeId || item.employeeId === filterEmployeeId
        );
        // === KẾT THÚC SỬA ===

        return (
            <ul className="events" style={{ listStyle: 'none', padding: 0 }}>
                {/* Dùng 'filteredListData' thay vì 'listData' */}
                {filteredListData.map((item) => (
                    <li key={item.id} style={{ marginBottom: 4 }}>
                        <Tag color="blue" style={{ whiteSpace: 'normal', cursor: 'pointer', maxWidth: '100%' }}
                             title={`${item.employeeName} (${item.shiftName}) - Khu vực: ${item.dormName}`}>
                            {item.shiftName.split(' ')[0]} - {item.employeeName.split(' ')[0]} ({item.dormName})
                        </Tag>
                    </li>
                ))}
            </ul>
        );
    };

    // --- HÀM XỬ LÝ MODAL (giữ nguyên) ---
    const onSelectDate = (value) => {
        const date = value.format('YYYY-MM-DD');
        setSelectedDate(date);
        setIsSingleModalVisible(true);
        formSingle.resetFields();
    };
    const onOpenRecurringModal = () => {
        setIsRecurringModalVisible(true);
        formRecurring.resetFields();
    };

    // --- HÀM LƯU LỊCH (giữ nguyên) ---
    const handleSaveSchedule = async (values, isRecurring = false) => {
        setLoading(true);
        let payload = {};

        if (isRecurring) {
            // Logic tạo cả kỳ
            const selectedSemester = semesters.find(s => s.id === values.semesterId);
            if (!selectedSemester) {
                message.error("Lỗi: Không tìm thấy kỳ học đã chọn.");
                setLoading(false);
                return;
            }

            payload = {
                employeeId: values.employeeId,
                shiftId: values.shiftId,
                dormId: values.dormId,
                semesterId: values.semesterId,
                from: selectedSemester.startDate,
                to: selectedSemester.endDate,
                repeatDays: values.repeatDays,
                note: values.note,
            };
        } else {
            // Logic tạo 1 ngày
            const date = dayjs(selectedDate);
            const selectedSemester = semesters.find(s =>
                date.isSameOrAfter(s.startDate) && date.isSameOrBefore(s.endDate)
            );

            if (!selectedSemester) {
                message.error(`Ngày ${selectedDate} không nằm trong bất kỳ kỳ học nào.`);
                setLoading(false);
                return;
            }

            payload = {
                employeeId: values.employeeId,
                shiftId: values.shiftId,
                dormId: values.dormId,
                semesterId: selectedSemester.id,
                singleDate: selectedDate,
                note: values.note,
            };
        }

        try {
            await axiosClient.post('/schedules', payload);
            message.success('Tạo lịch làm việc thành công!');

            fetchSchedule(currentMonth); // Tải lại lịch cho tháng hiện tại

            if (isRecurring) setIsRecurringModalVisible(false);
            else setIsSingleModalVisible(false);

        } catch (error) {
            message.error(`Tạo lịch thất bại! ` + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // (onPanelChange giữ nguyên)
    const onPanelChange = (date) => {
        setCurrentMonth(date);
    };

    // === RENDER (ĐÃ SỬA) ===
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                        Quản lý Lịch làm việc
                    </Title>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

                    <Spin spinning={loadingDependencies}>

                        {/* === SỬA THANH CÔNG CỤ (THÊM BỘ LỌC) === */}
                        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                            <Col>
                                <Space wrap>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={onOpenRecurringModal}
                                        disabled={loadingDependencies}
                                    >
                                        Tạo lịch định kỳ
                                    </Button>

                                    {/* === THÊM UI BỘ LỌC Ở ĐÂY === */}
                                    <Select
                                        placeholder="Lọc theo nhân viên"
                                        style={{ width: 250 }}
                                        allowClear
                                        showSearch
                                        value={filterEmployeeId}
                                        onChange={(value) => setFilterEmployeeId(value)}
                                        filterOption={(input, option) =>
                                            (option?.children[0] ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        disabled={loadingDependencies || !staffs.length}
                                    >
                                        {staffs.map(staff => (
                                            // Giả sử staffRes trả về employeeId và username
                                            <Option key={staff.employeeId} value={staff.employeeId}>
                                                {staff.username} <Tag>{staff.role}</Tag>
                                            </Option>
                                        ))}
                                    </Select>
                                </Space>
                            </Col>
                        </Row>
                        {/* === KẾT THÚC SỬA === */}

                        <Calendar
                            cellRender={cellRender}
                            onSelect={onSelectDate}
                            onPanelChange={onPanelChange}
                            style={{ border: '1px solid #f0f0f0', borderRadius: 4 }}
                        />
                    </Spin>

                </Content>
            </Layout>

            {/* (Modal 1: Thêm 1 ngày) - Giữ nguyên */}
            <Modal
                title={`Phân ca cho ngày ${selectedDate || ''}`}
                open={isSingleModalVisible}
                onOk={() => formSingle.submit()}
                onCancel={() => setIsSingleModalVisible(false)}
                okText="Lưu Lịch"
                confirmLoading={loading}
            >
                <Form form={formSingle} layout="vertical" onFinish={(values) => handleSaveSchedule(values, false)}>
                    <CommonScheduleForm staffs={staffs} shifts={shifts} dorms={dorms} form={formSingle} />
                </Form>
            </Modal>

            {/* (Modal 2: Tạo định kỳ) - Giữ nguyên */}
            <Modal
                title="Tạo lịch làm việc định kỳ"
                open={isRecurringModalVisible}
                onOk={() => formRecurring.submit()}
                onCancel={() => setIsRecurringModalVisible(false)}
                okText="Lưu Lịch"
                width={600}
                confirmLoading={loading}
            >
                <Form form={formRecurring} layout="vertical" onFinish={(values) => handleSaveSchedule(values, true)}>
                    <CommonScheduleForm staffs={staffs} shifts={shifts} dorms={dorms} form={formRecurring} />

                    <Form.Item name="semesterId" label="Chọn kỳ học" rules={[{ required: true, message: 'Vui lòng chọn kỳ học!' }]}>
                        <Select
                            placeholder="Chọn kỳ học để áp dụng lịch"
                            loading={loadingDependencies}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.children[0] ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {semesters.map(s => (
                                <Option key={s.id} value={s.id}>
                                    {s.name} (Từ {dayjs(s.startDate).format('DD/MM/YYYY')} đến {dayjs(s.endDate).format('DD/MM/YYYY')})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="repeatDays" label="Lặp lại vào các ngày" rules={[{ required: true }]}>
                        <CheckboxGroup
                            options={[
                                { label: 'T2', value: 'MONDAY' },
                                { label: 'T3', value: 'TUESDAY' },
                                { label: 'T4', value: 'WEDNESDAY' },
                                { label: 'T5', value: 'THURSDAY' },
                                { label: 'T6', value: 'FRIDAY' },
                                { label: 'T7', value: 'SATURDAY' },
                                { label: 'CN', value: 'SUNDAY' },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
}

// (CommonScheduleForm giữ nguyên)
const CommonScheduleForm = ({ staffs, shifts, dorms, form }) => {

    const [selectedRole, setSelectedRole] = useState(undefined);

    const handleRoleFilterChange = (value) => {
        setSelectedRole(value);
        if (form) {
            form.setFieldsValue({ employeeId: undefined });
        }
    };

    const filteredStaffs = useMemo(() => {
        if (!selectedRole) {
            // Lọc chỉ nhân viên GUARD và CLEANER cho việc phân lịch
            return staffs.filter(staff => staff.role === 'GUARD' || staff.role === 'CLEANER' || staff.role === 'TECHNICAL');
        }
        return staffs.filter(staff => staff.role === selectedRole);
    }, [selectedRole, staffs]);

    return (
        <>
            <Form.Item label="Lọc theo Chức vụ">
                <Select
                    placeholder="Chọn chức vụ để lọc"
                    allowClear
                    value={selectedRole}
                    onChange={handleRoleFilterChange}
                >
                    <Option value="GUARD">Bảo vệ</Option>
                    <Option value="CLEANER">Lao công</Option>
                    <Option value="TECHNICAL">Kỹ thuật</Option>
                </Select>
            </Form.Item>

            <Form.Item name="employeeId" label={<><UserOutlined /> Nhân viên</>} rules={[{ required: true }]}>
                <Select
                    placeholder="Chọn nhân viên"
                    showSearch
                    disabled={!staffs.length}
                    filterOption={(input, option) =>
                        (option?.children[0] ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {filteredStaffs.map(staff => (
                        <Option key={staff.employeeId} value={staff.employeeId}>
                            {staff.username} <Tag>{staff.role}</Tag>
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item name="shiftId" label={<><ClockCircleOutlined /> Ca làm việc</>} rules={[{ required: true }]}>
                <Select placeholder="Chọn ca làm việc">
                    {shifts.map(shift => (
                        <Option key={shift.id} value={shift.id}>
                            {shift.name}
                        </Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item name="dormId" label={<><EnvironmentOutlined /> Khu vực (Ký túc xá)</>} rules={[{ required: true }]}>
                <Select placeholder="Chọn ký túc xá">
                    {dorms.map(dorm => (
                        <Option key={dorm.id} value={dorm.id}>{dorm.dormName}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={2} />
            </Form.Item>
        </>
    );
};