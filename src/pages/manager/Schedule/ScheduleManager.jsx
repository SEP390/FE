import React, { useState, useEffect, useMemo } from 'react';
import {
    Layout, Typography, Calendar, Select, Button, Tag, Space, Modal, Form,
    Input, Row, Col, Spin, DatePicker, Checkbox, App, Divider
} from 'antd';
import {
    PlusOutlined, UserOutlined, ClockCircleOutlined,
    EnvironmentOutlined, FilterOutlined, SettingOutlined,
    DeleteOutlined, ExclamationCircleOutlined
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

export function ScheduleManager() {
    const collapsed = useCollapsed(state => state.collapsed);
    const { modal, message } = App.useApp(); // Sử dụng modal từ App component để đồng bộ style v5
    const activeKey = 'manager-schedule';
    const navigate = useNavigate();

    const [formSingle] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [formRecurring] = Form.useForm();

    const [staffs, setStaffs] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [dorms, setDorms] = useState([]);
    const [scheduleData, setScheduleData] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingDependencies, setLoadingDependencies] = useState(true);

    const [isSingleModalVisible, setIsSingleModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isRecurringModalVisible, setIsRecurringModalVisible] = useState(false);

    const [selectedDate, setSelectedDate] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    const [filterEmployeeId, setFilterEmployeeId] = useState(undefined);
    const [filterDormId, setFilterDormId] = useState(undefined);

    const fetchDependencies = async () => {
        setLoadingDependencies(true);
        try {
            const [staffRes, shiftRes, dormRes] = await Promise.all([
                axiosClient.get('/employees'),
                axiosClient.get('/shifts'),
                axiosClient.get('/dorms'),
            ]);
            setStaffs((staffRes.data || []).filter(s => s.role === 'GUARD' || s.role === 'CLEANER'));
            setShifts((shiftRes.data || []).map(s => ({ ...s, name: `${s.name} (${s.startTime} - ${s.endTime})` })));
            setDorms(dormRes.data || []);
        } catch (error) {
            message.error("Lỗi tải dữ liệu hệ thống");
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
            const list = response.data?.data || response.data || [];
            const mapped = {};
            list.forEach(item => {
                if (!mapped[item.workDate]) mapped[item.workDate] = [];
                mapped[item.workDate].push(item);
            });
            setScheduleData(mapped);
        } catch (error) {
            message.error("Lỗi tải lịch làm việc");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDependencies(); }, []);
    useEffect(() => { fetchSchedule(currentMonth); }, [currentMonth]);

    // --- HÀM XÓA CHÍNH XÁC ---
    const handleDeleteSchedule = () => {
        if (!editingSchedule?.scheduleId) {
            message.warning("Không tìm thấy ID ca làm việc");
            return;
        }

        modal.confirm({
            title: 'Xác nhận xóa ca làm việc',
            icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
            content: `Bạn có chắc chắn muốn xóa ca làm của ${editingSchedule.employeeName} vào ngày ${dayjs(editingSchedule.workDate).format('DD/MM/YYYY')}?`,
            okText: 'Xóa ngay',
            okType: 'danger',
            cancelText: 'Hủy bỏ',
            onOk: async () => {
                try {
                    setLoading(true);
                    // Lưu ý: path /schedules/${id} phải khớp với @DeleteMapping của Backend
                    await axiosClient.delete(`/schedules/${editingSchedule.scheduleId}`);
                    message.success("Đã xóa ca làm việc thành công");
                    setIsEditModalVisible(false);
                    fetchSchedule(currentMonth);
                } catch (error) {
                    message.error(error.response?.data?.message || "Xóa thất bại");
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const onOpenEditModal = (item) => {
        setEditingSchedule(item);
        formEdit.setFieldsValue({
            employeeName: item.employeeName,
            workDate: dayjs(item.workDate).format('DD/MM/YYYY'),
            shiftId: String(item.shiftId),
            dormId: String(item.dormId),
            note: item.note
        });
        setIsEditModalVisible(true);
    };

    const handleUpdateSchedule = async (values) => {
        setLoading(true);
        try {
            await axiosClient.put(`/schedules/${editingSchedule.scheduleId}`, {
                shiftId: values.shiftId,
                dormID: values.dormId,
                note: values.note
            });
            message.success("Cập nhật thành công");
            fetchSchedule(currentMonth);
            setIsEditModalVisible(false);
        } catch (error) {
            message.error("Cập nhật thất bại");
        } finally { setLoading(false); }
    };

    // ... (Các hàm handleCreate giữ nguyên như cũ)

    const cellRender = (value) => {
        const dateKey = value.format('YYYY-MM-DD');
        const list = (scheduleData[dateKey] || []).filter(item =>
            (!filterEmployeeId || String(item.employeeId) === String(filterEmployeeId)) &&
            (!filterDormId || String(item.dormId) === String(filterDormId))
        );

        return (
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {list.slice(0, 3).map(item => (
                    <li key={item.scheduleId} style={{ marginBottom: 2 }}>
                        <Tag
                            color="blue"
                            style={{ width: '100%', cursor: 'pointer', margin: 0 }}
                            onClick={(e) => { e.stopPropagation(); onOpenEditModal(item); }}
                        >
                            <span style={{ fontWeight: 600 }}>{item.shiftName.split('(')[0]}</span> - {item.employeeName}
                        </Tag>
                    </li>
                ))}
                {list.length > 3 && <li style={{ fontSize: 10, color: '#999' }}>+{list.length - 3} ca khác...</li>}
            </ul>
        );
    };

    return (
        <RequireRole role="MANAGER">
            <LayoutManager active={activeKey} header="Quản lý Lịch làm việc">
                <Content style={{ margin: '16px', padding: 24, background: '#fff', borderRadius: 8 }}>
                    <Spin spinning={loadingDependencies}>
                        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                            <Col>
                                <Space>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsRecurringModalVisible(true)}>Tạo Lịch Định Kỳ</Button>
                                    <Button icon={<SettingOutlined />} onClick={() => navigate('/manager/shifts')}>Cấu hình Ca</Button>
                                </Space>
                            </Col>
                            <Col>
                                <Space>
                                    <FilterOutlined style={{ color: '#bfbfbf' }} />
                                    <Select placeholder="Lọc khu vực" style={{ width: 160 }} allowClear onChange={setFilterDormId}>
                                        {dorms.map(d => <Option key={d.id} value={String(d.id)}>{d.dormName}</Option>)}
                                    </Select>
                                    <Select placeholder="Lọc nhân viên" style={{ width: 220 }} allowClear showSearch optionFilterProp="children" onChange={setFilterEmployeeId}>
                                        {staffs.map(s => <Option key={s.employeeId} value={String(s.employeeId)}>{s.username} ({s.role})</Option>)}
                                    </Select>
                                </Space>
                            </Col>
                        </Row>

                        <Calendar
                            cellRender={cellRender}
                            onSelect={(val) => {
                                if(!isRecurringModalVisible && !isEditModalVisible) {
                                    setSelectedDate(val.format('YYYY-MM-DD'));
                                    setIsSingleModalVisible(true);
                                }
                            }}
                            onPanelChange={setCurrentMonth}
                        />
                    </Spin>
                </Content>
            </LayoutManager>

            {/* MODAL SỬA & XÓA */}
            <Modal
                title={<span><ClockCircleOutlined /> Chi tiết ca làm việc</span>}
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={[
                    <Button
                        key="delete"
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteSchedule}
                        style={{ float: 'left' }}
                    >
                        Xóa ca này
                    </Button>,
                    <Button key="cancel" onClick={() => setIsEditModalVisible(false)}>Đóng</Button>,
                    <Button key="save" type="primary" loading={loading} onClick={() => formEdit.submit()}>Cập nhật</Button>
                ]}
            >
                <Form form={formEdit} layout="vertical" onFinish={handleUpdateSchedule}>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="employeeName" label="Nhân viên"><Input disabled prefix={<UserOutlined />} /></Form.Item></Col>
                        <Col span={12}><Form.Item name="workDate" label="Ngày làm việc"><Input disabled /></Form.Item></Col>
                    </Row>
                    <Divider style={{ margin: '12px 0' }} />
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="shiftId" label="Ca làm việc" rules={[{ required: true, message: 'Vui lòng chọn ca' }]}>
                                <Select>{shifts.map(s => <Option key={s.id} value={String(s.id)}>{s.name}</Option>)}</Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dormId" label="Khu vực" rules={[{ required: true, message: 'Vui lòng chọn KTX' }]}>
                                <Select>{dorms.map(d => <Option key={d.id} value={String(d.id)}>{d.dormName}</Option>)}</Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="note" label="Ghi chú quản lý">
                        <Input.TextArea rows={3} placeholder="Nhập ghi chú nếu có..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Các modal Recurring và Single giữ nguyên cấu trúc cũ */}
            {/* ... */}
        </RequireRole>
    );
}