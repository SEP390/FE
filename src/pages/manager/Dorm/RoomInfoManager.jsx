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
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';

// Import axiosClient của bạn
import axiosClient from '../../../api/axiosClient/axiosClient.js';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// === CỘT BẢNG PHÒNG CHÍNH (THÊM KIỂM TRA AN TOÀN) ===
const roomColumns = [
    {
        title: 'Tòa nhà',
        dataIndex: ['dorm', 'dormName'],
        key: 'dormName',
        render: (dormName) => dormName || 'N/A'
    },
    {
        title: 'Tầng',
        dataIndex: 'floor',
        key: 'floor',
        render: (floor) => floor ?? 'N/A'
    },
    {
        title: 'Số phòng',
        dataIndex: 'roomNumber',
        key: 'roomNumber',
        render: (text, record) => (
            record?.id ?
                <Link to={`/manager/room-detail/${record.id}`} style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {text || 'N/A'}
                </Link> : (text || 'N/A')
        ),
    },
    {
        title: 'Số người (Hiện tại/Tối đa)',
        key: 'occupancy',
        render: (text, record) => {
            const totalSlot = record?.totalSlot ?? record?.pricing?.totalSlot ?? 0;
            const availableSlot = record?.slots?.filter(slot => slot?.status === "AVAILABLE").length ?? 0;
            const currentSlot = Math.max(0, totalSlot - availableSlot);
            return <span>{currentSlot} / {totalSlot}</span>;
        },
    },
    {
        title: 'Trạng thái',
        key: 'status',
        render: (text, record) => {
            const totalSlot = record?.totalSlot ?? record?.pricing?.totalSlot;
            const availableSlot = record?.slots?.filter(slot => slot?.status === "AVAILABLE").length ?? 0;
            const isFull = totalSlot > 0 && availableSlot === 0;
            const statusText = isFull ? 'Đã đầy' : 'Còn chỗ';
            return <Tag color={isFull ? 'red' : 'green'}>{statusText.toUpperCase()}</Tag>;
        }
    },
    {
        title: 'Hành động',
        key: 'action',
        render: (text, record) => (
            <Space size="middle">
                <Button icon={<EditOutlined />} title="Chỉnh sửa" disabled={!record?.id} />
            </Space>
        ),
    },
];


// --- COMPONENT CHÍNH ---
export function RoomInfoManager() {
    // (States chung, data, pagination)
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'manager-rooms';
    const [buildings, setBuildings] = useState([]);
    const [roomData, setRoomData] = useState([]);
    const [pricings, setPricings] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    // (State Filter)
    const [filterBuildingId, setFilterBuildingId] = useState(undefined);
    const [selectedBuildingInfo, setSelectedBuildingInfo] = useState(null);
    const [filterFloor, setFilterFloor] = useState(undefined);
    const [searchText, setSearchText] = useState('');

    // (State Loading)
    const [isGettingRooms, setIsGettingRooms] = useState(false);
    const [isCreatingBuilding, setIsCreatingBuilding] = useState(false);
    const [isPricingLoading, setIsPricingLoading] = useState(false);
    const [isCreatingPrice, setIsCreatingPrice] = useState(false);
    const [isUpdatingRoom, setIsUpdatingRoom] = useState(false);
    const [isAddingSingleRoom, setIsAddingSingleRoom] = useState(false);

    // (State Modal)
    const [isAddBuildingModalVisible, setIsAddBuildingModalVisible] = useState(false);
    const [isPricingModalVisible, setIsPricingModalVisible] = useState(false);
    const [isEditRoomModalVisible, setIsEditRoomModalVisible] = useState(false);
    const [isAddSingleRoomModalVisible, setIsAddSingleRoomModalVisible] = useState(false);

    // (State Form)
    const [formBuilding] = Form.useForm();
    const [formPrice] = Form.useForm();
    const [formEditRoom] = Form.useForm();
    const [formAddSingleRoom] = Form.useForm();

    // (State Editing)
    const [editingPrice, setEditingPrice] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);
    const [selectedDormForAddRoom, setSelectedDormForAddRoom] = useState(null);


    // (API fetchPricings, fetchBuildings, fetchRooms)
    const fetchPricings = async () => {
        setIsPricingLoading(true);
        try { const response = await axiosClient.get('/pricing'); if (response && response.data) setPricings(response.data); }
        catch (error) { message.error("Không thể tải danh sách giá!"); } finally { setIsPricingLoading(false); }
    };
    const fetchBuildings = async () => {
        try { const response = await axiosClient.get('/dorms'); if (response && response.data) setBuildings(response.data); }
        catch (error) { message.error("Không thể tải danh sách tòa nhà!"); }
    };
    const fetchRooms = async (pageParams = {}) => {
        setIsGettingRooms(true); setRoomData([]);
        try {
            const params = { page: pageParams.current - 1, size: pageParams.pageSize, dormId: filterBuildingId, floor: filterFloor, roomNumber: searchText };
            const response = await axiosClient.get('/rooms', { params });
            if (response && response.data && Array.isArray(response.data.content)) {
                const dataWithKey = response.data.content.filter(room => room && room.id).map(room => ({...room, key: room.id }));
                setRoomData(dataWithKey); setPagination(prev => ({ ...prev, current: pageParams.current, pageSize: pageParams.pageSize, total: response.data.totalElements }));
            } else { setRoomData([]); setPagination(prev => ({ ...prev, total: 0, current: 1 })); console.warn("API response error"); }
        } catch (error) { message.error("Không thể tải danh sách phòng!"); setRoomData([]); setPagination(prev => ({ ...prev, total: 0, current: 1 })); }
        finally { setIsGettingRooms(false); }
    };

    // (useEffect load data)
    useEffect(() => { fetchBuildings(); fetchPricings(); }, []);
    useEffect(() => { fetchRooms(pagination); }, [filterBuildingId, filterFloor, searchText, pagination.current, pagination.pageSize]);
    // (handleTableChange)
    const handleTableChange = (newPagination) => setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));

    // (Handler Filter Tòa nhà)
    const handleFilterBuildingChange = (dormId) => {
        setFilterBuildingId(dormId); const selectedBuilding = buildings.find(b => b.id === dormId);
        setSelectedBuildingInfo(selectedBuilding); setFilterFloor(undefined);
    };

    // (Handlers Modal TÒA NHÀ)
    const showAddBuildingModal = () => setIsAddBuildingModalVisible(true);
    const handleCancelBuilding = () => { setIsAddBuildingModalVisible(false); formBuilding.resetFields(); };
    const handleOkBuilding = async () => {
        try {
            const values = await formBuilding.validateFields();
            const payload = { dormName: values.dormName, totalFloor: values.totalFloor };
            setIsCreatingBuilding(true); await axiosClient.post('/dorms', payload);
            message.success(`Đã tạo tòa nhà "${values.dormName}"!`);
            handleCancelBuilding(); fetchBuildings();
        } catch (error) {
            console.error("Lỗi khi tạo tòa nhà:", error.response || error);
            message.error("Tạo tòa nhà thất bại! " + (error.response?.data?.message || "Lỗi không xác định"));
        } finally {
            setIsCreatingBuilding(false);
        }
    };


    // (Handlers Modal GIÁ PHÒNG - Thêm/Sửa)
    const showPricingModal = () => setIsPricingModalVisible(true);
    const handleCancelPricing = () => { setIsPricingModalVisible(false); setEditingPrice(null); formPrice.resetFields(); };
    const onFinishPrice = async (values) => {
        const isInEditMode = !!editingPrice;
        setIsCreatingPrice(true);
        try {
            if (isInEditMode) {
                const priceId = editingPrice.id; const payload = { price: values.price };
                await axiosClient.post(`/pricing/${priceId}`, payload); message.success("Cập nhật giá thành công!");
            } else {
                await axiosClient.post('/pricing', values); message.success(`Đã thêm loại phòng ${values.totalSlot} giường`);
            }
            formPrice.resetFields(); setEditingPrice(null); fetchPricings();
        } catch (error) { message.error("Thao tác thất bại! " + (error.response?.data?.message || "Lỗi")); }
        finally { setIsCreatingPrice(false); }
    };
    const handleEditPrice = (record) => { setEditingPrice(record); formPrice.setFieldsValue({ totalSlot: record?.totalSlot, price: record?.price }); };
    const handleCancelEdit = () => { setEditingPrice(null); formPrice.resetFields(); };
    const pricingColumns = [
        { title: 'Số giường', dataIndex: 'totalSlot', key: 'totalSlot' },
        { title: 'Giá (VND)', dataIndex: 'price', key: 'price', render: (price) => price ? price.toLocaleString('vi-VN') : 'N/A' },
        { title: 'Hành động', key: 'action', render: (_, record) => (<Space><Button icon={<EditOutlined />} onClick={() => handleEditPrice(record)} title="Sửa"/></Space>) },
    ];

    // --- Handlers Modal SỬA PHÒNG ---
    // === CHỈ GIỮ LẠI MỘT ĐỊNH NGHĨA ===
    const handleShowEditRoomModal = (roomRecord) => {
        setEditingRoom(roomRecord);
        const currentTotalSlot = roomRecord?.totalSlot ?? roomRecord?.pricing?.totalSlot;
        formEditRoom.setFieldsValue({ totalSlot: currentTotalSlot });
        setIsEditRoomModalVisible(true);
    };
    // === KẾT THÚC SỬA ===
    const handleCancelEditRoom = () => { setIsEditRoomModalVisible(false); setEditingRoom(null); formEditRoom.resetFields(); };
    const handleOkEditRoom = async () => {
        if (!editingRoom) return;
        try {
            const values = await formEditRoom.validateFields(); const roomId = editingRoom.id;
            const payload = {
                floor: editingRoom.floor, // Gửi floor cũ
                roomNumber: editingRoom.roomNumber, // Gửi roomNumber cũ
                totalSlot: values.totalSlot // Gửi totalSlot mới
            };
            setIsUpdatingRoom(true);
            await axiosClient.post(`/rooms/${roomId}`, payload);
            message.success(`Đã cập nhật phòng ${editingRoom.roomNumber}!`);
            handleCancelEditRoom(); fetchRooms(pagination);
        } catch (error) {
            console.error("Lỗi khi cập nhật phòng:", error.response || error);
            message.error("Cập nhật phòng thất bại! " + (error.response?.data?.message || "Lỗi không xác định"));
        } finally {
            setIsUpdatingRoom(false);
        }
    };

    // (Handlers Modal THÊM PHÒNG LẺ)
    const showAddSingleRoomModal = () => setIsAddSingleRoomModalVisible(true);
    const handleCancelAddSingleRoom = () => { setIsAddSingleRoomModalVisible(false); formAddSingleRoom.resetFields(); setSelectedDormForAddRoom(null); };
    const handleDormChangeForAddRoom = (dormId) => {
        const selectedDorm = buildings.find(dorm => dorm.id === dormId);
        setSelectedDormForAddRoom(selectedDorm); formAddSingleRoom.setFieldsValue({ floor: undefined });
    };
    const handleAddSingleRoom = async (values) => {
        const { dormId, ...roomDataPayload } = values; setIsAddingSingleRoom(true);
        try {
            await axiosClient.post(`/dorms/${dormId}/room`, roomDataPayload);
            message.success(`Đã thêm phòng ${roomDataPayload.roomNumber}!`);
            handleCancelAddSingleRoom(); fetchRooms(pagination);
        } catch (error) { message.error("Thêm phòng thất bại! " + (error.response?.data?.message || "Lỗi")); }
        finally { setIsAddingSingleRoom(false); }
    };


    // (Cột động Bảng Phòng)
    const dynamicRoomColumns = roomColumns.map(col => {
        if (col.key === 'dormName') {
            const filters = Array.isArray(buildings) ? buildings.map(b => ({ text: b.dormName, value: b.id })) : [];
            return { ...col, filters };
        }
        return col;
    });
    const finalRoomColumns = dynamicRoomColumns.map(col => {
        if (col.key === 'action') {
            // Gán lại render để gọi đúng handler sửa phòng
            return { ...col, render: (text, record) => ( <Space size="middle"> <Button icon={<EditOutlined />} title="Chỉnh sửa phòng" onClick={() => handleShowEditRoomModal(record)} /> </Space> ) };
        }
        return col;
    });

    // (Hàm generateFloorOptions)
    const generateFloorOptions = (totalFloors) => {
        const options = [];
        if (typeof totalFloors === 'number' && totalFloors > 0) {
            for (let i = 1; i <= totalFloors; i++) { options.push(<Option key={i} value={i}>{`Tầng ${i}`}</Option>); }
        }
        return options;
    };


    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}> <Title level={2} style={{ margin: 0, lineHeight: '80px' }}> Quản lý ký túc xá / Thông tin phòng </Title> </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                    {/* Filter và Nút bấm */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 20 }} justify="space-between" align="middle">
                        <Col><Space wrap>
                            <Select placeholder="Tòa nhà" style={{ width: 120 }} value={filterBuildingId} onChange={handleFilterBuildingChange} allowClear onClear={() => handleFilterBuildingChange(undefined)}>
                                {buildings.map(b => (<Option key={b?.id} value={b?.id}>{b?.dormName}</Option>))}
                            </Select>
                            <Select placeholder="Tầng" style={{ width: 100 }} value={filterFloor} onChange={setFilterFloor} allowClear disabled={!selectedBuildingInfo}>
                                {generateFloorOptions(selectedBuildingInfo?.totalFloor)}
                            </Select>
                            <Input placeholder="Tìm kiếm Số phòng..." prefix={<SearchOutlined />} style={{ width: 250 }} onChange={(e) => setSearchText(e.target.value)} />
                        </Space> </Col>
                        <Col><Space> <Button icon={<DollarCircleOutlined />} onClick={showPricingModal}>Quản lý giá phòng</Button> <Button icon={<PlusOutlined />} onClick={showAddSingleRoomModal}>Thêm phòng lẻ</Button> <Button type="primary" icon={<PlusOutlined />} onClick={showAddBuildingModal}>Thêm tòa nhà</Button> </Space></Col>
                    </Row>
                    {/* BẢNG PHÒNG CHÍNH */}
                    <Table loading={isGettingRooms} columns={finalRoomColumns} dataSource={roomData} onChange={handleTableChange} pagination={{...pagination, showSizeChanger: true, pageSizeOptions: ['10', '20', '50']}} bordered />
                </Content>
            </Layout>
            {/* Modal 1: Thêm Tòa Nhà */}
            <Modal title="Thêm tòa nhà mới" open={isAddBuildingModalVisible} onOk={handleOkBuilding} onCancel={handleCancelBuilding} confirmLoading={isCreatingBuilding} destroyOnClose width={600}>
                <Form form={formBuilding} layout="vertical" name="form_add_building" autoComplete="off">
                    <Form.Item
                        name="dormName"
                        label="Tên tòa nhà"
                        rules={[
                            {
                                required: true,
                                whitespace: true,
                                message: 'Vui lòng nhập tên tòa nhà!'
                            }
                        ]}
                    >
                        <Input placeholder="Ví dụ: A5..." />
                    </Form.Item>
                    <Form.Item
                        name="totalFloor"
                        label="Tổng số tầng"
                        rules={[{ required: true, message: 'Vui lòng nhập tổng số tầng!' }, { type: 'number', min: 1, message: 'Số tầng phải lớn hơn 0!' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 10" />
                    </Form.Item>
                </Form>
            </Modal>
            {/* Modal 2: Quản lý giá phòng */}
            <Modal title={editingPrice ? "Cập nhật giá phòng" : "Quản lý giá phòng"} open={isPricingModalVisible} onCancel={handleCancelPricing} footer={null} width={600} destroyOnClose>
                <Form form={formPrice} layout="inline" onFinish={onFinishPrice} style={{ marginBottom: 20 }}>
                    <Form.Item name="totalSlot" label="Số giường" rules={[{ required: true, message: 'Nhập số giường!' }]}><InputNumber min={1} placeholder="Ví dụ: 4" disabled={!!editingPrice} /></Form.Item>
                    <Form.Item name="price" label="Giá (VND)" rules={[{ required: true, message: 'Nhập giá tiền!' }]}><InputNumber min={0} placeholder="Ví dụ: 3000000" style={{ width: 150 }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(v) => v.replace(/\$\s?|(,*)/g, '')} /></Form.Item>
                    <Form.Item><Space><Button type="primary" htmlType="submit" loading={isCreatingPrice}>{editingPrice ? 'Cập nhật' : 'Thêm'}</Button>{editingPrice && (<Button onClick={handleCancelEdit}>Hủy</Button>)}</Space></Form.Item>
                </Form>
                <Divider>Các loại giá hiện có</Divider>
                <Table loading={isPricingLoading} columns={pricingColumns} dataSource={pricings} rowKey="id" pagination={false} bordered size="small" />
            </Modal>
            {/* Modal 3: Sửa Phòng */}
            <Modal title={`Chỉnh sửa phòng ${editingRoom?.roomNumber || ''}`} open={isEditRoomModalVisible} onOk={handleOkEditRoom} onCancel={handleCancelEditRoom} confirmLoading={isUpdatingRoom} destroyOnClose>
                <Form form={formEditRoom} layout="vertical" name="form_edit_room">
                    <Form.Item name="totalSlot" label="Loại phòng (Số giường tối đa)" rules={[{ required: true, message: 'Chọn loại phòng!' }]}>
                        <Select placeholder="Chọn số giường mới" loading={isPricingLoading}>
                            {pricings.map(p => ( <Option key={p?.id} value={p?.totalSlot}>{p?.totalSlot} giường ({p?.price?.toLocaleString('vi-VN') || 'N/A'} VND)</Option>))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            {/* Modal 4: Thêm Phòng Lẻ */}
            <Modal title="Thêm phòng lẻ vào tòa nhà" open={isAddSingleRoomModalVisible} onCancel={handleCancelAddSingleRoom} footer={null} destroyOnClose >
                <Form form={formAddSingleRoom} layout="vertical" onFinish={handleAddSingleRoom} name="add_single_room_form">
                    <Form.Item name="dormId" label="Chọn tòa nhà" rules={[{ required: true, message: 'Chọn tòa nhà!' }]} >
                        <Select placeholder="Chọn tòa nhà để thêm phòng" loading={buildings.length === 0} onChange={handleDormChangeForAddRoom} allowClear >
                            {buildings.map(dorm => (<Option key={dorm?.id} value={dorm?.id}>{dorm?.dormName}</Option> ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="floor" label="Tầng" rules={[{ required: true, message: 'Chọn tầng!' }]} >
                        <Select placeholder={selectedDormForAddRoom ? "Chọn tầng" : "Vui lòng chọn tòa nhà trước"} disabled={!selectedDormForAddRoom} >
                            {generateFloorOptions(selectedDormForAddRoom?.totalFloor)}
                        </Select>
                    </Form.Item>
                    <Form.Item name="roomNumber" label="Số phòng" rules={[{ required: true, message: 'Nhập số phòng!' }]} ><Input placeholder="Ví dụ: A101, 503..." /></Form.Item>
                    <Form.Item name="totalSlot" label="Loại phòng (Số giường)" rules={[{ required: true, message: 'Chọn loại phòng!' }]} >
                        <Select placeholder="Chọn loại phòng" loading={isPricingLoading}>
                            {pricings.map(p => ( <Option key={p?.id} value={p?.totalSlot}> {p?.totalSlot} giường ({p?.price?.toLocaleString('vi-VN') || 'N/A'} VND)</Option> ))}
                        </Select>
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginTop: 24 }}><Space><Button onClick={handleCancelAddSingleRoom}> Hủy </Button><Button type="primary" htmlType="submit" loading={isAddingSingleRoom}> Thêm phòng </Button></Space></Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
}

// === Hàm generateFloorOptions (đặt bên ngoài component) ===
const generateFloorOptions = (totalFloors) => {
    const options = [];
    if (typeof totalFloors === 'number' && totalFloors > 0) {
        for (let i = 1; i <= totalFloors; i++) {
            options.push(<Option key={i} value={i}>{`Tầng ${i}`}</Option>);
        }
    }
    return options;
};