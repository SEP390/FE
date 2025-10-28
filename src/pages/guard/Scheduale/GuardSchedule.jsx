import { Layout, Typography, Calendar, Card, Tag, Space, Row, Col } from "antd";
import { ScheduleOutlined, ClockCircleOutlined, UserOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { GuardSidebar } from "../../../components/layout/GuardSidebar.jsx";
import { AppHeader } from "../../../components/layout/AppHeader.jsx";
import { useState } from "react";
import dayjs from "dayjs";

const { Content, Header } = Layout;
const { Title, Text } = Typography;

// Dữ liệu fix cứng cho lịch làm việc
const mockScheduleData = {
    '2025-01-20': [
        { 
            id: 1, 
            shiftName: 'Ca Sáng', 
            time: '06:00 - 14:00', 
            dorm: 'Dorm A', 
            guard: 'Nguyễn Văn A',
            status: 'completed'
        },
    ],
    '2025-01-21': [
        { 
            id: 2, 
            shiftName: 'Ca Chiều', 
            time: '14:00 - 22:00', 
            dorm: 'Dorm A', 
            guard: 'Nguyễn Văn A',
            status: 'upcoming'
        },
    ],
    '2025-01-22': [
        { 
            id: 3, 
            shiftName: 'Ca Đêm', 
            time: '22:00 - 06:00', 
            dorm: 'Dorm B', 
            guard: 'Nguyễn Văn A',
            status: 'upcoming'
        },
    ],
    '2025-01-23': [
        { 
            id: 4, 
            shiftName: 'Ca Sáng', 
            time: '06:00 - 14:00', 
            dorm: 'Dorm A', 
            guard: 'Nguyễn Văn A',
            status: 'upcoming'
        },
    ],
    '2025-01-24': [
        { 
            id: 5, 
            shiftName: 'Ca Chiều', 
            time: '14:00 - 22:00', 
            dorm: 'Dorm A', 
            guard: 'Nguyễn Văn A',
            status: 'upcoming'
        },
    ],
    '2025-01-25': [
        { 
            id: 6, 
            shiftName: 'Ca Sáng', 
            time: '06:00 - 14:00', 
            dorm: 'Dorm C', 
            guard: 'Nguyễn Văn A',
            status: 'upcoming'
        },
    ],
};

// Render nội dung cho từng ngày trong calendar
function dateCellRender(value) {
    const dateKey = value.format('YYYY-MM-DD');
    const listData = mockScheduleData[dateKey] || [];

    return (
        <ul className="events" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {listData.map((item) => {
                let tagColor = 'default';
                if (item.status === 'completed') tagColor = 'success';
                else if (item.status === 'upcoming') tagColor = 'processing';
                else if (item.status === 'current') tagColor = 'warning';

                return (
                    <li key={item.id} style={{ marginBottom: 4 }}>
                        <Tag 
                            color={tagColor}
                            style={{ 
                                whiteSpace: 'normal', 
                                cursor: 'pointer', 
                                maxWidth: '100%',
                                fontSize: '11px',
                                padding: '2px 6px'
                            }}
                            title={`${item.shiftName} - ${item.time} - ${item.dorm}`}
                        >
                            {item.shiftName} - {item.dorm}
                        </Tag>
                    </li>
                );
            })}
        </ul>
    );
}

// Component hiển thị chi tiết ca làm việc được chọn
function ShiftDetailCard({ selectedDate, scheduleData }) {
    if (!selectedDate || !scheduleData) {
        return (
            <Card>
                <Text type="secondary">Chọn một ngày để xem chi tiết lịch làm việc</Text>
            </Card>
        );
    }

    const dateKey = selectedDate.format('YYYY-MM-DD');
    const shifts = mockScheduleData[dateKey] || [];

    if (shifts.length === 0) {
        return (
            <Card>
                <Text type="secondary">Không có ca làm việc vào ngày {selectedDate.format('DD/MM/YYYY')}</Text>
            </Card>
        );
    }

    return (
        <Card title={`Lịch làm việc ngày ${selectedDate.format('DD/MM/YYYY')}`}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {shifts.map((shift) => {
                    let statusColor = 'default';
                    let statusText = 'Chưa xác định';
                    
                    if (shift.status === 'completed') {
                        statusColor = 'success';
                        statusText = 'Đã hoàn thành';
                    } else if (shift.status === 'upcoming') {
                        statusColor = 'processing';
                        statusText = 'Sắp tới';
                    } else if (shift.status === 'current') {
                        statusColor = 'warning';
                        statusText = 'Đang làm việc';
                    }

                    return (
                        <Card 
                            key={shift.id} 
                            size="small"
                            style={{ 
                                borderLeft: `4px solid ${
                                    shift.status === 'completed' ? '#52c41a' : 
                                    shift.status === 'upcoming' ? '#1890ff' : 
                                    shift.status === 'current' ? '#faad14' : '#d9d9d9'
                                }` 
                            }}
                        >
                            <Row gutter={[16, 8]}>
                                <Col span={24}>
                                    <Space>
                                        <ClockCircleOutlined />
                                        <Text strong>{shift.shiftName}</Text>
                                        <Tag color={statusColor}>{statusText}</Tag>
                                    </Space>
                                </Col>
                                <Col span={24}>
                                    <Space>
                                        <Text type="secondary">Thời gian:</Text>
                                        <Text>{shift.time}</Text>
                                    </Space>
                                </Col>
                                <Col span={24}>
                                    <Space>
                                        <EnvironmentOutlined />
                                        <Text type="secondary">Khu vực:</Text>
                                        <Text>{shift.dorm}</Text>
                                    </Space>
                                </Col>
                                <Col span={24}>
                                    <Space>
                                        <UserOutlined />
                                        <Text type="secondary">Bảo vệ:</Text>
                                        <Text>{shift.guard}</Text>
                                    </Space>
                                </Col>
                            </Row>
                        </Card>
                    );
                })}
            </Space>
        </Card>
    );
}

export function GuardSchedule() {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const activeKey = 'guard-schedule';

    const toggleSideBar = () => {
        setCollapsed(!collapsed);
    };

    const onSelect = (value) => {
        setSelectedDate(value);
    };

    const dateKey = selectedDate.format('YYYY-MM-DD');
    const scheduleData = mockScheduleData[dateKey] || [];

    return (
        <Layout className={"!h-screen"}>
            <GuardSidebar active={activeKey} collapsed={collapsed} />
            <Layout>
                <AppHeader toggleSideBar={toggleSideBar} />
                <Content className={"!overflow-auto h-full p-5 flex flex-col gap-4"}>
                    <Card>
                        <Title level={2}>
                            <ScheduleOutlined /> Lịch làm việc
                        </Title>
                        <Text type="secondary">
                            Xem lịch làm việc và thông tin ca làm việc của bạn
                        </Text>
                    </Card>

                    <Row gutter={16}>
                        <Col span={16}>
                            <Card>
                                <Calendar
                                    dateCellRender={dateCellRender}
                                    onSelect={onSelect}
                                    value={selectedDate}
                                    style={{ border: '1px solid #f0f0f0', borderRadius: 4 }}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <ShiftDetailCard selectedDate={selectedDate} scheduleData={scheduleData} />
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
}

