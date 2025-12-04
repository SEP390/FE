import React, { useState, useEffect, useMemo } from 'react';
import {
    Layout, Typography, Calendar, Select, Button, Tag, Space, Modal, Form,
    Input, Row, Col, Spin, DatePicker, Checkbox, App, // <<< Thêm DatePicker và Checkbox
} from 'antd';
import { PlusOutlined, UserOutlined, ClockCircleOutlined, EnvironmentOutlined, FilterOutlined, SettingOutlined } from "@ant-design/icons";
import { LayoutManager } from '../../../components/layout/LayoutManager.jsx';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

// AppHeader not used directly, LayoutManager will provide header
// import { AppHeader } from '../../../components/layout/AppHeader.jsx';
// Thêm import hook quản lý state global (Giả định hook này có tồn tại)
import { useCollapsed } from '../../../hooks/useCollapsed.js';

// --- CẤU HÌNH DAYJS ---
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Content } = Layout;
const { Option } = Select;

// --- COMPONENT CHÍNH ---
export function ScheduleManager() {
    // === SỬ DỤNG HOOK GLOBAL CHO COLLAPSED (THAY THẾ useState) ===
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);

    const {message}=App.useApp();
    const activeKey = 'manager-schedule';

    const navigate = useNavigate();

    // Form Instances
    const [formSingle] = Form.useForm();
    const [formEdit] = Form.useForm();
    // THÊM: Form cho tạo định kỳ
    const [formRecurring] = Form.useForm();

    // Data States
    const [staffs, setStaffs] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [dorms, setDorms] = useState([]);
    const [scheduleData, setScheduleData] = useState({});

    // UI/Loading States
    const [loading, setLoading] = useState(false);
    const [loadingDependencies, setLoadingDependencies] = useState(true);

    // Modal Visibility
    const [isSingleModalVisible, setIsSingleModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    // THÊM: State cho modal tạo định kỳ
    const [isRecurringModalVisible, setIsRecurringModalVisible] = useState(false);

    // Selected Data
    const [selectedDate, setSelectedDate] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    // === FILTER STATES (BỘ LỌC) ===
    const [filterEmployeeId, setFilterEmployeeId] = useState(undefined);
    const [filterDormId, setFilterDormId] = useState(undefined);

    // selectedDateSemester not currently used

    // === LOGIC TOGGLE SIDEBAR ===
    const toggleSideBar = () => { setCollapsed(!collapsed); }
    // === KẾT THÚC LOGIC TOGGLE ===


    // --- 1. FETCH DATA (ĐÃ BỎ SEMESTERS) ---
    const fetchDependencies = async () => {
        setLoadingDependencies(true);
        try {
            const [staffRes, shiftRes, dormRes] = await Promise.all([
                axiosClient.get('/employees'),
                axiosClient.get('/shifts'),
                axiosClient.get('/dorms'),
            ]);

            // Lọc nhân viên chỉ lấy Bảo vệ (GUARD) và Lao công (CLEANER) ngay khi tải
            const filteredStaffs = (staffRes.data || []).filter(s =>
                s.role === 'GUARD' || s.role === 'CLEANER'
            );
            setStaffs(filteredStaffs);

            const formattedShifts = (shiftRes.data || []).map(s => ({
                ...s,
                id: s.id || s.key,
                name: `${s.name} (${s.startTime} - ${s.endTime})`,
                shortName: s.name
            }));
            setShifts(formattedShifts);
            setDorms(dormRes.data || []);

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
            shiftId: String(scheduleItem.shiftId),
            dormId: String(scheduleItem.dormId),
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

    // --- TẠO LỊCH NGÀY LẺ (SINGLE DATE) ---
    const handleCreateSchedule = async (values) => {
        setLoading(true);

        const payload = {
            employeeId: values.employeeId,
            shiftId: values.shiftId,
            dormId: values.dormId,
            singleDate: selectedDate,
            note: values.note,
        };

        try {
            await axiosClient.post('/schedules', payload);
            message.success('Tạo lịch thành công!');
            fetchSchedule(currentMonth);
            setIsSingleModalVisible(false);
            formSingle.resetFields();
        } catch (error) {
            message.error(`Lỗi: ` + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLER TẠO LỊCH ĐỊNH KỲ (RECURRING SCHEDULE) ---
    const handleCreateRecurringSchedule = async (values) => {
        setLoading(true);

        // Lấy giá trị từ trường from và to riêng biệt
        const from = values.from;
        const to = values.to;

        const repeatDays = values.repeatDays;

        // Kiểm tra tính hợp lệ của ngày (from phải trước hoặc bằng to)
        if (from.isAfter(to)) {
            message.error('Ngày bắt đầu không thể sau ngày kết thúc.');
            setLoading(false);
            return;
        }

        const payload = {
            employeeId: values.employeeId,
            shiftId: values.shiftId,
            dormId: values.dormId,
            from: from.format('YYYY-MM-DD'),
            to: to.format('YYYY-MM-DD'),
            repeatDays: repeatDays, // Mảng các chuỗi ngày (MONDAY, TUESDAY,...)
            note: values.note,
        };

        try {
            await axiosClient.post('/schedules', payload);
            message.success('Tạo lịch định kỳ thành công!');
            fetchSchedule(currentMonth);
            setIsRecurringModalVisible(false);
            formRecurring.resetFields();
        } catch (error) {
            message.error(`Lỗi: ` + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };
    // --------------------------------------------------------


    // --- 3. RENDER Ô LỊCH ---
    const cellRender = (value) => {
        const dateKey = value.format('YYYY-MM-DD');
        const listData = scheduleData[dateKey] || [];

        const filteredListData = listData.filter(item => {
            const matchEmployee = !filterEmployeeId || String(item.employeeId) === String(filterEmployeeId);
            const matchDorm = !filterDormId || String(item.dormId) === String(filterDormId);
            return matchEmployee && matchDorm;
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

    const onSelectDate = async (value) => {
        // Chỉ mở modal ngày lẻ nếu modal định kỳ không mở
        if (!isRecurringModalVisible) {
            const date = value.format('YYYY-MM-DD');
            setSelectedDate(date);
            formSingle.resetFields();
            setIsSingleModalVisible(true);
        }
    };
    const onPanelChange = (value) => setCurrentMonth(value);

    // --- GIAO DIỆN ---
    return (
        <RequireRole role = "MANAGER">
            <LayoutManager active={activeKey} header={"Quản lý Lịch làm việc"}>
                <Content style={{ margin: '16px', padding: 24, background: '#fff' }}>
                    <Spin spinning={loadingDependencies}>

                        {/* --- THANH CÔNG CỤ (TOOLBAR) --- */}
                        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                            <Col>
                                <Space>
                                    {/* NÚT TẠO LỊCH ĐỊNH KỲ */}
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => {
                                            formRecurring.resetFields();
                                            setIsRecurringModalVisible(true);
                                        }}
                                    >
                                        Tạo Lịch Định Kỳ
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

                                    {/* BỘ LỌC TÒA NHÀ */}
                                    <Select
                                        placeholder="Lọc khu vực"
                                        style={{ width: 160 }}
                                        allowClear
                                        onChange={setFilterDormId}
                                    >
                                        {dorms.map(d => <Option key={String(d.id)} value={String(d.id)}>{d.dormName}</Option>)}
                                    </Select>

                                    {/* BỘ LỌC NHÂN VIÊN */}
                                    <Select placeholder="Lọc nhân viên" style={{ width: 200 }} allowClear showSearch optionFilterProp="children" onChange={setFilterEmployeeId}>
                                        {/* Chỉ hiển thị nhân viên đã được lọc (GUARD, CLEANER) */}
                                        {staffs.map(s => <Option key={String(s.employeeId)} value={String(s.employeeId)}>{s.username} <Tag style={{marginLeft:5, fontSize:10}}>{s.role}</Tag></Option>)}
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
             </LayoutManager>

            {/* --- MODAL 1: TẠO MỚI NGÀY LẺ (SINGLE DATE) --- */}
            <Modal
                title={`Phân ca cho ngày: ${selectedDate}`}
                open={isSingleModalVisible}
                onOk={() => formSingle.submit()}
                onCancel={() => setIsSingleModalVisible(false)}
                okText="Lưu" cancelText="Hủy" destroyOnClose confirmLoading={loading}
            >
                <Form form={formSingle} layout="vertical" onFinish={handleCreateSchedule}>
                    {/* CommonScheduleForm có logic chọn nhân viên, ca, khu vực */}
                    <CommonScheduleForm staffs={staffs} shifts={shifts} dorms={dorms} form={formSingle} />
                    <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={2} placeholder="..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* --- MODAL 3: SỬA LỊCH (GIỮ NGUYÊN) --- */}
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
                                    {shifts.map(s => <Option key={String(s.id)} value={String(s.id)}>{s.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dormId" label="Khu vực (KTX)" rules={[{ required: true, message: 'Chọn KTX' }]}>
                                <Select placeholder="Chọn khu vực">
                                    {dorms.map(d => <Option key={String(d.id)} value={String(d.id)}>{d.dormName}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* --- MODAL 4: TẠO LỊCH ĐỊNH KỲ (RECURRING) --- */}
            <Modal
                title="Tạo Lịch Làm Việc"
                open={isRecurringModalVisible}
                onOk={() => formRecurring.submit()}
                onCancel={() => setIsRecurringModalVisible(false)}
                okText="Tạo Lịch" cancelText="Hủy" destroyOnClose confirmLoading={loading}
                width={700}
            >
                <Form form={formRecurring} layout="vertical" onFinish={handleCreateRecurringSchedule}>
                    {/* Sử dụng lại CommonScheduleForm cho nhân viên, ca, khu vực */}
                    <CommonScheduleForm staffs={staffs} shifts={shifts} dorms={dorms} form={formRecurring} />

                    {/* PHẦN 1: KHOẢNG NGÀY ÁP DỤNG (ĐÃ TÁCH) */}
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="from"
                                label="Từ Ngày Áp Dụng"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày bắt đầu"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="to"
                                label="Đến Ngày Áp Dụng"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày kết thúc"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* PHẦN 2: NGÀY LẶP LẠI TRONG TUẦN (DÙNG CHECKBOX GROUP) */}
                    <Form.Item
                        name="repeatDays"
                        label="Ngày Lặp Lại Trong Tuần"
                        rules={[{ required: true, message: 'Chọn ít nhất 1 ngày lặp' }]}
                    >
                        <Checkbox.Group style={{ width: '100%' }}>
                            <Row gutter={[8, 8]}>
                                <Col>
                                    <Checkbox value="MONDAY"><Tag color="blue">Thứ Hai</Tag></Checkbox>
                                </Col>
                                <Col>
                                    <Checkbox value="TUESDAY"><Tag color="blue">Thứ Ba</Tag></Checkbox>
                                </Col>
                                <Col>
                                    <Checkbox value="WEDNESDAY"><Tag color="blue">Thứ Tư</Tag></Checkbox>
                                </Col>
                                <Col>
                                    <Checkbox value="THURSDAY"><Tag color="blue">Thứ Năm</Tag></Checkbox>
                                </Col>
                                <Col>
                                    <Checkbox value="FRIDAY"><Tag color="blue">Thứ Sáu</Tag></Checkbox>
                                </Col>
                                <Col>
                                    <Checkbox value="SATURDAY"><Tag color="green">Thứ Bảy</Tag></Checkbox>
                                </Col>
                                <Col>
                                    <Checkbox value="SUNDAY"><Tag color="red">Chủ Nhật</Tag></Checkbox>
                                </Col>
                            </Row>
                        </Checkbox.Group>
                    </Form.Item>

                    <Form.Item name="note" label="Ghi chú">
                        <Input.TextArea rows={2} placeholder="..." />
                    </Form.Item>
                </Form>
            </Modal>
        </RequireRole>
    );
}

// --- FORM CON (CHỈ CÓ BẢO VỆ VÀ LAO CÔNG) ---
const CommonScheduleForm = ({ staffs, shifts, dorms, form }) => {
    // Sử dụng state riêng để theo dõi chức vụ được chọn
    const [selectedRole, setSelectedRole] = useState(null);

    // Lọc danh sách nhân viên theo chức vụ
    const filteredStaffs = useMemo(() => {
        if (!selectedRole) return [];

        return staffs.filter(s => String(s.role) === String(selectedRole));
    }, [selectedRole, staffs]);

    // Xử lý khi chức vụ thay đổi
    const handleRoleChange = (value) => {
        setSelectedRole(value);

        // BẮT BUỘC: Xóa giá trị nhân viên cũ khi chức vụ thay đổi
        if (form) {
            form.setFieldsValue({ employeeId: undefined });
        }
    };

    return (
        <RequireRole role = "MANAGER">
            <>
                <Row gutter={16}>
                    <Col span={12}>
                        {/* TRƯỜNG LỌC CHỨC VỤ (CHỈ CÓ GUARD VÀ CLEANER) */}
                        <Form.Item
                            name="roleFilterTemp"
                            label="Lọc chức vụ"
                            rules={[{ required: true, message: 'Vui lòng chọn chức vụ' }]}
                        >
                            <Select
                                placeholder="Chọn chức vụ"
                                onChange={handleRoleChange}
                                allowClear={false}
                            >
                                <Option value="GUARD">Bảo vệ</Option>
                                <Option value="CLEANER">Lao công</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        {/* TRƯỜNG CHỌN NHÂN VIÊN (Phụ thuộc vào chức vụ) */}
                        <Form.Item name="employeeId" label={<><UserOutlined /> Nhân viên</>} rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}>
                            <Select
                                placeholder={selectedRole ? "Chọn nhân viên" : "Vui lòng chọn chức vụ trước"}
                                showSearch
                                optionFilterProp="children"
                                // DISABLE nếu chưa chọn chức vụ hoặc không có nhân viên nào phù hợp
                                disabled={!selectedRole || filteredStaffs.length === 0}
                            >
                                {/* Dùng danh sách đã lọc: filteredStaffs */}
                                {filteredStaffs.map(s =>
                                    <Option key={String(s.employeeId)} value={String(s.employeeId)}>
                                        {s.username} <Tag style={{marginLeft:5, fontSize:10}}>{s.role}</Tag>
                                    </Option>
                                )}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="shiftId" label={<><ClockCircleOutlined /> Ca làm việc</>} rules={[{ required: true, message: 'Vui lòng chọn ca' }]}>
                            <Select placeholder="Chọn ca">
                                {shifts.map(s => <Option key={String(s.id)} value={String(s.id)}>{s.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="dormId" label={<><EnvironmentOutlined /> Khu vực (KTX)</>} rules={[{ required: true, message: 'Vui lòng chọn KTX' }]}>
                            <Select placeholder="Chọn khu vực">
                                {dorms.map(d => <Option key={String(d.id)} value={String(d.id)}>{d.dormName}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                {/* Đã loại bỏ ghi chú khỏi form con */}
            </>
        </RequireRole>
    );
};