// File: src/pages/manager/ShiftConfigurationPage.jsx

import React, { useState, useEffect } from 'react';
import { Layout, Typography, Table, Button, Space, Modal, Form, Input, TimePicker, message } from 'antd'; // <- Đã xóa Popconfirm
import { PlusOutlined, EditOutlined } from "@ant-design/icons"; // <- Đã xóa DeleteOutlined
import { SideBarManager } from '../../components/layout/SideBarManger';
import dayjs from 'dayjs';

// Import các plugin
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import axiosClient from '../../api/axiosClient/axiosClient';

const { Header, Content } = Layout;
const { Title } = Typography;

export function ShiftConfigurationPage() {
    const [collapsed] = useState(false);
    const activeKey = 'manager-schedule';
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [form] = Form.useForm();

    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // (Hàm fetchShifts - Giữ nguyên, đã đúng)
    const fetchShifts = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/shifts');

            if (response && response.data) {
                const formattedData = response.data.map(shift => {
                    // Backend (GetAllShiftResponse) trả về LocalTime (ví dụ: "09:00:00")
                    const validStartTime = dayjs(`2000-01-01T${shift.startTime}`);
                    const validEndTime = dayjs(`2000-01-01T${shift.endTime}`);

                    return {
                        ...shift,
                        key: shift.id,
                        startTime: validStartTime.format('HH:mm'),
                        endTime: validEndTime.format('HH:mm'),
                    };
                });
                setShifts(formattedData);
            } else {
                setShifts([]);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng F5 và đăng nhập lại!');
            } else {
                message.error("Không thể tải danh sách ca. Vui lòng thêm API GET /api/shifts.");
            }
            setShifts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    // (Hàm handleOpenModal - Giữ nguyên, đã đúng)
    const handleOpenModal = (record = null) => {
        setEditingShift(record);
        setIsModalVisible(true);
        if (record) {
            let start = dayjs(record.startTime, 'HH:mm');
            let end = dayjs(record.endTime, 'HH:mm');

            if (end.isSameOrBefore(start)) {
                end = end.add(1, 'day');
            }
            form.setFieldsValue({
                name: record.name,
                timeRange: [start, end]
            });
        } else {
            form.resetFields();
        }
    };

    // === SỬA HÀM NÀY ĐỂ GỬI ĐÚNG PAYLOAD (LOCAL TIME) ===
    const handleSaveShift = async (values) => {
        setSubmitting(true);
        const [startTime, endTime] = values.timeRange;

        // Backend DTO (Create/Update) chỉ nhận LocalTime.
        // Format về "HH:mm:ss" để Spring Boot hiểu.
        const formatString = "HH:mm:ss";

        const payload = {
            name: values.name,
            startTime: startTime.format(formatString), // Ví dụ: "09:00:00"
            endTime: endTime.format(formatString),     // Ví dụ: "17:00:00"
        };

        // Ghi chú: Nếu ca qua đêm (VD: 22:00 - 06:00),
        // logic kiểm tra và xử lý phải nằm ở backend (ShiftService).

        try {
            if (editingShift) {
                // (Cần API PUT /shifts/{id} ở backend)
                await axiosClient.put(`/shifts/${editingShift.key}`, payload);
                message.success('Cập nhật ca làm việc thành công!');
            } else {
                // (API POST /shifts)
                await axiosClient.post('/shifts', payload);
                message.success('Thêm ca làm việc mới thành công!');
            }

            setIsModalVisible(false);
            fetchShifts(); // Tải lại danh sách

        } catch (error) {
            console.error("Lỗi khi lưu ca:", error);
            if (error.response?.status === 401) {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng F5 và đăng nhập lại!');
            } else {
                message.error(`Lưu ca thất bại! ` + (error.response?.data?.message || error.message));
            }
        } finally {
            setSubmitting(false);
        }
    };
    // === KẾT THÚC SỬA ===


    // (Hàm handleDelete đã bị xóa vì không dùng)

    // === SỬA COLUMNS (XÓA NÚT DELETE) ===
    const columns = [
        { title: 'Tên Ca', dataIndex: 'name', key: 'name' },
        { title: 'Bắt đầu', dataIndex: 'startTime', key: 'startTime' },
        { title: 'Kết thúc', dataIndex: 'endTime', key: 'endTime',
            render: (text, record) => ( <span>{text}{record.startTime > text ? ' (Hôm sau)' : ''}</span> )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
                <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
            ),
        },
    ];
    // === KẾT THÚC SỬA COLUMNS ===

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                        Cấu hình Ca làm việc
                    </Title>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenModal()}
                        style={{ marginBottom: 20 }}
                    >
                        Thêm Ca làm việc mới
                    </Button>

                    <Table
                        columns={columns}
                        dataSource={shifts}
                        loading={loading}
                        pagination={false}
                        bordered
                    />
                </Content>
            </Layout>

            {/* MODAL (Không thay đổi) */}
            <Modal
                title={editingShift ? "Chỉnh sửa Ca làm việc" : "Thêm Ca làm việc mới"}
                open={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={submitting}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSaveShift}>
                    <Form.Item name="name" label="Tên Ca" rules={[{ required: true, message: 'Vui lòng nhập tên ca!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="timeRange" label="Thời gian làm việc" rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}>
                        <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
}