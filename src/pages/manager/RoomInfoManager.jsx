import React, {useEffect, useState} from 'react';
import {
    Layout, Typography, Row, Col, Table, Input, Select, Button, Tag, Space,
    Modal, Form, message, InputNumber, Divider
} from 'antd';
import {
    SearchOutlined, EditOutlined, PlusOutlined, DollarCircleOutlined
} from "@ant-design/icons";
import { Link } from 'react-router-dom';

// Import SideBarManager
import { SideBarManager } from '../../components/layout/SideBarManger';

// Import axiosClient của bạn
import axiosClient from '../../api/axiosClient/axiosClient';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// === CỘT BẢNG PHÒNG CHÍNH (ĐÃ CẬP NHẬT LOGIC TÍNH TOÁN) ===
const roomColumns = [
    {
        title: 'Tòa nhà',
        dataIndex: ['dorm', 'dormName'], // Truy cập record.dorm.dormName
        key: 'dormName',
    },
    {
        title: 'Tầng',
        dataIndex: 'floor',
        key: 'floor',
    },
    {
        title: 'Số phòng',
        dataIndex: 'roomNumber',
        key: 'roomNumber',
        render: (text, record) => (
            // === SỬA LINK Ở ĐÂY ===
            <Link
                to={`/manager/room-detail/${record.id}`} // Dùng ID phòng
                style={{ fontWeight: 'bold', color: '#1890ff' }}
            >
                {text}
            </Link>
        ),
    },
    {
        title: 'Số người (Hiện tại/Tối đa)',
        key: 'occupancy',
        render: (text, record) => {
            // Lấy tổng số slot (tối đa)
            const totalSlot = record.totalSlot || record.pricing?.totalSlot || 0;
            // Tính số slot ĐÃ CÓ NGƯỜI (occupied) bằng cách lấy tổng trừ đi số slot AVAILABLE
            const availableSlot = record.slots?.filter(slot => slot.status === "AVAILABLE").length || 0;
            const currentSlot = totalSlot - availableSlot; // Số người hiện tại

            return (
                <span>
                    {currentSlot} / {totalSlot}
                </span>
            );
        },
    },
    {
        title: 'Trạng thái',
        key: 'status',
        render: (text, record) => {
            // Tính số slot AVAILABLE
            const availableSlot = record.slots?.filter(slot => slot.status === "AVAILABLE").length || 0;
            // Kiểm tra xem còn chỗ hay không
            const isFull = availableSlot === 0;
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
                {/* Nút Edit sẽ được xử lý trong component RoomInfoManager */}
                <Button icon={<EditOutlined />} title="Chỉnh sửa" />
            </Space>
        ),
    },
];


// --- COMPONENT CHÍNH ---
export function RoomInfoManager() {
    // (State chung, filter, data, pagination)
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'manager-rooms';
    const [filterBuilding, setFilterBuilding] = useState(undefined);
    const [filterFloor, setFilterFloor] = useState(undefined);
    const [filterStatus, setFilterStatus] = useState(undefined);
    const [searchText, setSearchText] = useState('');
    const [buildings, setBuildings] = useState([]);
    const [roomData, setRoomData] = useState([]);
    const [pricings, setPricings] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    // (State Loading)
    const [isGettingRooms, setIsGettingRooms] = useState(false);
    const [isCreatingBuilding, setIsCreatingBuilding] = useState(false);
    const [isPricingLoading, setIsPricingLoading] = useState(false);
    const [isCreatingPrice, setIsCreatingPrice] = useState(false);
    const [isUpdatingRoom, setIsUpdatingRoom] = useState(false);

    // (State Modal)
    const [isAddBuildingModalVisible, setIsAddBuildingModalVisible] = useState(false);
    const [isPricingModalVisible, setIsPricingModalVisible] = useState(false);
    const [isEditRoomModalVisible, setIsEditRoomModalVisible] = useState(false);

    // (State Form)
    const [formBuilding] = Form.useForm();
    const [formPrice] = Form.useForm();
    const [formEditRoom] = Form.useForm();

    // (State Editing)
    const [editingPrice, setEditingPrice] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);


    // (API fetchPricings, fetchBuildings)
    const fetchPricings = async () => {
        setIsPricingLoading(true);
        try {
            const response = await axiosClient.get('/pricing');
            if (response && response.data) setPricings(response.data);
        } catch (error) { message.error("Không thể tải danh sách giá!"); }
        finally { setIsPricingLoading(false); }
    };

    const fetchBuildings = async () => {
        try {
            const response = await axiosClient.get('/dorms');
            if (response && response.data) setBuildings(response.data);
        } catch (error) { message.error("Không thể tải danh sách tòa nhà!"); }
    };

    // (API fetchRooms - Gọi API /rooms)
    const fetchRooms = async (pageParams = {}) => {
        setIsGettingRooms(true);
        try {
            const params = { page: pageParams.current - 1, size: pageParams.pageSize, dormId: filterBuilding, floor: filterFloor, roomNumber: searchText };
            const response = await axiosClient.get('/rooms', { params });
            if (response && response.data) {
                const dataWithKey = response.data.content.map(room => ({...room, key: room.id }));
                setRoomData(dataWithKey);
                setPagination(prev => ({ ...prev, total: response.data.totalElements }));
            }
        } catch (error) { message.error("Không thể tải danh sách phòng!"); }
        finally { setIsGettingRooms(false); }
    };

    // (useEffect load data)
    useEffect(() => { fetchBuildings(); fetchPricings(); }, []);
    useEffect(() => { fetchRooms(pagination); }, [filterBuilding, filterFloor, searchText, pagination.current, pagination.pageSize]);
    const handleTableChange = (newPagination) => setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));

    // (Handlers Modal TÒA NHÀ)
    const showAddBuildingModal = () => setIsAddBuildingModalVisible(true);
    const handleCancelBuilding = () => setIsAddBuildingModalVisible(false);
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
            fetchBuildings();
            fetchRooms(pagination);
        } catch (error) { message.error("Tạo tòa nhà thất bại! " + (error.response?.data?.message || "Lỗi không xác định")); }
        finally { setIsCreatingBuilding(false); }
    };

    // (Handlers Modal GIÁ PHÒNG - Chỉ có Thêm/Sửa)
    const showPricingModal = () => setIsPricingModalVisible(true);
    const handleCancelPricing = () => { setIsPricingModalVisible(false); setEditingPrice(null); formPrice.resetFields(); };
    const onFinishPrice = async (values) => {
        const isInEditMode = !!editingPrice;
        setIsCreatingPrice(true);
        try {
            if (isInEditMode) {
                const payload = { ...values, id: editingPrice.id };
                await axiosClient.patch('/pricing', payload);
                message.success("Cập nhật giá thành công!");
            } else {
                await axiosClient.post('/pricing', values);
                message.success(`Đã thêm loại phòng ${values.totalSlot} giường`);
            }
            formPrice.resetFields();
            setEditingPrice(null);
            fetchPricings();
        } catch (error) { message.error("Thao tác thất bại! " + (error.response?.data?.message || "Lỗi không xác định")); }
        finally { setIsCreatingPrice(false); }
    };
    const handleEditPrice = (record) => { setEditingPrice(record); formPrice.setFieldsValue({ totalSlot: record.totalSlot, price: record.price }); };
    const handleCancelEdit = () => { setEditingPrice(null); formPrice.resetFields(); };
    const pricingColumns = [
        { title: 'Số giường (totalSlot)', dataIndex: 'totalSlot', key: 'totalSlot' },
        { title: 'Giá (VND)', dataIndex: 'price', key: 'price', render: (price) => price.toLocaleString('vi-VN') },
        { title: 'Hành động', key: 'action', render: (_, record) => (<Space><Button icon={<EditOutlined />} onClick={() => handleEditPrice(record)} title="Sửa loại giá"/></Space>) },
    ];

    // --- Handlers cho Modal SỬA PHÒNG ---
    const handleShowEditRoomModal = (roomRecord) => {
        setEditingRoom(roomRecord);
        formEditRoom.setFieldsValue({
            totalSlot: roomRecord.totalSlot || roomRecord.pricing?.totalSlot
        });
        setIsEditRoomModalVisible(true);
    };
    const handleCancelEditRoom = () => {
        setIsEditRoomModalVisible(false);
        setEditingRoom(null);
        formEditRoom.resetFields();
    };
    const handleOkEditRoom = async () => {
        if (!editingRoom) return;
        try {
            const values = await formEditRoom.validateFields();
            const roomId = editingRoom.id;
            const payload = { totalSlot: values.totalSlot };
            setIsUpdatingRoom(true);
            await axiosClient.patch(`/rooms/${roomId}`, payload); // Gọi API PATCH /rooms/{id}
            message.success(`Đã cập nhật số giường cho phòng ${editingRoom.roomNumber}!`);
            handleCancelEditRoom();
            fetchRooms(pagination);
        } catch (error) { message.error("Cập nhật phòng thất bại! " + (error.response?.data?.message || "Lỗi không xác định")); }
        finally { setIsUpdatingRoom(false); }
    };

    // (Cột động Bảng Phòng - không đổi)
    const dynamicRoomColumns = roomColumns.map(col => {
        if (col.key === 'dormName') {
            return { ...col, filters: buildings.map(b => ({ text: b.dormName, value: b.id })) };
        }
        return col;
    });

    // Cập nhật lại cột Hành động trong dynamicRoomColumns để gọi đúng handler
    const finalRoomColumns = dynamicRoomColumns.map(col => {
        if (col.key === 'action') {
            return {
                ...col,
                render: (text, record) => ( // Ghi đè lại render
                    <Space size="middle">
                        <Button
                            icon={<EditOutlined />}
                            title="Chỉnh sửa phòng"
                            onClick={() => handleShowEditRoomModal(record)} // Gọi handler sửa phòng
                        />
                    </Space>
                ),
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
                    {/* Filter và Nút bấm */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 20 }} justify="space-between" align="middle">
                        <Col>
                            <Space wrap>
                                <Select placeholder="Tòa nhà" style={{ width: 120 }} onChange={(value) => setFilterBuilding(value)} allowClear>
                                    {buildings.map(b => (<Option key={b.id} value={b.id}>{b.dormName}</Option>))}
                                </Select>
                                <Select placeholder="Tầng" style={{ width: 100 }} onChange={setFilterFloor} allowClear />
                                <Select placeholder="Trạng thái" style={{ width: 120 }} onChange={setFilterStatus} allowClear>
                                    <Option value="true">Đã đầy</Option><Option value="false">Còn chỗ</Option>
                                </Select>
                                <Input placeholder="Tìm kiếm Số phòng..." prefix={<SearchOutlined />} style={{ width: 250 }} onChange={(e) => setSearchText(e.target.value)} />
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                <Button icon={<DollarCircleOutlined />} onClick={showPricingModal}>Quản lý giá phòng</Button>
                                <Button type="primary" icon={<PlusOutlined />} onClick={showAddBuildingModal}>Thêm tòa nhà</Button>
                            </Space>
                        </Col>
                    </Row>
                    {/* BẢNG PHÒNG CHÍNH */}
                    <Table loading={isGettingRooms} columns={finalRoomColumns} dataSource={roomData} onChange={handleTableChange} pagination={{...pagination, showSizeChanger: true, pageSizeOptions: ['10', '20', '50']}} bordered />
                </Content>
            </Layout>
            {/* Modal 1: Thêm Tòa Nhà */}
            <Modal title="Tạo tòa nhà và các phòng (mặc định 4 giường)" open={isAddBuildingModalVisible} onOk={handleOkBuilding} onCancel={handleCancelBuilding} confirmLoading={isCreatingBuilding} destroyOnClose width={600}>
                <Form form={formBuilding} layout="vertical" name="form_add_building" autoComplete="off">
                    <Form.Item name="dormName" label="Tên tòa nhà" rules={[{ required: true }]}> <Input placeholder="Ví dụ: A5..." /></Form.Item>
                    <Row gutter={16}>
                        <Col span={12}><Form.Item name="totalFloor" label="Tổng số tầng" rules={[{ required: true }, { type: 'number', min: 1 }]}><InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 10" /></Form.Item></Col>
                        <Col span={12}><Form.Item name="roomsPerFloor" label="Số phòng mỗi tầng" rules={[{ required: true }, { type: 'number', min: 1 }]}><InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 20" /></Form.Item></Col>
                    </Row>
                    <Divider /><Text type="secondary">Hệ thống sẽ tự động tạo các phòng với <Text strong>mặc định là 4 giường</Text>.</Text>
                </Form>
            </Modal>
            {/* Modal 2: Quản lý giá phòng */}
            <Modal title={editingPrice ? "Cập nhật giá phòng" : "Quản lý giá phòng"} open={isPricingModalVisible} onCancel={handleCancelPricing} footer={null} width={600} destroyOnClose>
                <Form form={formPrice} layout="inline" onFinish={onFinishPrice} style={{ marginBottom: 20 }}>
                    <Form.Item name="totalSlot" label="Số giường" rules={[{ required: true }]}><InputNumber min={1} placeholder="Ví dụ: 4" disabled={!!editingPrice} /></Form.Item>
                    <Form.Item name="price" label="Giá (VND)" rules={[{ required: true }]}><InputNumber min={0} placeholder="Ví dụ: 3000000" style={{ width: 150 }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v.replace(/\$\s?|(,*)/g, '')} /></Form.Item>
                    <Form.Item><Space><Button type="primary" htmlType="submit" loading={isCreatingPrice}>{editingPrice ? 'Cập nhật' : 'Thêm'}</Button>{editingPrice && (<Button onClick={handleCancelEdit}>Hủy</Button>)}</Space></Form.Item>
                </Form>
                <Divider>Các loại giá hiện có</Divider>
                <Table loading={isPricingLoading} columns={pricingColumns} dataSource={pricings} rowKey="id" pagination={false} bordered size="small" />
            </Modal>
            {/* Modal 3: Sửa Phòng */}
            <Modal title={`Chỉnh sửa phòng ${editingRoom?.roomNumber || ''}`} open={isEditRoomModalVisible} onOk={handleOkEditRoom} onCancel={handleCancelEditRoom} confirmLoading={isUpdatingRoom} destroyOnClose>
                <Form form={formEditRoom} layout="vertical" name="form_edit_room">
                    <Form.Item name="totalSlot" label="Loại phòng (Số giường tối đa)" rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}>
                        <Select placeholder="Chọn số giường mới" loading={isPricingLoading}>
                            {pricings.map(p => ( <Option key={p.id} value={p.totalSlot}>{p.totalSlot} giường ({p.price.toLocaleString('vi-VN')} VND)</Option>))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
}