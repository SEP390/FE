import React, { useState, useEffect, useMemo } from 'react';
import {
    Layout, Typography, Calendar, Select, Button, Tag, Space, Modal, Form,
    Input, Row, Col, message, Spin, Checkbox
} from 'antd';
import { PlusOutlined, UserOutlined, ClockCircleOutlined, EnvironmentOutlined, FilterOutlined } from "@ant-design/icons";
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';

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

    // Form Instances
    const [formSingle] = Form.useForm();
    const [formRecurring] = Form.useForm();

    // Data States
    const [staffs, setStaffs] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [dorms, setDorms] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [scheduleData, setScheduleData] = useState({});

    // UI/Loading States
    const [loading, setLoading] = useState(false);
    const [loadingDependencies, setLoadingDependencies] = useState(true);
    const [isSingleModalVisible, setIsSingleModalVisible] = useState(false);
    const [isRecurringModalVisible, setIsRecurringModalVisible] = useState(false);

    // Calendar States
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    // === FILTER STATES ===
    const [filterEmployeeId, setFilterEmployeeId] = useState(undefined);
    const [filterSemesterId, setFilterSemesterId] = useState(undefined);

    // --- 1. LẤY DỮ LIỆU HỆ THỐNG ---
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

            // Format tên ca làm việc (Hiển thị trong Dropdown khi chọn)
            const formattedShifts = (shiftRes.data || []).map(s => ({
                ...s,
                id: s.id || s.key,
                name: `${s.name} (${s.startTime} - ${s.endTime})`, // Tên đầy đủ có giờ
                shortName: s.name // Tên ngắn gọn để hiện lên lịch
            }));
            setShifts(formattedShifts);

            setDorms(dormRes.data || []);
            setSemesters(semesterRes.data || []);

        } catch (error) {
            console.error("Lỗi dependencies:", error);
            message.error("Không thể tải dữ liệu hệ thống (Nhân viên, Ca, Khu vực...)");
        } finally {
            setLoadingDependencies(false);
        }
    };

    // --- 2. LẤY LỊCH LÀM VIỆC ---
    const fetchSchedule = async (dateObj) => {
        setLoading(true);

        const from = dateObj.startOf('month').format('YYYY-MM-DD');
        const to = dateObj.endOf('month').format('YYYY-MM-DD');

        try {
            const response = await axiosClient.get(`/schedules`, {
                params: { from, to }
            });

            const listSchedules = response.data?.data || response.data || [];
            const dataByDate = {};

            if (Array.isArray(listSchedules)) {
                listSchedules.forEach(item => {
                    const dateKey = item.workDate;
                    if (dateKey) {
                        if (!dataByDate[dateKey]) {
                            dataByDate[dateKey] = [];
                        }
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

    useEffect(() => {
        fetchDependencies();
    }, []);

    useEffect(() => {
        fetchSchedule(currentMonth);
    }, [currentMonth]);


    // --- 3. RENDER Ô LỊCH (ĐÃ SỬA HIỂN THỊ) ---
    const cellRender = (value) => {
        const dateKey = value.format('YYYY-MM-DD');
        const listData = scheduleData[dateKey] || [];

        // Logic lọc
        const filteredListData = listData.filter(item => {
            const matchEmployee = !filterEmployeeId || item.employeeId === filterEmployeeId;
            const matchSemester = !filterSemesterId || item.semesterId === filterSemesterId;
            return matchEmployee && matchSemester;
        });

        // Hiển thị tối đa 3 dòng
        const MAX_ITEMS = 3;
        const displayList = filteredListData.slice(0, MAX_ITEMS);
        const remaining = filteredListData.length - MAX_ITEMS;

        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {displayList.map((item) => {
                    // Xử lý tên ca: Bỏ phần giờ trong ngoặc (nếu có) để hiển thị gọn hơn
                    // Ví dụ: "Ca Sáng (06:00-10:00)" -> Lấy "Ca Sáng"
                    const simpleShiftName = item.shiftName.split('(')[0].trim();

                    return (
                        <li key={item.scheduleId} style={{ marginBottom: 2 }}>
                            <Tag
                                color="blue"
                                style={{
                                    width: '100%',
                                    margin: 0,
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    padding: '0 4px',
                                    border: 'none',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                                title={`NV: ${item.employeeName}\nCa: ${item.shiftName}\nKhu: ${item.dormName}\nKỳ: ${item.semesterName}`}
                            >
                                {/* === SỬA Ở ĐÂY: Tên Ca - Tên NV === */}
                                <b>{simpleShiftName}</b> - {item.employeeName}
                            </Tag>
                        </li>
                    )
                })}

                {remaining > 0 && (
                    <li style={{ textAlign: 'right', marginTop: 2 }}>
                        <span style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>
                            +{remaining} ca nữa...
                        </span>
                    </li>
                )}
            </ul>
        );
    };

    // --- 4. EVENT HANDLERS ---
    const onSelectDate = (value) => {
        const date = value.format('YYYY-MM-DD');
        setSelectedDate(date);
        setIsSingleModalVisible(true);
    };

    const onPanelChange = (value) => {
        setCurrentMonth(value);
    };

    const handleSaveSchedule = async (values, isRecurring = false) => {
        setLoading(true);
        let payload = {};

        if (isRecurring) {
            const selectedSemester = semesters.find(s => s.id === values.semesterId);
            if (!selectedSemester) {
                message.error("Vui lòng chọn kỳ học hợp lệ.");
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
            const date = dayjs(selectedDate);
            const selectedSemester = semesters.find(s =>
                date.isSameOrAfter(s.startDate) && date.isSameOrBefore(s.endDate)
            );
            if (!selectedSemester) {
                message.error(`Ngày ${selectedDate} không thuộc kỳ học nào.`);
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
            message.success('Tạo lịch thành công!');
            fetchSchedule(currentMonth);
            if (isRecurring) setIsRecurringModalVisible(false);
            else setIsSingleModalVisible(false);
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

                        {/* TOOLBAR */}
                        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                            <Col>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setIsRecurringModalVisible(true)}
                                >
                                    Tạo lịch định kỳ
                                </Button>
                            </Col>

                            <Col>
                                <Space>
                                    <FilterOutlined style={{ color: '#888' }} />

                                    <Select
                                        placeholder="Lọc theo kỳ học"
                                        style={{ width: 200 }}
                                        allowClear
                                        showSearch
                                        optionFilterProp="children"
                                        value={filterSemesterId}
                                        onChange={setFilterSemesterId}
                                    >
                                        {semesters.map(s => (
                                            <Option key={s.id} value={s.id}>{s.name}</Option>
                                        ))}
                                    </Select>

                                    <Select
                                        placeholder="Lọc theo nhân viên"
                                        style={{ width: 220 }}
                                        allowClear
                                        showSearch
                                        optionFilterProp="children"
                                        value={filterEmployeeId}
                                        onChange={setFilterEmployeeId}
                                    >
                                        {staffs.map(s => (
                                            <Option key={s.employeeId} value={s.employeeId}>
                                                {s.username} <Tag style={{marginLeft:5, fontSize: 10}}>{s.role}</Tag>
                                            </Option>
                                        ))}
                                    </Select>
                                </Space>
                            </Col>
                        </Row>

                        {/* CALENDAR */}
                        <Calendar
                            cellRender={cellRender}
                            onSelect={onSelectDate}
                            onPanelChange={onPanelChange}
                            headerRender={({ value, type, onChange, onTypeChange }) => {
                                return (
                                    <div style={{ padding: '10px 0', textAlign: 'right' }}>
                                        <Space>
                                            <Select
                                                value={value.year()}
                                                onChange={(newYear) => {
                                                    const now = value.clone().year(newYear);
                                                    onChange(now);
                                                }}
                                            >
                                                {[...Array(10)].map((_, i) => (
                                                    <Option key={i} value={dayjs().year() - 5 + i}>
                                                        {dayjs().year() - 5 + i}
                                                    </Option>
                                                ))}
                                            </Select>
                                            <Select
                                                value={value.month()}
                                                onChange={(newMonth) => {
                                                    const now = value.clone().month(newMonth);
                                                    onChange(now);
                                                }}
                                            >
                                                {[...Array(12)].map((_, i) => (
                                                    <Option key={i} value={i}>Tháng {i + 1}</Option>
                                                ))}
                                            </Select>
                                        </Space>
                                    </div>
                                );
                            }}
                        />
                    </Spin>
                </Content>
            </Layout>

            {/* MODAL 1 */}
            <Modal
                title={`Phân ca cho ngày: ${selectedDate}`}
                open={isSingleModalVisible}
                onOk={() => formSingle.submit()}
                onCancel={() => setIsSingleModalVisible(false)}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose={true}
                confirmLoading={loading}
            >
                <Form form={formSingle} layout="vertical" onFinish={(values) => handleSaveSchedule(values, false)}>
                    <CommonScheduleForm staffs={staffs} shifts={shifts} dorms={dorms} />
                </Form>
            </Modal>

            {/* MODAL 2 */}
            <Modal
                title="Tạo lịch định kỳ"
                open={isRecurringModalVisible}
                onOk={() => formRecurring.submit()}
                onCancel={() => setIsRecurringModalVisible(false)}
                okText="Lưu toàn bộ"
                cancelText="Hủy"
                width={650}
                destroyOnClose={true}
                confirmLoading={loading}
            >
                <Form form={formRecurring} layout="vertical" onFinish={(values) => handleSaveSchedule(values, true)}>
                    <CommonScheduleForm staffs={staffs} shifts={shifts} dorms={dorms} isRecurring={true} />

                    <Row gutter={16} style={{ marginTop: 10, borderTop: '1px dashed #d9d9d9', paddingTop: 10 }}>
                        <Col span={24}>
                            <Form.Item
                                name="semesterId"
                                label="Áp dụng cho kỳ học"
                                rules={[{ required: true, message: 'Vui lòng chọn kỳ học!' }]}
                            >
                                <Select placeholder="Chọn kỳ học">
                                    {semesters.map(s => (
                                        <Option key={s.id} value={s.id}>
                                            {s.name} ({dayjs(s.startDate).format('DD/MM')} - {dayjs(s.endDate).format('DD/MM/YYYY')})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="repeatDays"
                                label="Lặp lại vào các thứ"
                                rules={[{ required: true, message: 'Chọn ít nhất 1 ngày' }]}
                            >
                                <CheckboxGroup
                                    options={[
                                        { label: 'Thứ 2', value: 'MONDAY' },
                                        { label: 'Thứ 3', value: 'TUESDAY' },
                                        { label: 'Thứ 4', value: 'WEDNESDAY' },
                                        { label: 'Thứ 5', value: 'THURSDAY' },
                                        { label: 'Thứ 6', value: 'FRIDAY' },
                                        { label: 'Thứ 7', value: 'SATURDAY' },
                                        { label: 'CN', value: 'SUNDAY' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
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
                        <Select
                            placeholder="Tất cả"
                            onChange={setRoleFilter}
                            allowClear
                        >
                            <Option value="GUARD">Bảo vệ</Option>
                            <Option value="CLEANER">Lao công</Option>
                            <Option value="TECHNICAL">Kỹ thuật</Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="employeeId"
                        label={<><UserOutlined /> Nhân viên</>}
                        rules={[{ required: true, message: 'Chọn nhân viên' }]}
                    >
                        <Select placeholder="Chọn nhân viên" showSearch optionFilterProp="children">
                            {filteredStaffs.map(s => (
                                <Option key={s.employeeId} value={s.employeeId}>
                                    {s.username} <Tag style={{ fontSize: 10 }}>{s.role}</Tag>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="shiftId"
                        label={<><ClockCircleOutlined /> Ca làm việc</>}
                        rules={[{ required: true, message: 'Chọn ca' }]}
                    >
                        <Select placeholder="Chọn ca">
                            {shifts.map(s => (
                                <Option key={s.id} value={s.id}>{s.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="dormId"
                        label={<><EnvironmentOutlined /> Khu vực (KTX)</>}
                        rules={[{ required: true, message: 'Chọn KTX' }]}
                    >
                        <Select placeholder="Chọn khu vực">
                            {dorms.map(d => (
                                <Option key={d.id} value={d.id}>{d.dormName}</Option>
                            ))}
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