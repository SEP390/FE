import React, { useState, useEffect, useMemo } from 'react';
import {
    Layout, Typography, Calendar, Select, Button, Tag, Space, Modal, Form,
    Input, Row, Col, message, Spin, Checkbox
} from 'antd';
import { PlusOutlined, UserOutlined, ClockCircleOutlined, EnvironmentOutlined, FilterOutlined, SettingOutlined } from "@ant-design/icons";
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

// --- CẤU HÌNH DAYJS ---
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
    // Layout State
    const [collapsed] = useState(false);
    const activeKey = 'manager-schedule';

    const navigate = useNavigate();

    // Form Instances
    const [formSingle] = Form.useForm();
    const [formRecurring] = Form.useForm();
    const [formEdit] = Form.useForm();

    // Data States
    const [staffs, setStaffs] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [dorms, setDorms] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [scheduleData, setScheduleData] = useState({});

    // UI/Loading States
    const [loading, setLoading] = useState(false);
    const [loadingDependencies, setLoadingDependencies] = useState(true);

    // Modal Visibility
    const [isSingleModalVisible, setIsSingleModalVisible] = useState(false);
    const [isRecurringModalVisible, setIsRecurringModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    // Selected Data
    const [selectedDate, setSelectedDate] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    // === FILTER STATES (BỘ LỌC) ===
    const [filterEmployeeId, setFilterEmployeeId] = useState(undefined);
    const [filterSemesterId, setFilterSemesterId] = useState(undefined);
    const [filterDormId, setFilterDormId] = useState(undefined);

    // --- 1. FETCH DATA ---
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
                name: `${s.name} (${s.startTime} - ${s.endTime})`,
                shortName: s.name
            }));
            setShifts(formattedShifts);
            setDorms(dormRes.data || []);
            setSemesters(semesterRes?.content?.data || []);
        } catch (error) {
            console.error("Lỗi dependencies:", error);
            message.error("Không thể tải dữ liệu hệ thống.");
        } finally {
            setLoadingDependencies(false);
        }
    };

    const fetchSchedule = async (dateObj) => {
        setLoading(true);
        const from = dateObj.startOf('month').format('YYYY-MM-DD');
        const to = dateObj.endOf('month').format('YYYY-MM-DD');

        try {
            const response = await axiosClient.get(`/schedules`, { params: { from, to } });
            const listSchedules = response.data?.data || response.data || [];
            const dataByDate = {};

            if (Array.isArray(listSchedules)) {
                listSchedules.forEach(item => {
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

    useEffect(() => { fetchDependencies(); }, []);
    useEffect(() => { fetchSchedule(currentMonth); }, [currentMonth]);

    // --- 2. HANDLERS ---
    const onOpenEditModal = (scheduleItem) => {
        setEditingSchedule(scheduleItem);
        formEdit.setFieldsValue({
            employeeName: scheduleItem.employeeName,
            workDate: dayjs(scheduleItem.workDate).format('DD/MM/YYYY'),
            shiftId: scheduleItem.shiftId,
            dormId: scheduleItem.dormId,
            note: scheduleItem.note
        });
        setIsEditModalVisible(true);
    };

    const handleUpdateSchedule = async (values) => {
        setLoading(true);
        try {
            const payload = {
                shiftId: values.shiftId,
                dormID: values.dormId,
                note: values.note
            };
            await axiosClient.put(`/schedules/${editingSchedule.scheduleId}`, payload);
            message.success("Cập nhật lịch thành công!");
            fetchSchedule(currentMonth);
            setIsEditModalVisible(false);
            setEditingSchedule(null);
        } catch (error) {
            message.error("Cập nhật thất bại: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // --- 3. RENDER Ô LỊCH ---
    const cellRender = (value) => {
        const dateKey = value.format('YYYY-MM-DD');
        const listData = scheduleData[dateKey] || [];

        const filteredListData = listData.filter(item => {
            const matchEmployee = !filterEmployeeId || item.employeeId === filterEmployeeId;
            const matchSemester = !filterSemesterId || item.semesterId === filterSemesterId;
            const matchDorm = !filterDormId || item.dormId === filterDormId;
            return matchEmployee && matchSemester && matchDorm;
        });

        const MAX_ITEMS = 3;
        const displayList = filteredListData.slice(0, MAX_ITEMS);
        const remaining = filteredListData.length - MAX_ITEMS;

        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {displayList.map((item) => {
                    const simpleShiftName = item.shiftName.split('(')[0].trim();
                    return (
                        <li key={item.scheduleId} style={{ marginBottom: 2 }}>
                            <Tag
                                color="blue"
                                style={{
                                    width: '100%', margin: 0, cursor: 'pointer',
                                    fontSize: '11px', padding: '0 4px', border: 'none',
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}
                                title={`NV: ${item.employeeName}\nCa: ${item.shiftName}\nKhu: ${item.dormName}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenEditModal(item);
                                }}
                            >
                                <b>{simpleShiftName}</b> - {item.employeeName}
                            </Tag>
                        </li>
                    )
                })}
                {remaining > 0 && (
                    <li style={{ textAlign: 'right', marginTop: 2 }}>
                        <span style={{ fontSize: '10px', color: '#888' }}>+{remaining} nữa...</span>
                    </li>
                )}
            </ul>
        );
    };

    const onSelectDate = (value) => {
        const date = value.format('YYYY-MM-DD');
        setSelectedDate(date);
        setIsSingleModalVisible(true);
    };
    const onPanelChange = (value) => setCurrentMonth(value);

    const handleCreateSchedule = async (values, isRecurring = false) => {
        setLoading(true);
        let payload = {};
        if (isRecurring) {
            const selectedSemester = semesters.find(s => s.id === values.semesterId);
            if (!selectedSemester) { message.error("Chọn kỳ học!"); setLoading(false); return; }
            payload = {
                employeeId: values.employeeId, shiftId: values.shiftId, dormId: values.dormId,
                semesterId: values.semesterId, from: selectedSemester.startDate, to: selectedSemester.endDate,
                repeatDays: values.repeatDays, note: values.note,
            };
        } else {
            const date = dayjs(selectedDate);
            const selectedSemester = semesters.find(s => date.isSameOrAfter(s.startDate) && date.isSameOrBefore(s.endDate));
            if (!selectedSemester) { message.error(`Ngày ${selectedDate} không thuộc kỳ nào.`); setLoading(false); return; }
            payload = {
                employeeId: values.employeeId, shiftId: values.shiftId, dormId: values.dormId,
                semesterId: selectedSemester.id, singleDate: selectedDate, note: values.note,
            };
        }

        try {
            await axiosClient.post('/schedules', payload);
            message.success('Tạo lịch thành công!');
            fetchSchedule(currentMonth);
            if (isRecurring) setIsRecurringModalVisible(false); else setIsSingleModalVisible(false);
        } catch (error) {
            message.error(`Lỗi: ` + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // --- GIAO DIỆN ---
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 64, display: 'flex', alignItems: 'center' }}>
                    <Title level={3} style={{ margin: 0 }}>Quản lý Lịch làm việc</Title>
                </Header>

                <Content style={{ margin: '16px', padding: 24, background: '#fff' }}>
                    <Spin spinning={loadingDependencies}>

                        {/* --- THANH CÔNG CỤ (TOOLBAR) --- */}
                        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                            <Col>
                                <Space>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsRecurringModalVisible(true)}>
                                        Tạo lịch định kỳ
                                    </Button>

                                    <Button
                                        icon={<SettingOutlined />}
                                        onClick={() => navigate('/manager/shifts')}
                                    >
                                        Cấu hình Ca
                                    </Button>
                                </Space>
                            </Col>
                            <Col>
                                <Space>
                                    <FilterOutlined style={{ color: '#888' }} />

                                    {/* BỘ LỌC KỲ HỌC */}
                                    <Select placeholder="Lọc kỳ học" style={{ width: 180 }} allowClear onChange={setFilterSemesterId}>
                                        {semesters.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                                    </Select>

                                    {/* BỘ LỌC TÒA NHÀ */}
                                    <Select
                                        placeholder="Lọc khu vực"
                                        style={{ width: 160 }}
                                        allowClear
                                        onChange={setFilterDormId}
                                    >
                                        {dorms.map(d => <Option key={d.id} value={d.id}>{d.dormName}</Option>)}
                                    </Select>

                                    {/* BỘ LỌC NHÂN VIÊN */}
                                    <Select placeholder="Lọc nhân viên" style={{ width: 200 }} allowClear showSearch optionFilterProp="children" onChange={setFilterEmployeeId}>
                                        {staffs.map(s => <Option key={s.employeeId} value={s.employeeId}>{s.username} <Tag style={{marginLeft:5, fontSize:10}}>{s.role}</Tag></Option>)}
                                    </Select>
                                </Space>
                            </Col>
                        </Row>

                        {/* CALENDAR */}
                        <Calendar
                            cellRender={cellRender}
                            onSelect={onSelectDate}
                            onPanelChange={onPanelChange}
                            headerRender={({ value, onChange }) => {
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
                    </Spin>
                </Content>
            </Layout>

            {/* --- MODAL 1: TẠO MỚI NGÀY LẺ --- */}
            <Modal
                title={`Phân ca cho ngày: ${selectedDate}`}
                open={isSingleModalVisible}
                onOk={() => formSingle.submit()}
                onCancel={() => setIsSingleModalVisible(false)}
                okText="Lưu" cancelText="Hủy" destroyOnClose confirmLoading={loading}
            >
                <Form form={formSingle} layout="vertical" onFinish={(values) => handleCreateSchedule(values, false)}>
                    <CommonScheduleForm staffs={staffs} shifts={shifts} dorms={dorms} />
                </Form>
            </Modal>

            {/* --- MODAL 2: TẠO ĐỊNH KỲ --- */}
            <Modal
                title="Tạo lịch định kỳ"
                open={isRecurringModalVisible}
                onOk={() => formRecurring.submit()}
                onCancel={() => setIsRecurringModalVisible(false)}
                okText="Lưu toàn bộ" cancelText="Hủy" width={650} destroyOnClose confirmLoading={loading}
            >
                <Form form={formRecurring} layout="vertical" onFinish={(values) => handleCreateSchedule(values, true)}>
                    <CommonScheduleForm staffs={staffs} shifts={shifts} dorms={dorms} isRecurring={true} />
                    <Row gutter={16} style={{ marginTop: 10, borderTop: '1px dashed #d9d9d9', paddingTop: 10 }}>
                        <Col span={24}>
                            <Form.Item name="semesterId" label="Áp dụng cho kỳ học" rules={[{ required: true }]}>
                                <Select placeholder="Chọn kỳ học">
                                    {semesters.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="repeatDays" label="Lặp lại" rules={[{ required: true }]}>
                                {/* === SỬA PHẦN NÀY THÀNH TIẾNG VIỆT === */}
                                <CheckboxGroup
                                    options={[
                                        { label: 'Thứ 2', value: 'MONDAY' },
                                        { label: 'Thứ 3', value: 'TUESDAY' },
                                        { label: 'Thứ 4', value: 'WEDNESDAY' },
                                        { label: 'Thứ 5', value: 'THURSDAY' },
                                        { label: 'Thứ 6', value: 'FRIDAY' },
                                        { label: 'Thứ 7', value: 'SATURDAY' },
                                        { label: 'Chủ Nhật', value: 'SUNDAY' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* --- MODAL 3: SỬA LỊCH --- */}
            <Modal
                title="Chỉnh sửa lịch làm việc"
                open={isEditModalVisible}
                onOk={() => formEdit.submit()}
                onCancel={() => setIsEditModalVisible(false)}
                okText="Cập nhật" cancelText="Hủy" destroyOnClose confirmLoading={loading}
            >
                <Form form={formEdit} layout="vertical" onFinish={handleUpdateSchedule}>
                    <Row gutter={16} style={{ marginBottom: 10, background: '#f5f5f5', padding: '10px 0', borderRadius: 4 }}>
                        <Col span={12}>
                            <Form.Item name="employeeName" label="Nhân viên">
                                <Input disabled style={{ color: '#333', fontWeight: 'bold' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="workDate" label="Ngày làm việc">
                                <Input disabled style={{ color: '#333', fontWeight: 'bold' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="shiftId" label="Ca làm việc" rules={[{ required: true, message: 'Chọn ca' }]}>
                                <Select placeholder="Chọn ca">
                                    {shifts.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dormId" label="Khu vực (KTX)" rules={[{ required: true, message: 'Chọn KTX' }]}>
                                <Select placeholder="Chọn khu vực">
                                    {dorms.map(d => <Option key={d.id} value={d.id}>{d.dormName}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
}

// --- FORM CON ---
const CommonScheduleForm = ({ staffs, shifts, dorms }) => {
    const [roleFilter, setRoleFilter] = useState(null);
    const filteredStaffs = useMemo(() => {
        if (!roleFilter) return staffs.filter(s => ['GUARD', 'CLEANER', 'TECHNICAL'].includes(s.role));
        return staffs.filter(s => s.role === roleFilter);
    }, [roleFilter, staffs]);

    return (
        <>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Lọc chức vụ">
                        <Select placeholder="Tất cả" onChange={setRoleFilter} allowClear>
                            <Option value="GUARD">Bảo vệ</Option>
                            <Option value="CLEANER">Lao công</Option>
                            <Option value="TECHNICAL">Kỹ thuật</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="employeeId" label={<><UserOutlined /> Nhân viên</>} rules={[{ required: true }]}>
                        <Select placeholder="Chọn nhân viên" showSearch optionFilterProp="children">
                            {filteredStaffs.map(s => <Option key={s.employeeId} value={s.employeeId}>{s.username} <Tag style={{fontSize:10}}>{s.role}</Tag></Option>)}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="shiftId" label={<><ClockCircleOutlined /> Ca làm việc</>} rules={[{ required: true }]}>
                        <Select placeholder="Chọn ca">
                            {shifts.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="dormId" label={<><EnvironmentOutlined /> Khu vực (KTX)</>} rules={[{ required: true }]}>
                        <Select placeholder="Chọn khu vực">
                            {dorms.map(d => <Option key={d.id} value={d.id}>{d.dormName}</Option>)}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={2} placeholder="..." />
            </Form.Item>
        </>
    );
};