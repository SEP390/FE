import React, { useState, useEffect } from 'react';
import { Typography, Table, Button, Space, Modal, Form, Input, TimePicker, App, Row, Col, Alert } from 'antd';
import { PlusOutlined, EditOutlined, ArrowLeftOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { LayoutManager } from '../../../components/layout/LayoutManager.jsx';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import { RequireRole } from "../../../components/authorize/RequireRole.jsx";

const { Text } = Typography;

export function ShiftConfigurationPage() {
    // ... (Các phần state và fetch data giữ nguyên như cũ)
    const activeKey = 'manager-schedule';
    const { message } = App.useApp();
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [form] = Form.useForm();
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchShifts = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/shifts');
            if (response && response.data) {
                const actualData = response.data.data || response.data;
                const formattedData = actualData.map(shift => ({
                    ...shift,
                    key: shift.id || shift.shiftId,
                    startTime: shift.startTime.substring(0, 5),
                    endTime: shift.endTime.substring(0, 5),
                }));
                setShifts(formattedData);
            }
        } catch (error) {
            message.error("Không thể tải danh sách ca.");
            setShifts([]);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchShifts(); }, []);

    const handleOpenModal = (record = null) => {
        setEditingShift(record);
        setIsModalVisible(true);
        if (record) {
            form.setFieldsValue({
                name: record.name,
                startTime: dayjs(record.startTime, 'HH:mm'),
                endTime: dayjs(record.endTime, 'HH:mm')
            });
        } else { form.resetFields(); }
    };

    const handleSaveShift = async (values) => {
        setSubmitting(true);
        const { name, startTime, endTime } = values;
        const formatString = "HH:mm:ss";
        const payload = {
            name: name,
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
            message.error(error.response?.data?.message || "Ca làm việc đã được phân công!");
        } finally { setSubmitting(false); }
    };

    const columns = [
        { title: 'Tên Ca', dataIndex: 'name', key: 'name' },
        { title: 'Bắt đầu', dataIndex: 'startTime', key: 'startTime' },
        { title: 'Kết thúc', dataIndex: 'endTime', key: 'endTime',
            render: (text, record) => (
                <span>{text}{record.startTime > text ? ' (Hôm sau)' : ''}</span>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />,
        },
    ];

    return (
        <RequireRole role="MANAGER">
            <LayoutManager active={activeKey} header={"Cấu hình Ca làm việc"}>
                <div style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                    <Space style={{ marginBottom: 20 }}>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Thêm Ca mới</Button>
                    </Space>

                    <Table columns={columns} dataSource={shifts} loading={loading} pagination={false} bordered />

                    <Modal
                        title={editingShift ? "Chỉnh sửa Ca làm việc" : "Thêm Ca làm việc mới"}
                        open={isModalVisible}
                        onOk={() => form.submit()}
                        onCancel={() => setIsModalVisible(false)}
                        confirmLoading={submitting}
                        okText="Lưu"
                        cancelText="Hủy"
                        destroyOnClose
                        width={450} // Cho Modal nhỏ lại cho cân đối
                    >
                        <Form form={form} layout="vertical" onFinish={handleSaveShift} style={{ marginTop: 8 }}>
                            {/* Giao diện Note thu nhỏ, tinh tế hơn */}
                            {editingShift && (
                                <div style={{ marginBottom: 20 }}>
                                    <Alert
                                        message={
                                            <span style={{ fontSize: '13px' }}>
                                                Ca làm việc đã được phân công lịch làm việc thì <b>không được phép</b> thay đổi thời gian.
                                            </span>
                                        }
                                        type="warning"
                                        showIcon
                                        style={{ borderRadius: '6px', padding: '8px 12px' }}
                                    />
                                </div>
                            )}

                            <Form.Item name="name" label="Tên Ca" rules={[{ required: true, message: 'Vui lòng nhập tên ca!' }]}>
                                <Input placeholder="Ví dụ: Ca sáng" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="startTime" label="Giờ bắt đầu" rules={[{ required: true }]}>
                                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="endTime" label="Giờ kết thúc" rules={[{ required: true }]}>
                                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Modal>
                </div>
            </LayoutManager>
        </RequireRole>
    );
}