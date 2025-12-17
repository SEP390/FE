import React, { useState, useEffect, useMemo } from 'react';
import {
    Layout, Typography, Calendar, Select, Button, Tag, Space, Modal, Form,
    Input, Row, Col, Spin, DatePicker, Checkbox, App, Divider, Table
} from 'antd';
import {
    PlusOutlined, UserOutlined, ClockCircleOutlined,
    EnvironmentOutlined, FilterOutlined, SettingOutlined,
    DeleteOutlined, EditOutlined, UnorderedListOutlined
} from "@ant-design/icons";
import { LayoutManager } from '../../../components/layout/LayoutManager.jsx';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useCollapsed } from '../../../hooks/useCollapsed.js';
import { RequireRole } from "../../../components/authorize/RequireRole.jsx";

// Cấu hình Dayjs
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const { Content } = Layout;
const { Option } = Select;
const { Title } = Typography;

export function ScheduleManager() {
    const collapsed = useCollapsed(state => state.collapsed);
    const { modal, message } = App.useApp();
    const activeKey = 'manager-schedule';
    const navigate = useNavigate();

    // Form Instances
    const [formSingle] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [formRecurring] = Form.useForm();

    // Data States
    const [staffs, setStaffs] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [dorms, setDorms] = useState([]);
    const [scheduleData, setScheduleData] = useState({});

    // UI States
    const [loading, setLoading] = useState(false);
    const [loadingDependencies, setLoadingDependencies] = useState(true);
    const [isDailyDetailVisible, setIsDailyDetailVisible] = useState(false);
    const [isSingleModalVisible, setIsSingleModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isRecurringModalVisible, setIsRecurringModalVisible] = useState(false);

    // Selected Data
    const [selectedDate, setSelectedDate] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    // Filter States
    const [filterEmployeeId, setFilterEmployeeId] = useState(undefined);
    const [filterDormId, setFilterDormId] = useState(undefined);

    // --- THÊM MỚI: State lọc khu vực trong Modal chi tiết ngày ---
    const [dailyFilterDormId, setDailyFilterDormId] = useState(undefined);

    // --- 1. FETCH DATA ---
    const fetchDependencies = async () => {
        setLoadingDependencies(true);
        try {
            const [staffRes, shiftRes, dormRes] = await Promise.all([
                axiosClient.get('/employees'),
                axiosClient.get('/shifts'),
                axiosClient.get('/dorms'),
            ]);
            const filteredStaffs = (staffRes.data || []).filter(s => s.role === 'GUARD' || s.role === 'CLEANER');
            setStaffs(filteredStaffs);
            setShifts((shiftRes.data || []).map(s => ({ ...s, id: s.id || s.key, name: `${s.name} (${s.startTime} - ${s.endTime})` })));
            setDorms(dormRes.data || []);
        } catch (error) { message.error("Không thể tải dữ liệu hệ thống."); }
        finally { setLoadingDependencies(false); }
    };

    const fetchSchedule = async (dateObj) => {
        setLoading(true);
        const from = dateObj.startOf('month').format('YYYY-MM-DD');
        const to = dateObj.endOf('month').format('YYYY-MM-DD');
        try {
            const response = await axiosClient.get(`/schedules`, { params: { from, to } });
            const list = response.data?.data || response.data || [];
            const mapped = {};
            list.forEach(item => {
                if (!mapped[item.workDate]) mapped[item.workDate] = [];
                mapped[item.workDate].push(item);
            });
            setScheduleData(mapped);
        } catch (error) { message.error("Lỗi tải lịch làm việc."); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDependencies(); }, []);
    useEffect(() => { fetchSchedule(currentMonth); }, [currentMonth]);

    // --- 2. HANDLERS ---
    const handleSelectDate = (value) => {
        if (!isRecurringModalVisible) {
            setSelectedDate(value.format('YYYY-MM-DD'));
            setDailyFilterDormId(undefined); // Reset bộ lọc khi mở ngày mới
            setIsDailyDetailVisible(true);
        }
    };

    const onOpenEditModal = (item) => {
        setEditingSchedule(item);
        formEdit.setFieldsValue({
            employeeName: item.employeeName,
            workDate: dayjs(item.workDate).format('DD/MM/YYYY'),
            role: staffs.find(s => s.employeeId === item.employeeId)?.role,
            shiftId: item.shiftId,
            dormId: item.dormId,
            note: item.note
        });
        setIsEditModalVisible(true);
    };

    const handleUpdateSchedule = async (values) => {
        setLoading(true);
        try {
            const payload = {
                shiftId: values.shiftId,
                note: values.note,
                dormID: values.dormId
            };
            await axiosClient.put(`/schedules/${editingSchedule.scheduleId}`, payload);
            message.success("Cập nhật thành công!");
            fetchSchedule(currentMonth);
            setIsEditModalVisible(false);
            setIsDailyDetailVisible(true);
        } catch (error) {
            message.error("Cập nhật thất bại: " + (error.response?.data?.message || error.message));
        }
        finally { setLoading(false); }
    };

    const handleDeleteSchedule = (id) => {
        modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa ca làm này?',
            okText: 'Xóa', okType: 'danger',
            onOk: async () => {
                try {
                    await axiosClient.delete(`/schedules/${id || editingSchedule.scheduleId}`);
                    message.success("Đã xóa ca làm việc.");
                    fetchSchedule(currentMonth);
                    setIsEditModalVisible(false);
                } catch (e) { message.error("Xóa thất bại."); }
            }
        });
    };

    const handleCreateSingle = async (values) => {
        setLoading(true);
        try {
            await axiosClient.post('/schedules', { ...values, singleDate: selectedDate });
            message.success('Tạo lịch thành công!');
            fetchSchedule(currentMonth);
            setIsSingleModalVisible(false);
            formSingle.resetFields();
        } catch (e) { message.error("Lỗi tạo lịch."); }
        finally { setLoading(false); }
    };

    const handleCreateRecurring = async (values) => {
        setLoading(true);
        try {
            await axiosClient.post('/schedules', {
                ...values,
                from: values.from.format('YYYY-MM-DD'),
                to: values.to.format('YYYY-MM-DD'),
            });
            message.success('Tạo lịch định kỳ thành công!');
            fetchSchedule(currentMonth);
            setIsRecurringModalVisible(false);
            formRecurring.resetFields();
        } catch (e) { message.error("Lỗi tạo lịch định kỳ."); }
        finally { setLoading(false); }
    };

    // --- LOGIC LỌC TRONG MODAL CHI TIẾT NGÀY ---
    const dailySchedules = useMemo(() => {
        const list = scheduleData[selectedDate] || [];
        if (!dailyFilterDormId) return list;
        return list.filter(item => String(item.dormId) === String(dailyFilterDormId));
    }, [scheduleData, selectedDate, dailyFilterDormId]);

    const cellRender = (value) => {
        const dateKey = value.format('YYYY-MM-DD');
        const list = (scheduleData[dateKey] || []).filter(item =>
            (!filterEmployeeId || String(item.employeeId) === String(filterEmployeeId)) &&
            (!filterDormId || String(item.dormId) === String(filterDormId))
        );

        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {list.slice(0, 3).map(item => (
                    <li key={item.scheduleId} style={{ marginBottom: 2 }}>
                        <Tag color="blue" style={{ width: '100%', fontSize: '11px', margin: 0 }}>
                            {item.shiftName.split('(')[0]} - {item.employeeName.split(' ').pop()}
                        </Tag>
                    </li>
                ))}
                {list.length > 3 && <li style={{ fontSize: 10, textAlign: 'right' }}>+{list.length - 3}...</li>}
            </ul>
        );
    };

    return (
        <RequireRole role="MANAGER">
            <LayoutManager active={activeKey} header="Quản lý Lịch làm việc">
                <Content style={{ margin: '16px', padding: 24, background: '#fff' }}>
                    <Spin spinning={loadingDependencies}>
                        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                            <Col>
                                <Space>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsRecurringModalVisible(true)}>Tạo Lịch Định Kỳ</Button>
                                    <Button icon={<SettingOutlined />} onClick={() => navigate('/manager/shifts')}>Cấu hình Ca</Button>
                                </Space>
                            </Col>
                            <Col>
                                <Space>
                                    <Select placeholder="Lọc khu vực" style={{ width: 160 }} allowClear onChange={setFilterDormId}>
                                        {dorms.map(d => <Option key={d.id} value={String(d.id)}>{d.dormName}</Option>)}
                                    </Select>
                                    <Select placeholder="Lọc nhân viên" style={{ width: 200 }} allowClear showSearch optionFilterProp="children" onChange={setFilterEmployeeId}>
                                        {staffs.map(s => <Option key={s.employeeId} value={String(s.employeeId)}>{s.username} ({s.role})</Option>)}
                                    </Select>
                                </Space>
                            </Col>
                        </Row>

                        <Calendar
                            cellRender={cellRender}
                            onSelect={handleSelectDate}
                            onPanelChange={setCurrentMonth}
                            headerRender={({ value, onChange }) => {
                                const currentYear = value.year();
                                const currentMonth = value.month();
                                const monthOptions = [];
                                for (let i = 0; i < 12; i++) monthOptions.push(<Option key={i} value={i}>Tháng {i + 1}</Option>);
                                const yearOptions = [];
                                for (let i = currentYear - 5; i < currentYear + 5; i++) yearOptions.push(<Option key={i} value={i}>Năm {i}</Option>);
                                return (
                                    <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <Select size="small" value={currentMonth} onChange={(m) => onChange(value.clone().month(m))} style={{ width: 150 }}>{monthOptions}</Select>
                                        <Select size="small" value={currentYear} onChange={(y) => onChange(value.clone().year(y))} style={{ width: 150 }}>{yearOptions}</Select>
                                    </div>
                                );
                            }}
                        />
                    </Spin>
                </Content>
            </LayoutManager>

            {/* MODAL DANH SÁCH CHI TIẾT NGÀY */}
            <Modal
                title={<span><UnorderedListOutlined /> Lịch ngày {dayjs(selectedDate).format('DD/MM/YYYY')}</span>}
                open={isDailyDetailVisible}
                onCancel={() => setIsDailyDetailVisible(false)}
                width={750}
                footer={[
                    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setIsSingleModalVisible(true); setIsDailyDetailVisible(false); }}>
                        Phân thêm ca
                    </Button>
                ]}
            >
                {/* --- BỘ LỌC KHU VỰC TRONG MODAL --- */}
                <Row justify="end" style={{ marginBottom: 16 }}>
                    <Col>
                        <Space>
                            <FilterOutlined style={{ color: '#8c8c8c' }} />
                            <Select
                                placeholder="Lọc theo khu vực"
                                style={{ width: 180 }}
                                allowClear
                                value={dailyFilterDormId}
                                onChange={setDailyFilterDormId}
                            >
                                {dorms.map(d => <Option key={d.id} value={String(d.id)}>{d.dormName}</Option>)}
                            </Select>
                        </Space>
                    </Col>
                </Row>

                <Table
                    dataSource={dailySchedules}
                    pagination={false} size="small"
                    columns={[
                        { title: 'Nhân viên', dataIndex: 'employeeName', key: 'name', render: (text) => <b>{text}</b> },
                        { title: 'Ca làm', dataIndex: 'shiftName', key: 'shift', render: (text) => <Tag color="blue">{text}</Tag> },
                        { title: 'Khu vực', dataIndex: 'dormName', key: 'dorm' },
                        {
                            title: 'Thao tác', key: 'act', align: 'center', render: (_, record) => (
                                <Space>
                                    <Button size="small" icon={<EditOutlined />} onClick={() => onOpenEditModal(record)} />
                                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteSchedule(record.scheduleId)} />
                                </Space>
                            )
                        }
                    ]}
                />
            </Modal>

            {/* MODAL TẠO LỊCH NGÀY LẺ */}
            <Modal title={`Phân ca cho ngày: ${selectedDate}`} open={isSingleModalVisible} onOk={() => formSingle.submit()} onCancel={() => setIsSingleModalVisible(false)} confirmLoading={loading}>
                <Form form={formSingle} layout="vertical" onFinish={handleCreateSingle}>
                    <CommonScheduleForm staffs={staffs} shifts={shifts} dorms={dorms} form={formSingle} isEdit={false} />
                    <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
                </Form>
            </Modal>

            {/* MODAL SỬA LỊCH */}
            <Modal
                title="Chỉnh sửa lịch"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsEditModalVisible(false)}>Hủy</Button>,
                    <Button key="up" type="primary" onClick={() => formEdit.submit()} loading={loading}>Cập nhật</Button>
                ]}
            >
                <Form form={formEdit} layout="vertical" onFinish={handleUpdateSchedule}>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="employeeName" label="Nhân viên"><Input disabled /></Form.Item></Col>
                        <Col span={12}><Form.Item name="workDate" label="Ngày làm"><Input disabled /></Form.Item></Col>
                        <Col span={24}><Form.Item name="role" label="Chức vụ"><Select disabled><Option value="GUARD">Bảo vệ</Option><Option value="CLEANER">Lao công</Option></Select></Form.Item></Col>
                    </Row>
                    <Divider style={{ margin: '12px 0' }} />
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="shiftId" label="* Ca làm" rules={[{required: true}]}><Select>{shifts.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select></Form.Item></Col>
                        <Col span={12}><Form.Item name="dormId" label="* Khu vực" rules={[{required: true}]}><Select>{dorms.map(d => <Option key={d.id} value={d.id}>{d.dormName}</Option>)}</Select></Form.Item></Col>
                    </Row>
                    <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={3} /></Form.Item>
                </Form>
            </Modal>

            {/* MODAL TẠO LỊCH ĐỊNH KỲ */}
            <Modal title="Tạo Lịch Định Kỳ" open={isRecurringModalVisible} onOk={() => formRecurring.submit()} onCancel={() => setIsRecurringModalVisible(false)} width={700} confirmLoading={loading}>
                <Form form={formRecurring} layout="vertical" onFinish={handleCreateRecurring}>
                    <CommonScheduleForm staffs={staffs} shifts={shifts} dorms={dorms} form={formRecurring} isEdit={false} />
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="from" label="Từ ngày" rules={[{required:true}]}><DatePicker style={{width:'100%'}} format="DD/MM/YYYY" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="to" label="Đến ngày" rules={[{required:true}]}><DatePicker style={{width:'100%'}} format="DD/MM/YYYY" /></Form.Item></Col>
                    </Row>
                    <Form.Item name="repeatDays" label="Lặp lại hàng tuần" rules={[{required:true}]}>
                        <Checkbox.Group style={{ width: '100%' }}>
                            <Row gutter={[8, 8]}>
                                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                                    <Col key={day}><Checkbox value={day}><Tag color="blue">{day}</Tag></Checkbox></Col>
                                ))}
                            </Row>
                        </Checkbox.Group>
                    </Form.Item>
                    <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
                </Form>
            </Modal>
        </RequireRole>
    );
}

const CommonScheduleForm = ({ staffs, shifts, dorms, form, isEdit }) => {
    const [selectedRole, setSelectedRole] = useState(null);
    const filteredStaffs = useMemo(() => staffs.filter(s => s.role === selectedRole), [selectedRole, staffs]);
    return (
        <>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Chức vụ" rules={[{required: true}]}>
                        <Select placeholder="Chọn" onChange={(v) => { setSelectedRole(v); form.setFieldsValue({ employeeId: undefined }); }} disabled={isEdit}>
                            <Option value="GUARD">Bảo vệ</Option>
                            <Option value="CLEANER">Lao công</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="employeeId" label="Nhân viên" rules={[{required: true}]}>
                        <Select placeholder="Chọn NV" disabled={!selectedRole || isEdit} showSearch optionFilterProp="children">
                            {filteredStaffs.map(s => <Option key={s.employeeId} value={s.employeeId}>{s.username}</Option>)}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}><Form.Item name="shiftId" label="Ca làm" rules={[{required: true}]}><Select>{shifts.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select></Form.Item></Col>
                <Col span={12}><Form.Item name="dormId" label="Khu vực" rules={[{required: true}]}><Select>{dorms.map(d => <Option key={d.id} value={d.id}>{d.dormName}</Option>)}</Select></Form.Item></Col>
            </Row>
        </>
    );
};