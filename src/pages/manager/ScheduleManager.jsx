// File: src/pages/manager/ScheduleManager.jsx

import React, { useState } from 'react';
import { Layout, Typography, Calendar, Select, Button, Tag, Space, Modal, Form, Input, TimePicker, Row, Col, message } from 'antd';
import { PlusOutlined, SettingOutlined, UserOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { SideBarManager } from '../../components/layout/SideBarManger';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// DỮ LIỆU MOCK CẤU HÌNH (Giữ nguyên)
const mockStaffs = [
    { id: 1, name: 'Nguyễn Văn A', position: 'Bảo vệ' },
    { id: 2, name: 'Trần Thị B', position: 'Lao công' },
    { id: 3, name: 'Lê Văn C', position: 'Bảo vệ' },
];

const mockShifts = [
    { id: 1, name: 'Ca Sáng', time: '6h-14h', appliesTo: ['Bảo vệ', 'Lao công'] },
    { id: 2, name: 'Ca Chiều', time: '14h-22h', appliesTo: ['Bảo vệ', 'Lao công'] },
    { id: 3, name: 'Ca Đêm', time: '22h-6h', appliesTo: ['Bảo vệ'] },
];

const mockDorms = ['Dorm A', 'Dorm B', 'Dorm C', 'Dorm D'];

// DỮ LIỆU MOCK TẦNG THEO DORM
const mockFloorsByDorm = {
    'Dorm A': ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4'],
    'Dorm B': ['Tầng 1', 'Tầng 2', 'Tầng 3'],
    'Dorm C': ['Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng 5'],
    'Dorm D': ['Tầng 1', 'Tầng 2'],
    '': [],
};

// DỮ LIỆU MOCK LỊCH LÀM VIỆC (Giữ nguyên)
const mockSchedule = {
    '2025-10-21': [
        { id: 1, time: 'Ca Sáng (6h-14h)', staff: 'Nguyễn Văn A', position: 'Bảo vệ', areaType: 'Dorm', areaValue: 'Dorm A', type: 'guard' },
        { id: 2, time: 'Ca Chiều (14h-22h)', staff: 'Trần Thị B', position: 'Lao công', areaType: 'Floor', areaValue: 'Dorm A - Tầng 3', type: 'cleaner' },
    ],
    '2025-10-22': [
        { id: 3, time: 'Ca Đêm (22h-6h)', staff: 'Lê Văn C', position: 'Bảo vệ', areaType: 'Dorm', areaValue: 'Dorm B', type: 'guard' },
    ],
};


// RENDER NỘI DUNG TỪNG Ô NGÀY TRONG LỊCH (Giữ nguyên)
function dateCellRender(value) {
    const dateKey = value.format('YYYY-MM-DD');
    const listData = mockSchedule[dateKey] || [];

    return (
        <ul className="events" style={{ listStyle: 'none', padding: 0 }}>
            {listData.map((item) => (
                <li key={item.id} style={{ marginBottom: 4 }}>
                    <Tag
                        color={item.type === 'guard' ? 'blue' : 'green'}
                        style={{ whiteSpace: 'normal', cursor: 'pointer', maxWidth: '100%', overflow: 'hidden' }}
                        title={`${item.staff} (${item.position}) - Khu vực: ${item.areaValue}`}
                    >
                        {item.time} - {item.staff.split(' ')[0]} ({item.areaValue})
                    </Tag>
                </li>
            ))}
        </ul>
    );
}

export function ScheduleManager() {
    const [collapsed] = useState(false);
    const activeKey = 'manager-schedule';

    // State quản lý Modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [form] = Form.useForm();

    // CẬP NHẬT STATE LỌC: Tách Tòa nhà và Tầng ra thành các state riêng
    const [filterPosition, setFilterPosition] = useState(undefined);
    const [filterDorm, setFilterDorm] = useState(undefined); // State cho Tòa nhà
    const [filterFloor, setFilterFloor] = useState(undefined); // State cho Tầng

    const onSelect = (value) => {
        const date = value.format('YYYY-MM-DD');
        setSelectedDate(date);
        setIsModalVisible(true);
        form.resetFields();
    };

    // LOGIC CHO FILTER DORM: Khi Dorm thay đổi, reset Tầng
    const handleDormFilterChange = (value) => {
        setFilterDorm(value);
        setFilterFloor(undefined); // Đảm bảo reset tầng khi tòa nhà thay đổi
    };

    // ... (các hàm xử lý khác như handleSaveShift, handlePositionChange giữ nguyên)
    const handleSaveShift = (values) => {
        let areaValue;
        if (values.position === 'Bảo vệ') {
            areaValue = values.dorm;
        } else if (values.position === 'Lao công') {
            areaValue = `${values.dormForCleaner} - ${values.floor}`;
        }
        console.log('Lưu lịch làm việc:', {
            date: selectedDate,
            ...values,
            areaValue: areaValue
        });
        message.success(`Đã phân ca thành công cho ngày ${selectedDate}`);
        setIsModalVisible(false);
    };

    const handlePositionChange = () => {
        form.setFieldsValue({ dorm: undefined, dormForCleaner: undefined, floor: undefined });
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                        Quản lý Lịch làm việc
                    </Title>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

                    {/* HÀNG HÀNH ĐỘNG VÀ LỌC (PHẦN ĐÃ CẬP NHẬT) */}
                    <Space style={{ marginBottom: 20 }}>
                        {/* 1. LỌC THEO CHỨC VỤ */}
                        <Select
                            placeholder="Lọc theo Chức vụ"
                            style={{ width: 150 }}
                            allowClear
                            onChange={setFilterPosition}
                            value={filterPosition}
                        >
                            <Option value="Bảo vệ">Bảo vệ</Option>
                            <Option value="Lao công">Lao công</Option>
                        </Select>

                        {/* 2. LỌC THEO TÒA NHÀ (DORM) */}
                        <Select
                            placeholder="Lọc theo Tòa nhà"
                            style={{ width: 150 }}
                            allowClear
                            onChange={handleDormFilterChange} // Sử dụng hàm reset tầng
                            value={filterDorm}
                        >
                            {mockDorms.map(dorm => <Option key={dorm} value={dorm}>{dorm}</Option>)}
                        </Select>

                        {/* 3. LỌC THEO TẦNG (PHỤ THUỘC VÀO TÒA NHÀ) */}
                        <Select
                            placeholder="Lọc theo Tầng"
                            style={{ width: 150 }}
                            allowClear
                            disabled={!filterDorm} // Vô hiệu hóa nếu chưa chọn Dorm
                            onChange={setFilterFloor}
                            value={filterFloor}
                        >
                            {(mockFloorsByDorm[filterDorm] || []).map(floor => ( // Lọc options theo Dorm
                                <Option key={floor} value={floor}>{floor}</Option>
                            ))}
                        </Select>

                        <Link to="/manager/shifts">
                            <Button icon={<SettingOutlined />}>Cấu hình Ca làm việc</Button>
                        </Link>

                    </Space>

                    {/* CALENDAR (Giữ nguyên) */}
                    <Calendar
                        dateCellRender={dateCellRender}
                        onSelect={onSelect}
                        style={{ border: '1px solid #f0f0f0', borderRadius: 4 }}
                    />

                </Content>
            </Layout>

            {/* MODAL THÊM CA LÀM VIỆC (Giữ nguyên logic Casading đã làm ở lần trước) */}
            <Modal
                title={`Phân ca cho ngày ${selectedDate || ''}`}
                visible={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsModalVisible(false)}
                okText="Lưu Lịch"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" onFinish={handleSaveShift}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="staffId" label={<><UserOutlined /> Nhân viên</>} rules={[{ required: true, message: 'Chọn nhân viên!' }]}>
                                <Select placeholder="Chọn nhân viên">
                                    {mockStaffs.map(staff => (
                                        <Option key={staff.id} value={staff.id}>
                                            {staff.name} ({staff.position})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="position" label="Chức vụ" rules={[{ required: true, message: 'Chọn chức vụ!' }]}>
                                <Select placeholder="Chọn chức vụ" onChange={handlePositionChange}>
                                    <Option value="Bảo vệ">Bảo vệ</Option>
                                    <Option value="Lao công">Lao công</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="shiftId" label={<><ClockCircleOutlined /> Ca làm việc</>} rules={[{ required: true, message: 'Chọn ca làm việc!' }]}>
                        <Select placeholder="Chọn ca làm việc">
                            {mockShifts.map(shift => (
                                <Option key={shift.id} value={shift.id}>
                                    {shift.name} ({shift.time})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) => prevValues.position !== currentValues.position}
                    >
                        {({ getFieldValue }) => {
                            const position = getFieldValue('position');

                            if (position === 'Bảo vệ') {
                                return (
                                    <Form.Item name="dorm" label={<><EnvironmentOutlined /> Tòa nhà (Dorm)</>} rules={[{ required: true, message: 'Chọn tòa nhà!' }]}>
                                        <Select placeholder="Chọn tòa nhà">
                                            {mockDorms.map(dorm => <Option key={dorm} value={dorm}>{dorm}</Option>)}
                                        </Select>
                                    </Form.Item>
                                );
                            }

                            if (position === 'Lao công') {
                                return (
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="dormForCleaner" label={<><EnvironmentOutlined /> Tòa nhà</>} rules={[{ required: true, message: 'Chọn tòa nhà!' }]}>
                                                <Select
                                                    placeholder="Chọn tòa nhà"
                                                    onChange={() => form.setFieldsValue({ floor: undefined })}
                                                >
                                                    {mockDorms.map(dorm => <Option key={dorm} value={dorm}>{dorm}</Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col span={12}>
                                            <Form.Item
                                                noStyle
                                                shouldUpdate={(prevValues, currentValues) => prevValues.dormForCleaner !== currentValues.dormForCleaner}
                                            >
                                                {({ getFieldValue }) => {
                                                    const selectedDorm = getFieldValue('dormForCleaner');
                                                    const availableFloors = mockFloorsByDorm[selectedDorm] || [];

                                                    return (
                                                        <Form.Item name="floor" label={<><EnvironmentOutlined /> Tầng</>} rules={[{ required: true, message: 'Chọn tầng!' }]}>
                                                            <Select
                                                                placeholder="Chọn tầng"
                                                                disabled={!selectedDorm}
                                                            >
                                                                {availableFloors.map(floor => <Option key={floor} value={floor}>{floor}</Option>)}
                                                            </Select>
                                                        </Form.Item>
                                                    );
                                                }}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                );
                            }

                            return null;
                        }}
                    </Form.Item>

                </Form>
            </Modal>
        </Layout>
    );
}