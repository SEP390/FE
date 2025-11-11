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

    // --- HÀM LOAD DỮ LIỆU ---
    const fetchDependencies = async () => {
        setLoadingDependencies(true);
        try {
            const [staffRes, shiftRes, dormRes, semesterRes] = await Promise.all([
                axiosClient.get('/employees'),
                axiosClient.get('/shifts'),
                axiosClient.get('/dorms'),
                axiosClient.get('/semesters') // Đã sửa đường dẫn
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
            const response = await axiosClient.get(`/schedules`, {
                params: { year, month }
            });

            const dataByDate = {};
            (response.data || []).forEach(item => {
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
                message.error("Không thể tải lịch làm việc!");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDependencies();
        fetchSchedule(currentMonth);
    }, [currentMonth]);

    // (Hàm render lịch và các hàm mở modal giữ nguyên)
    // ...
    // --- HÀM RENDER LỊCH (giữ nguyên) ---
    const cellRender = (value, info) => {
        if (info.type !== 'date') return null;
        const dateKey = value.format('YYYY-MM-DD');
        const listData = scheduleData[dateKey] || [];
        return (
            <ul className="events" style={{ listStyle: 'none', padding: 0 }}>
                {listData.map((item) => (
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
    // ...

    // --- ĐÃ SỬA: HÀM LƯU LỊCH (handleSaveSchedule) ---
    const handleSaveSchedule = async (values, isRecurring = false) => {
        setLoading(true);
        let payload = {};

        if (isRecurring) {
            // Logic tạo cả kỳ (ĐÃ CHẠY ĐÚNG)
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
            // === SỬA LOGIC TẠO 1 NGÀY (THÊM semesterId) ===
            const date = dayjs(selectedDate);

            // Tìm xem ngày được click thuộc kỳ học nào
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
                semesterId: selectedSemester.id, // <-- THÊM DÒNG NÀY
                singleDate: selectedDate,
                note: values.note,
            };
            // === KẾT THÚC SỬA ===
        }

        try {
            await axiosClient.post('/schedules', payload);
            message.success('Tạo lịch làm việc thành công!');

            fetchSchedule(currentMonth);

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

    // === RENDER ===
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
                        <Space style={{ marginBottom: 20 }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={onOpenRecurringModal}
                                disabled={loadingDependencies}
                            >
                                Tạo lịch định kỳ
                            </Button>
                        </Space>

                        <Calendar
                            cellRender={cellRender}
                            onSelect={onSelectDate}
                            onPanelChange={onPanelChange}
                            style={{ border: '1px solid #f0f0f0', borderRadius: 4 }}
                        />
                    </Spin>

                </Content>
            </Layout>

            {/* (Modal 1: Thêm 1 ngày) */}
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

            {/* (Modal 2: Tạo định kỳ) */}
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
            return staffs;
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