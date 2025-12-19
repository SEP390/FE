import React, { useState, useEffect, useMemo } from 'react';
import {
    Layout, Typography, Calendar, Select, Button, Tag, Space, Modal, Form,
    Input, Row, Col, Spin, DatePicker, Checkbox, App, Divider, Table, Card
} from 'antd';
import {
    PlusOutlined, ClockCircleOutlined, SettingOutlined,
    DeleteOutlined, EditOutlined, UnorderedListOutlined, FilterOutlined
} from "@ant-design/icons";
import { LayoutManager } from '../../../components/layout/LayoutManager.jsx';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { RequireRole } from "../../../components/authorize/RequireRole.jsx";

// Cấu hình Dayjs
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/vi';
dayjs.extend(isBetween);
dayjs.locale('vi');

const { Content } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;

export function ScheduleManager() {
    const { modal, message } = App.useApp();
    const activeKey = 'manager-schedule';
    const navigate = useNavigate();

    // Khởi tạo Form
    const [formSingle] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [formRecurring] = Form.useForm();

    // Trạng thái dữ liệu
    const [staffs, setStaffs] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [dorms, setDorms] = useState([]);
    const [scheduleData, setScheduleData] = useState({});

    // Trạng thái UI
    const [loading, setLoading] = useState(false);
    const [loadingDependencies, setLoadingDependencies] = useState(true);
    const [isDailyDetailVisible, setIsDailyDetailVisible] = useState(false);
    const [isSingleModalVisible, setIsSingleModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isRecurringModalVisible, setIsRecurringModalVisible] = useState(false);

    const [selectedDate, setSelectedDate] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    // Trạng thái lọc
    const [filterEmployeeId, setFilterEmployeeId] = useState(undefined);
    const [filterDormId, setFilterDormId] = useState(undefined);
    const [dailyFilterDormId, setDailyFilterDormId] = useState(undefined);

    // --- 1. TẢI DỮ LIỆU ---
    const fetchDependencies = async () => {
        setLoadingDependencies(true);
        try {
            const [staffRes, shiftRes, dormRes] = await Promise.all([
                axiosClient.get('/employees'),
                axiosClient.get('/shifts'),
                axiosClient.get('/dorms'),
            ]);
            const staffList = staffRes.data?.data || staffRes.data || [];
            setStaffs(staffList.filter(s => s.role === 'GUARD' || s.role === 'CLEANER'));

            const shiftList = shiftRes.data?.data || shiftRes.data || [];
            setShifts(shiftList.map(s => ({
                ...s,
                id: s.id || s.shiftId,
                name: `${s.name} (${s.startTime.substring(0,5)} - ${s.endTime.substring(0,5)})`
            })));

            setDorms(dormRes.data?.data || dormRes.data || []);
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

    // --- SỬA LỖI TỰ MỞ MODAL KHI LỌC THÁNG/NĂM ---
    const handleSelectDate = (value, info) => {
        // info.source sẽ cho biết hành động đến từ đâu
        // 'date' nghĩa là người dùng click trực tiếp vào ô ngày
        if (info.source === 'date' && !isRecurringModalVisible) {
            setSelectedDate(value.format('YYYY-MM-DD'));
            setDailyFilterDormId(undefined);
            setIsDailyDetailVisible(true);
        }
    };

    const handleUpdateSchedule = async (values) => {
        setLoading(true);
        try {
            await axiosClient.put(`/schedules/${editingSchedule.scheduleId}`, {
                shiftId: values.shiftId,
                note: values.note,
                dormID: values.dormId
            });
            message.success("Cập nhật thành công!");
            fetchSchedule(currentMonth);
            setIsEditModalVisible(false);
            setIsDailyDetailVisible(true);
        } catch (error) { message.error("Cập nhật thất bại!"); }
        finally { setLoading(false); }
    };

    const handleDeleteSchedule = (id) => {
        modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa ca làm này?',
            okText: 'Xóa', okType: 'danger', cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await axiosClient.delete(`/schedules/${id}`);
                    message.success("Đã xóa ca làm việc.");
                    fetchSchedule(currentMonth);
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
        } catch (e) { message.error("Lỗi khi tạo lịch."); }
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
        } catch (e) { message.error("Lỗi khi tạo lịch định kỳ."); }
        finally { setLoading(false); }
    };

    const cellRender = (value) => {
        const dateKey = value.format('YYYY-MM-DD');
        const list = (scheduleData[dateKey] || []).filter(item =>
            (!filterEmployeeId || String(item.employeeId) === String(filterEmployeeId)) &&
            (!filterDormId || String(item.dormId) === String(filterDormId))
        );

        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {list.slice(0, 2).map(item => (
                    <li key={item.scheduleId} style={{ marginBottom: 2 }}>
                        <Tag color="blue" style={{ width: '100%', fontSize: '10px', margin: 0, overflow: 'hidden' }}>
                            {item.shiftName.split(' ')[0]}: {item.employeeName.split(' ').pop()}
                        </Tag>
                    </li>
                ))}
                {list.length > 2 && <li style={{ fontSize: 9, textAlign: 'right', color: '#8c8c8c' }}>+{list.length - 2} ca</li>}
            </ul>
        );
    };

    return (
        <RequireRole role="MANAGER">
            <LayoutManager active={activeKey} header="Quản lý lịch làm việc">
                <Content style={{ margin: '16px' }}>
                    <Card bordered={false}>
                        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                            <Col>
                                <Space>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsRecurringModalVisible(true)}>Tạo lịch định kỳ</Button>
                                    <Button icon={<SettingOutlined />} onClick={() => navigate('/manager/shifts')}>Cấu hình ca làm</Button>
                                </Space>
                            </Col>
                            <Col>
                                <Space>
                                    <Select placeholder="Lọc khu vực" style={{ width: 160 }} allowClear onChange={setFilterDormId}>
                                        {dorms.map(d => <Option key={d.id} value={String(d.id)}>{d.dormName}</Option>)}
                                    </Select>
                                    <Select placeholder="Lọc nhân viên" style={{ width: 200 }} allowClear showSearch optionFilterProp="children" onChange={setFilterEmployeeId}>
                                        {staffs.map(s => <Option key={s.employeeId} value={String(s.employeeId)}>{s.fullName || s.username}</Option>)}
                                    </Select>
                                </Space>
                            </Col>
                        </Row>

                        <Spin spinning={loadingDependencies || loading}>
                            <Calendar
                                cellRender={cellRender}
                                onSelect={handleSelectDate}
                                onPanelChange={(date) => {
                                    setCurrentMonth(date);
                                    // Khi đổi tháng từ thanh header, ta không chọn ngày
                                }}
                                headerRender={({ value, onChange }) => {
                                    const currentYear = value.year();
                                    const currentMonth = value.month();
                                    const monthOptions = [];
                                    for (let i = 0; i < 12; i++) monthOptions.push(<Option key={i} value={i}>Tháng {i + 1}</Option>);
                                    const yearOptions = [];
                                    for (let i = currentYear - 5; i < currentYear + 5; i++) yearOptions.push(<Option key={i} value={i}>Năm {i}</Option>);
                                    return (
                                        <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            {/* Đã tăng width để không bị mất chữ */}
                                            <Select size="small" value={currentMonth} onChange={(m) => onChange(value.clone().month(m))} style={{ width: 140 }}>{monthOptions}</Select>
                                            <Select size="small" value={currentYear} onChange={(y) => onChange(value.clone().year(y))} style={{ width: 120 }}>{yearOptions}</Select>
                                        </div>
                                    );
                                }}
                            />
                        </Spin>
                    </Card>
                </Content>

                {/* MODAL CHI TIẾT NGÀY */}
                <Modal
                    title={<span><UnorderedListOutlined /> Chi tiết lịch ngày {dayjs(selectedDate).format('DD/MM/YYYY')}</span>}
                    open={isDailyDetailVisible}
                    onCancel={() => setIsDailyDetailVisible(false)}
                    width={800}
                    footer={[
                        <Button key="add" type="primary" ghost onClick={() => { setIsSingleModalVisible(true); setIsDailyDetailVisible(false); }}>
                            + Phân thêm ca làm
                        </Button>
                    ]}
                >
                    <Table
                        dataSource={useMemo(() => {
                            const list = scheduleData[selectedDate] || [];
                            return dailyFilterDormId ? list.filter(i => String(i.dormId) === String(dailyFilterDormId)) : list;
                        }, [scheduleData, selectedDate, dailyFilterDormId])}
                        pagination={false} size="middle" bordered
                        columns={[
                            { title: 'Nhân viên', dataIndex: 'employeeName', key: 'name', render: (t) => <b>{t}</b> },
                            { title: 'Ca làm', dataIndex: 'shiftName', key: 'shift', render: (t) => <Tag color="cyan">{t}</Tag> },
                            { title: 'Khu vực', dataIndex: 'dormName', key: 'dorm' },
                            {
                                title: 'Thao tác', key: 'act', align: 'center', render: (_, record) => (
                                    <Space>
                                        <Button size="small" icon={<EditOutlined />} onClick={() => {
                                            setEditingSchedule(record);
                                            formEdit.setFieldsValue({
                                                employeeName: record.employeeName,
                                                workDate: dayjs(record.workDate).format('DD/MM/YYYY'),
                                                shiftId: record.shiftId,
                                                dormId: record.dormId,
                                                note: record.note
                                            });
                                            setIsEditModalVisible(true);
                                        }} />
                                        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteSchedule(record.scheduleId)} />
                                    </Space>
                                )
                            }
                        ]}
                    />
                </Modal>

                {/* MODAL SỬA LỊCH */}
                <Modal title="Chỉnh sửa lịch" open={isEditModalVisible} onCancel={() => setIsEditModalVisible(false)} onOk={() => formEdit.submit()} confirmLoading={loading}>
                    <Form form={formEdit} layout="vertical" onFinish={handleUpdateSchedule}>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="employeeName" label="Nhân viên"><Input disabled /></Form.Item></Col>
                            <Col span={12}><Form.Item name="workDate" label="Ngày làm"><Input disabled /></Form.Item></Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="shiftId" label="Ca làm việc" rules={[{required: true}]}><Select>{shifts.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select></Form.Item></Col>
                            <Col span={12}><Form.Item name="dormId" label="Khu vực" rules={[{required: true}]}><Select>{dorms.map(d => <Option key={d.id} value={d.id}>{d.dormName}</Option>)}</Select></Form.Item></Col>
                        </Row>
                        <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
                    </Form>
                </Modal>

                {/* MODAL TẠO LỊCH LẺ */}
                <Modal title={`Phân ca cho ngày: ${dayjs(selectedDate).format('DD/MM/YYYY')}`} open={isSingleModalVisible} onOk={() => formSingle.submit()} onCancel={() => setIsSingleModalVisible(false)} confirmLoading={loading}>
                    <Form form={formSingle} layout="vertical" onFinish={handleCreateSingle}>
                        <CommonScheduleForm staffs={staffs} shifts={shifts} dorms={dorms} form={formSingle} />
                        <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
                    </Form>
                </Modal>

                {/* MODAL TẠO LỊCH ĐỊNH KỲ */}
                <Modal title="Thiết lập lịch định kỳ" open={isRecurringModalVisible} onOk={() => formRecurring.submit()} onCancel={() => setIsRecurringModalVisible(false)} width={650} confirmLoading={loading}>
                    <Form form={formRecurring} layout="vertical" onFinish={handleCreateRecurring}>
                        <CommonScheduleForm staffs={staffs} shifts={shifts} dorms={dorms} form={formRecurring} />
                        <Row gutter={16}>
                            <Col span={12}><Form.Item name="from" label="Từ ngày" rules={[{required:true}]}><DatePicker style={{width:'100%'}} format="DD/MM/YYYY" /></Form.Item></Col>
                            <Col span={12}><Form.Item name="to" label="Đến ngày" rules={[{required:true}]}><DatePicker style={{width:'100%'}} format="DD/MM/YYYY" /></Form.Item></Col>
                        </Row>
                        <Form.Item name="repeatDays" label="Lặp lại vào" rules={[{required:true}]}>
                            <Checkbox.Group style={{ width: '100%' }}>
                                <Row>
                                    {[
                                        {v: 'MONDAY', l: 'Thứ 2'}, {v: 'TUESDAY', l: 'Thứ 3'}, {v: 'WEDNESDAY', l: 'Thứ 4'},
                                        {v: 'THURSDAY', l: 'Thứ 5'}, {v: 'FRIDAY', l: 'Thứ 6'}, {v: 'SATURDAY', l: 'Thứ 7'}, {v: 'SUNDAY', l: 'Chủ Nhật'}
                                    ].map(day => (
                                        <Col span={6} key={day.v}><Checkbox value={day.v}>{day.l}</Checkbox></Col>
                                    ))}
                                </Row>
                            </Checkbox.Group>
                        </Form.Item>
                    </Form>
                </Modal>
            </LayoutManager>
        </RequireRole>
    );
}

const CommonScheduleForm = ({ staffs, shifts, dorms, form }) => {
    const [selectedRole, setSelectedRole] = useState(null);
    const filteredStaffs = useMemo(() => staffs.filter(s => s.role === selectedRole), [selectedRole, staffs]);
    return (
        <Row gutter={16}>
            <Col span={12}>
                <Form.Item label="Chức vụ" rules={[{required: true}]}>
                    <Select placeholder="Chọn" onChange={(v) => { setSelectedRole(v); form.setFieldsValue({ employeeId: undefined }); }}>
                        <Option value="GUARD">Bảo vệ</Option>
                        <Option value="CLEANER">Lao công</Option>
                    </Select>
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="employeeId" label="Nhân viên" rules={[{required: true}]}>
                    <Select placeholder="Chọn nhân viên" disabled={!selectedRole} showSearch optionFilterProp="children">
                        {filteredStaffs.map(s => <Option key={s.employeeId} value={s.employeeId}>{s.fullName || s.username}</Option>)}
                    </Select>
                </Form.Item>
            </Col>
            <Col span={12}><Form.Item name="shiftId" label="Ca làm việc" rules={[{required: true}]}><Select placeholder="Chọn ca">{shifts.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="dormId" label="Khu vực trực" rules={[{required: true}]}><Select placeholder="Chọn khu vực">{dorms.map(d => <Option key={d.id} value={d.id}>{d.dormName}</Option>)}</Select></Form.Item></Col>
        </Row>
    );
};