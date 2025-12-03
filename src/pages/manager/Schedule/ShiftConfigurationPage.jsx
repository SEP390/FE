import React, { useState, useEffect } from 'react';
import {Layout, Typography, Table, Button, Space, Modal, Form, Input, TimePicker, App} from 'antd';
// 1. Import thêm ArrowLeftOutlined
import { PlusOutlined, EditOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';
import dayjs from 'dayjs';

// 2. Import useNavigate
import { useNavigate } from 'react-router-dom';
import { useCollapsed } from '../../../hooks/useCollapsed.js';

// Import các plugin
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import axiosClient from '../../../api/axiosClient/axiosClient.js';
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";

const { Header, Content } = Layout;
const { Title } = Typography;

export function ShiftConfigurationPage() {
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);
    const activeKey = 'manager-schedule';
    const {message}=App.useApp();

    // 3. Khởi tạo navigate
    const navigate = useNavigate();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [form] = Form.useForm();

    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // --- LOAD DATA ---
    const fetchShifts = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/shifts');

            if (response && response.data) {
                const formattedData = response.data.map(shift => {
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
                message.error("Không thể tải danh sách ca.");
            }
            setShifts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    // --- HANDLERS ---
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

    const handleSaveShift = async (values) => {
        setSubmitting(true);
        const [startTime, endTime] = values.timeRange;
        const formatString = "HH:mm:ss";

        const payload = {
            name: values.name,
            startTime: startTime.format(formatString),
            endTime: endTime.format(formatString),
        };

        try {
            if (editingShift) {
                await axiosClient.put(`/shifts/${editingShift.key}`, payload);
                message.success('Cập nhật ca làm việc thành công!');
            } else {
                await axiosClient.post('/shifts', payload);
                message.success('Thêm ca làm việc mới thành công!');
            }

            setIsModalVisible(false);
            fetchShifts();

        } catch (error) {
            console.error("Lỗi khi lưu ca:", error);
            message.error(`Lưu ca thất bại! ` + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

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

    return (
        <RequireRole role = "MANAGER">
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />
            <Layout
                style={{
                    marginTop: 64,
                    marginLeft: collapsed ? 80 : 260,
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 64 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '64px' }}>
                        Cấu hình Ca làm việc
                    </Title>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

                    {/* --- THANH CÔNG CỤ (CÓ NÚT BACK) --- */}
                    <Space style={{ marginBottom: 20 }}>
                        {/* Nút Quay Lại */}
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(-1)} // Quay lại trang trước đó
                        >
                            Quay lại
                        </Button>

                        {/* Nút Thêm Mới */}
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpenModal()}
                        >
                            Thêm Ca làm việc mới
                        </Button>
                    </Space>

                    <Table
                        columns={columns}
                        dataSource={shifts}
                        loading={loading}
                        pagination={false}
                        bordered
                    />
                </Content>
            </Layout>

            {/* MODAL */}
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
</RequireRole>
    );
}