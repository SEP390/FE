// File: src/pages/manager/ShiftConfigurationPage.jsx

import React, { useState } from 'react';
import { Layout, Typography, Table, Button, Space, Modal, Form, Input, TimePicker, Popconfirm, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { SideBarManager } from '../../components/layout/SideBarManger';
import dayjs from 'dayjs';
// Cần import plugin isSameOrAfter để so sánh thời gian
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// DỮ LIỆU MOCK CA LÀM VIỆC (Đã sửa lại endTime cho Ca Đêm để dayjs hiểu đúng)
const mockShifts = [
    { key: '1', name: 'Ca Sáng', startTime: '06:00', endTime: '14:00', duration: '8 giờ', type: 'Bảo vệ' },
    { key: '2', name: 'Ca Chiều', startTime: '14:00', endTime: '22:00', duration: '8 giờ', type: 'Lao công' },
    // **QUAN TRỌNG: Sửa lại hiển thị cho Ca Đêm**
    { key: '3', name: 'Ca Đêm', startTime: '22:00', endTime: '06:00', duration: '8 giờ', type: 'Bảo vệ' },
];

export function ShiftConfigurationPage() {
    const [collapsed] = useState(false);
    const activeKey = 'manager-schedule';
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [form] = Form.useForm();

    const handleOpenModal = (record = null) => {
        setEditingShift(record);
        setIsModalVisible(true);

        if (record) {
            let start = dayjs(record.startTime, 'HH:mm');
            let end = dayjs(record.endTime, 'HH:mm');

            // **FIX: Logic xử lý Ca Đêm**
            // Nếu thời gian kết thúc nhỏ hơn hoặc bằng thời gian bắt đầu, thêm 1 ngày vào thời gian kết thúc.
            if (end.isSameOrBefore(start)) {
                end = end.add(1, 'day');
            }

            form.setFieldsValue({
                name: record.name,
                type: record.type, // Đảm bảo trường 'type' cũng được set
                timeRange: [start, end]
            });
        } else {
            form.resetFields();
        }
    };

    const handleSaveShift = (values) => {
        // Logic gọi API để lưu ca làm việc
        console.log('Shift Saved:', values);
        setIsModalVisible(false);
    };

    const columns = [
        { title: 'Tên Ca', dataIndex: 'name', key: 'name' },
        // **FIX: Hiển thị đúng cho Ca Đêm**
        {
            title: 'Bắt đầu',
            dataIndex: 'startTime',
            key: 'startTime'
        },
        {
            title: 'Kết thúc',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (text, record) => (
                <span>{text}{record.startTime > text ? ' (Hôm sau)' : ''}</span>
            )
        },
        { title: 'Thời lượng', dataIndex: 'duration', key: 'duration' },
        { title: 'Áp dụng cho', dataIndex: 'type', key: 'type' },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                    <Popconfirm title="Bạn có chắc chắn muốn xóa ca này?" okText="Có" cancelText="Không">
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

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
                        dataSource={mockShifts}
                        pagination={false}
                        bordered
                    />
                </Content>
            </Layout>

            {/* MODAL THÊM/CHỈNH SỬA CA LÀM VIỆC */}
            <Modal
                title={editingShift ? "Chỉnh sửa Ca làm việc" : "Thêm Ca làm việc mới"}
                visible={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsModalVisible(false)}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleSaveShift}>
                    <Form.Item name="name" label="Tên Ca" rules={[{ required: true, message: 'Vui lòng nhập tên ca!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="timeRange" label="Thời gian làm việc" rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}>
                        <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="type" label="Áp dụng cho Chức vụ">
                        <Select placeholder="Chọn chức vụ">
                            <Option value="Bảo vệ">Bảo vệ</Option>
                            <Option value="Lao công">Lao công</Option>
                            <Option value="Tất cả">Tất cả</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
}