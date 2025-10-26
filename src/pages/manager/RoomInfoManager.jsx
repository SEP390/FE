import React, {useEffect, useState} from 'react';
import {
    Layout, Typography, Row, Col, Table, Input, Select, Button, Tag, Space,
    Modal, Form, message, InputNumber, Divider
} from 'antd';
import { SearchOutlined, EditOutlined, PlusOutlined, DollarCircleOutlined } from "@ant-design/icons";
import { Link } from 'react-router-dom';

import { SideBarManager } from '../../components/layout/SideBarManger';
import axiosClient from '../../api/axiosClient/axiosClient';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// === QUAN TRỌNG: Cập nhật Cột để khớp DTO 'RoomResponseJoinPricing' ===
// Bạn cần kiểm tra DTO của mình để đảm bảo các tên trường (dataIndex) này là chính xác
const roomColumns = [
    {
        title: 'Tòa nhà',
        dataIndex: ['dorm', 'dormName'], // Giả sử DTO trả về { dorm: { dormName: 'A1' } }
        key: 'dormName',
        sorter: (a, b) => a.dorm.dormName.localeCompare(b.dorm.dormName),
    },
    {
        title: 'Tầng',
        dataIndex: 'floor', // Giả sử DTO có 'floor'
        key: 'floor',
        sorter: (a, b) => a.floor - b.floor,
    },
    {
        title: 'Số phòng',
        dataIndex: 'roomNumber', // Giả sử DTO có 'roomNumber'
        key: 'roomNumber',
        render: (text, record) => (
            <Link
                to={`/manager/rooms/${record.id}`} // Dùng 'id' của phòng
                style={{ fontWeight: 'bold', color: '#1890ff' }}
            >
                {text}
            </Link>
        ),
        sorter: (a, b) => a.roomNumber.localeCompare(b.roomNumber),
    },
    {
        title: 'Số người (Hiện tại/Tối đa)',
        key: 'occupancy',
        // Giả sử DTO có 'currentSlot' và 'totalSlot'
        render: (text, record) => (
            <span>
                {record.currentSlot} / {record.totalSlot}
            </span>
        ),
        sorter: (a, b) => (a.currentSlot / a.totalSlot) - (b.currentSlot / b.totalSlot),
    },
    {
        title: 'Trạng thái',
        key: 'status',
        render: (text, record) => {
            const isFull = record.currentSlot === record.totalSlot;
            const statusText = isFull ? 'Đã đầy' : 'Còn chỗ';
            return (
                <Tag color={isFull ? 'red' : 'green'}>
                    {statusText.toUpperCase()}
                </Tag>
            );
        }
    },
    {
        title: 'Hành động',
        key: 'action',
        render: (text, record) => (
            <Space size="middle">
                <Button icon={<EditOutlined />} title="Chỉnh sửa" />
            </Space>
        ),
    },
];

// (Bảng giá không đổi)
const pricingColumns = [
    { title: 'Số giường (totalSlot)', dataIndex: 'totalSlot', key: 'totalSlot' },
    {
        title: 'Giá (VND)',
        dataIndex: 'price',
        key: 'price',
        render: (price) => price.toLocaleString('vi-VN')
    },
];


// --- COMPONENT CHÍNH ---
export function RoomInfoManager() {
    // (State chung)
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'manager-rooms';

    // === THAY ĐỔI: State filter (filterBuilding giờ sẽ là UUID) ===
    const [filterBuilding, setFilterBuilding] = useState(undefined); // Sẽ lưu UUID
    const [filterFloor, setFilterFloor] = useState(undefined);
    const [filterStatus, setFilterStatus] = useState(undefined); // (Lưu ý: API không có filter status)
    const [searchText, setSearchText] = useState('');

    // (State dữ liệu)
    const [buildings, setBuildings] = useState([]);
    const [roomData, setRoomData] = useState([]);
    const [pricings, setPricings] = useState([]);

    // === MỚI: State cho Pagination (Phân trang) ===
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // (State loading)
    const [isGettingRooms, setIsGettingRooms] = useState(false);
    const [isCreatingBuilding, setIsCreatingBuilding] = useState(false);
    const [isPricingLoading, setIsPricingLoading] = useState(false);
    const [isCreatingPrice, setIsCreatingPrice] = useState(false);

    // (State Modal & Form)
    const [isAddBuildingModalVisible, setIsAddBuildingModalVisible] = useState(false);
    const [isPricingModalVisible, setIsPricingModalVisible] = useState(false);
    const [formBuilding] = Form.useForm();
    const [formPrice] = Form.useForm();


    // API: Lấy danh sách GIÁ PHÒNG (Không đổi)
    const fetchPricings = async () => {
        setIsPricingLoading(true);
        try {
            const response = await axiosClient.get('/pricing');
            if (response && response.data) {
                setPricings(response.data);
            }
        } catch (error) { message.error("Không thể tải danh sách giá!"); }
        finally { setIsPricingLoading(false); }
    };

    // API: Lấy Tòa nhà (Không đổi)
    const fetchBuildings = async () => {
        try {
            const response = await axiosClient.get('/dorms');
            if (response && response.data) {
                setBuildings(response.data);
            }
        } catch (error) { message.error("Không thể tải danh sách tòa nhà!"); }
    };

    // === THAY ĐỔI: API Lấy danh sách PHÒNG (có phân trang) ===
    const fetchRooms = async (pageParams = {}) => {
        setIsGettingRooms(true);
        try {
            const params = {
                // Phân trang
                page: pageParams.current - 1, // API Spring Pageable bắt đầu từ 0
                size: pageParams.pageSize,
                // Filter
                dormId: filterBuilding, // Đây là UUID
                floor: filterFloor,
                roomNumber: searchText,
                // totalSlot: ... // (Bạn có thể thêm filter này nếu muốn)
            };

            // Gọi API @GetMapping("/api/rooms/booking")
            const response = await axiosClient.get('/rooms/booking', { params });

            if (response && response.data) {
                // response.data là PagedModel, có 'content' và 'totalElements'
                const dataWithKey = response.data.content.map(room => ({
                    ...room,
                    key: room.id // Giả sử DTO trả về có 'id'
                }));
                setRoomData(dataWithKey);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.totalElements,
                }));
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách phòng:", error);
            message.error("Không thể tải danh sách phòng!");
        } finally {
            setIsGettingRooms(false);
        }
    };

    // useEffect (load data lần đầu)
    useEffect(() => {
        fetchBuildings();
        fetchPricings();
    }, []);

    // === THAY ĐỔI: useEffect (load lại phòng khi filter hoặc trang thay đổi) ===
    useEffect(() => {
        fetchRooms(pagination);
    }, [filterBuilding, filterFloor, searchText, pagination.current, pagination.pageSize]); // Dependencies


    // === MỚI: Handler khi đổi trang hoặc Sorter ===
    const handleTableChange = (newPagination, filters, sorter) => {
        setPagination({
            ...pagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        });
        // (Bạn cũng có thể thêm logic cho sorter ở đây)
    };

    // --- Handlers cho Modal TÒA NHÀ (Không đổi) ---
    const showAddBuildingModal = () => {
        setIsAddBuildingModalVisible(true);
    };

    const handleOkBuilding = async () => {
        try {
            const values = await formBuilding.validateFields();
            const { dormName, totalFloor, roomsPerFloor } = values;
            const generatedRooms = [];
            const DEFAULT_SLOTS = 4;

            for (let floor = 1; floor <= totalFloor; floor++) {
                for (let roomIdx = 1; roomIdx <= roomsPerFloor; roomIdx++) {
                    const roomNumberStr = `${floor}${roomIdx < 10 ? '0' : ''}${roomIdx}`;
                    generatedRooms.push({ roomNumber: roomNumberStr, totalSlot: DEFAULT_SLOTS, floor: floor });
                }
            }
            const payload = { dormName: dormName, totalFloor: totalFloor, totalRoom: generatedRooms.length, rooms: generatedRooms };

            setIsCreatingBuilding(true);
            await axiosClient.post('/dorms', payload);

            message.success(`Đã tạo tòa nhà "${dormName}"!`);
            setIsAddBuildingModalVisible(false);
            formBuilding.resetFields();

            fetchBuildings(); // Tải lại danh sách tòa nhà
            fetchRooms(pagination); // Tải lại bảng phòng

        } catch (error) {
            console.error("Lỗi khi tạo tòa nhà:", error);
            message.error("Tạo tòa nhà thất bại! " + (error.response?.data?.message || "Lỗi không xác định"));
        } finally {
            setIsCreatingBuilding(false);
        }
    };

    const handleCancelBuilding = () => {
        setIsAddBuildingModalVisible(false);
    };

    // --- Handlers cho Modal GIÁ PHÒNG (Không đổi) ---
    const showPricingModal = () => {
        setIsPricingModalVisible(true);
    };
    const handleCancelPricing = () => {
        setIsPricingModalVisible(false);
    };
    const onFinishPrice = async (values) => {
        setIsCreatingPrice(true);
        try {
            await axiosClient.post('/pricing', values);
            message.success(`Đã thêm loại phòng ${values.totalSlot} giường`);
            formPrice.resetFields();
            fetchPricings();
        } catch (error) {
            message.error("Thêm giá thất bại! " + (error.response?.data?.message || "Lỗi không xác định"));
        } finally {
            setIsCreatingPrice(false);
        }
    };

    // (Cập nhật cột động cho bảng PHÒNG)
    const dynamicRoomColumns = roomColumns.map(col => {
        if (col.key === 'dormName') {
            return {
                ...col,
                filters: buildings.map(b => ({ text: b.dormName, value: b.id })), // Lọc bằng ID
                onFilter: (value, record) => record.dorm.id === value, // So sánh ID
            };
        }
        return col;
    });

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                        Quản lý ký túc xá / Thông tin phòng
                    </Title>
                </Header>

                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                    <Row gutter={[16, 16]} style={{ marginBottom: 20 }} justify="space-between" align="middle">
                        <Col>
                            <Space wrap>
                                {/* === THAY ĐỔI: Filter Tòa nhà (Gửi UUID) === */}
                                <Select
                                    placeholder="Tòa nhà"
                                    style={{ width: 120 }}
                                    onChange={(value) => setFilterBuilding(value)} // 'value' giờ là 'b.id'
                                    allowClear
                                >
                                    {buildings.map(b => (
                                        // 'value' là UUID, 'children' là Tên
                                        <Option key={b.id} value={b.id}>{b.dormName}</Option>
                                    ))}
                                </Select>

                                <Select placeholder="Tầng" style={{ width: 100 }} onChange={setFilterFloor} allowClear>
                                    {/* (Bạn có thể tạo động các tầng từ data) */}
                                </Select>
                                <Select placeholder="Trạng thái" style={{ width: 120 }} onChange={setFilterStatus} allowClear>
                                    <Option value="true">Đã đầy</Option>
                                    <Option value="false">Còn chỗ</Option>
                                </Select>
                                <Input
                                    placeholder="Tìm kiếm Số phòng..."
                                    prefix={<SearchOutlined />}
                                    style={{ width: 250 }}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </Space>
                        </Col>
                        {/* (Nút bấm không đổi) */}
                        <Col>
                            <Space>
                                <Button icon={<DollarCircleOutlined />} onClick={showPricingModal}>
                                    Quản lý giá phòng
                                </Button>
                                <Button type="primary" icon={<PlusOutlined />} onClick={showAddBuildingModal}>
                                    Thêm tòa nhà
                                </Button>
                            </Space>
                        </Col>
                    </Row>

                    {/* === THAY ĐỔI: BẢNG PHÒNG (Thêm onChange và pagination) === */}
                    <Table
                        loading={isGettingRooms}
                        columns={dynamicRoomColumns}
                        dataSource={roomData}
                        onChange={handleTableChange} // Thêm handler
                        pagination={{ // Cấu hình phân trang
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50'],
                        }}
                        bordered
                    />
                </Content>
            </Layout>

            {/* (Modal 1: Thêm Tòa Nhà - Không đổi) */}
            <Modal
                title="Tạo tòa nhà và các phòng (mặc định 4 giường)"
                visible={isAddBuildingModalVisible}
                onOk={handleOkBuilding}
                onCancel={handleCancelBuilding}
                confirmLoading={isCreatingBuilding}
                destroyOnClose
                width={600}
            >
                <Form form={formBuilding} layout="vertical" name="form_add_building" autoComplete="off">
                    <Form.Item name="dormName" label="Tên tòa nhà" rules={[{ required: true, message: 'Vui lòng nhập tên tòa nhà!' }]}>
                        <Input placeholder="Ví dụ: A5, B10..." />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="totalFloor" label="Tổng số tầng" rules={[{ required: true, message: 'Vui lòng nhập tổng số tầng!' }, { type: 'number', min: 1 }]}>
                                <InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 10" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="roomsPerFloor" label="Số phòng mỗi tầng" rules={[{ required: true, message: 'Vui lòng nhập số phòng/tầng!' }, { type: 'number', min: 1 }]}>
                                <InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 20" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider />
                    <Text type="secondary">
                        Hệ thống sẽ tự động tạo các phòng với <Text strong>mặc định là 4 giường</Text>.
                    </Text>
                </Form>
            </Modal>

            {/* (Modal 2: Quản lý giá phòng - Không đổi) */}
            <Modal
                title="Quản lý giá phòng"
                visible={isPricingModalVisible}
                onCancel={handleCancelPricing}
                footer={null}
                width={600}
                destroyOnClose
            >
                <Form form={formPrice} layout="inline" onFinish={onFinishPrice} style={{ marginBottom: 20 }}>
                    <Form.Item name="totalSlot" label="Số giường" rules={[{ required: true, message: 'Nhập số giường!' }]}>
                        <InputNumber min={1} placeholder="Ví dụ: 4" />
                    </Form.Item>
                    <Form.Item name="price" label="Giá (VND)" rules={[{ required: true, message: 'Nhập giá tiền!' }]}>
                        <InputNumber
                            min={0}
                            placeholder="Ví dụ: 3000000"
                            style={{ width: 150 }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={isCreatingPrice}>
                            Thêm
                        </Button>
                    </Form.Item>
                </Form>
                <Divider>Các loại giá hiện có</Divider>
                <Table
                    loading={isPricingLoading}
                    columns={pricingColumns}
                    dataSource={pricings}
                    rowKey="id"
                    pagination={false}
                    bordered
                    size="small"
                />
            </Modal>
        </Layout>
    );
}