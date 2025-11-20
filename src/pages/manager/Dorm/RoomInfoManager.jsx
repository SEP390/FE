import React, {useEffect, useState} from 'react';
import {
    Layout, Typography, Row, Col, Table, Input, Select, Button, Tag, Space,
    Modal, Form, message, InputNumber
} from 'antd';
import {
    SearchOutlined, EditOutlined, PlusOutlined, DollarCircleOutlined
} from "@ant-design/icons";
import { Link } from 'react-router-dom';

// Import SideBarManager
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';
// Import Component quản lý giá mới (Nhớ chỉnh đường dẫn cho đúng vị trí file bạn tạo ở trên)
import { RoomPricingModal } from './RoomPricingModal.jsx';

// Import axiosClient
import axiosClient from '../../../api/axiosClient/axiosClient.js';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// === CỘT BẢNG PHÒNG CHÍNH ===
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
        // Render sẽ được gán đè ở logic bên dưới
        render: () => null,
    },
];

// === Component Helper: Tạo option tầng ===
const generateFloorOptions = (totalFloors) => {
    const options = [];
    if (typeof totalFloors === 'number' && totalFloors > 0) {
        for (let i = 1; i <= totalFloors; i++) { options.push(<Option key={i} value={i}>{`Tầng ${i}`}</Option>); }
    }
    return options;
};

// --- COMPONENT CHÍNH ---
export function RoomInfoManager() {
    // (States chung)
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'manager-rooms';
    const [buildings, setBuildings] = useState([]);
    const [roomData, setRoomData] = useState([]);
    const [pricings, setPricings] = useState([]); // Vẫn cần state này để hiển thị Dropdown chọn giá
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    // (State Filter)
    const [filterBuildingId, setFilterBuildingId] = useState(undefined);
    const [selectedBuildingInfo, setSelectedBuildingInfo] = useState(null);
    const [filterFloor, setFilterFloor] = useState(undefined);
    const [searchText, setSearchText] = useState('');

    // (State Loading)
    const [isGettingRooms, setIsGettingRooms] = useState(false);
    const [isCreatingBuilding, setIsCreatingBuilding] = useState(false);
    const [isUpdatingRoom, setIsUpdatingRoom] = useState(false);
    const [isAddingSingleRoom, setIsAddingSingleRoom] = useState(false);

    // (State Modal)
    const [isAddBuildingModalVisible, setIsAddBuildingModalVisible] = useState(false);
    const [isPricingModalVisible, setIsPricingModalVisible] = useState(false); // Chỉ cần toggle modal này
    const [isEditRoomModalVisible, setIsEditRoomModalVisible] = useState(false);
    const [isAddSingleRoomModalVisible, setIsAddSingleRoomModalVisible] = useState(false);

    // (State Form)
    const [formBuilding] = Form.useForm();
    const [formEditRoom] = Form.useForm();
    const [formAddSingleRoom] = Form.useForm();

    // (State Editing & Selection)
    const [editingRoom, setEditingRoom] = useState(null);
    const [selectedDormForAddRoom, setSelectedDormForAddRoom] = useState(null);

    // --- API CALLS ---
    const fetchPricings = async () => {
        // Hàm này vẫn cần để lấy data nạp vào <Select> khi Sửa phòng/Thêm phòng
        try { const response = await axiosClient.get('/pricing'); if (response && response.data) setPricings(response.data); }
        catch (error) { console.error("Lỗi tải giá:", error); }
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
            } else { setRoomData([]); setPagination(prev => ({ ...prev, total: 0, current: 1 })); }
        } catch (error) { message.error("Không thể tải danh sách phòng!"); setRoomData([]); }
        finally { setIsGettingRooms(false); }
    };

    useEffect(() => { fetchBuildings(); fetchPricings(); }, []);
    useEffect(() => { fetchRooms(pagination); }, [filterBuildingId, filterFloor, searchText, pagination.current, pagination.pageSize]);

    const handleTableChange = (newPagination) => setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));

    // --- Handlers Logic ---
    const handleFilterBuildingChange = (dormId) => {
        setFilterBuildingId(dormId); const selectedBuilding = buildings.find(b => b.id === dormId);
        setSelectedBuildingInfo(selectedBuilding); setFilterFloor(undefined);
    };

    // Modal TÒA NHÀ
    const handleOkBuilding = async () => {
        try {
            const values = await formBuilding.validateFields();
            setIsCreatingBuilding(true);
            await axiosClient.post('/dorms', { dormName: values.dormName, totalFloor: values.totalFloor });
            message.success(`Đã tạo tòa nhà "${values.dormName}"!`);
            setIsAddBuildingModalVisible(false); formBuilding.resetFields(); fetchBuildings();
        } catch (error) { message.error("Tạo tòa nhà thất bại!"); } finally { setIsCreatingBuilding(false); }
    };

    // Modal SỬA PHÒNG
    const handleShowEditRoomModal = (roomRecord) => {
        setEditingRoom(roomRecord);
        const currentTotalSlot = roomRecord?.totalSlot ?? record?.pricing?.totalSlot;
        formEditRoom.setFieldsValue({ totalSlot: currentTotalSlot });
        setIsEditRoomModalVisible(true);
    };
    const handleOkEditRoom = async () => {
        if (!editingRoom) return;
        try {
            const values = await formEditRoom.validateFields();
            setIsUpdatingRoom(true);
            await axiosClient.post(`/rooms/${editingRoom.id}`, {
                floor: editingRoom.floor,
                roomNumber: editingRoom.roomNumber,
                totalSlot: values.totalSlot
            });
            message.success(`Đã cập nhật phòng ${editingRoom.roomNumber}!`);
            setIsEditRoomModalVisible(false); setEditingRoom(null); fetchRooms(pagination);
        } catch (error) { message.error("Cập nhật phòng thất bại!"); } finally { setIsUpdatingRoom(false); }
    };

    // Modal THÊM PHÒNG LẺ
    const handleDormChangeForAddRoom = (dormId) => {
        const selectedDorm = buildings.find(dorm => dorm.id === dormId);
        setSelectedDormForAddRoom(selectedDorm); formAddSingleRoom.setFieldsValue({ floor: undefined });
    };
    const handleAddSingleRoom = async (values) => {
        const { dormId, ...roomDataPayload } = values;
        setIsAddingSingleRoom(true);
        try {
            await axiosClient.post(`/dorms/${dormId}/room`, roomDataPayload);
            message.success(`Đã thêm phòng ${roomDataPayload.roomNumber}!`);
            setIsAddSingleRoomModalVisible(false); formAddSingleRoom.resetFields(); fetchRooms(pagination);
        } catch (error) { message.error("Thêm phòng thất bại!"); } finally { setIsAddingSingleRoom(false); }
    };

    // Cột động
    const finalRoomColumns = roomColumns.map(col => {
        if (col.key === 'dormName') return { ...col, filters: buildings.map(b => ({ text: b.dormName, value: b.id })) };
        if (col.key === 'action') return { ...col, render: (text, record) => ( <Space size="middle"> <Button icon={<EditOutlined />} title="Chỉnh sửa phòng" onClick={() => handleShowEditRoomModal(record)} /> </Space> ) };
        return col;
    });

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarManager collapsed={collapsed} active={activeKey} />
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}> <Title level={2} style={{ margin: 0, lineHeight: '80px' }}> Quản lý ký túc xá / Thông tin phòng </Title> </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                    {/* Filter Buttons */}
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
                        <Col><Space>
                            <Button icon={<DollarCircleOutlined />} onClick={() => setIsPricingModalVisible(true)}>Quản lý giá phòng</Button>
                            <Button icon={<PlusOutlined />} onClick={() => setIsAddSingleRoomModalVisible(true)}>Thêm phòng lẻ</Button>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddBuildingModalVisible(true)}>Thêm tòa nhà</Button>
                        </Space></Col>
                    </Row>

                    {/* MAIN TABLE */}
                    <Table loading={isGettingRooms} columns={finalRoomColumns} dataSource={roomData} onChange={handleTableChange} pagination={{...pagination, showSizeChanger: true}} bordered />
                </Content>
            </Layout>

            {/* === MODAL 1: COMPONENT QUẢN LÝ GIÁ (MỚI) === */}
            <RoomPricingModal
                open={isPricingModalVisible}
                onCancel={() => setIsPricingModalVisible(false)}
                onDataChange={() => fetchPricings()} // Khi modal thay đổi giá, load lại list pricings cho các Select bên dưới
            />

            {/* Modal 2: Thêm Tòa Nhà (Giữ nguyên) */}
            <Modal title="Thêm tòa nhà mới" open={isAddBuildingModalVisible} onOk={handleOkBuilding} onCancel={() => setIsAddBuildingModalVisible(false)} confirmLoading={isCreatingBuilding} destroyOnClose>
                <Form form={formBuilding} layout="vertical">
                    <Form.Item name="dormName" label="Tên tòa nhà" rules={[{ required: true }]}> <Input placeholder="Ví dụ: A5..." /> </Form.Item>
                    <Form.Item name="totalFloor" label="Tổng số tầng" rules={[{ required: true }, { type: 'number', min: 1 }]}> <InputNumber min={1} style={{ width: '100%' }} /> </Form.Item>
                </Form>
            </Modal>

            {/* Modal 3: Sửa Phòng (Giữ nguyên) */}
            <Modal title={`Chỉnh sửa phòng ${editingRoom?.roomNumber || ''}`} open={isEditRoomModalVisible} onOk={handleOkEditRoom} onCancel={() => setIsEditRoomModalVisible(false)} confirmLoading={isUpdatingRoom} destroyOnClose>
                <Form form={formEditRoom} layout="vertical">
                    <Form.Item name="totalSlot" label="Loại phòng (Số giường tối đa)" rules={[{ required: true }]}>
                        <Select placeholder="Chọn số giường mới">
                            {pricings.map(p => ( <Option key={p?.id} value={p?.totalSlot}>{p?.totalSlot} giường ({p?.price?.toLocaleString('vi-VN')} VND)</Option>))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal 4: Thêm Phòng Lẻ (Giữ nguyên) */}
            <Modal title="Thêm phòng lẻ" open={isAddSingleRoomModalVisible} onCancel={() => setIsAddSingleRoomModalVisible(false)} footer={null} destroyOnClose >
                <Form form={formAddSingleRoom} layout="vertical" onFinish={handleAddSingleRoom}>
                    <Form.Item name="dormId" label="Tòa nhà" rules={[{ required: true }]} >
                        <Select onChange={handleDormChangeForAddRoom} allowClear >{buildings.map(dorm => (<Option key={dorm?.id} value={dorm?.id}>{dorm?.dormName}</Option> ))}</Select>
                    </Form.Item>
                    <Form.Item name="floor" label="Tầng" rules={[{ required: true }]} >
                        <Select disabled={!selectedDormForAddRoom} >{generateFloorOptions(selectedDormForAddRoom?.totalFloor)}</Select>
                    </Form.Item>
                    <Form.Item name="roomNumber" label="Số phòng" rules={[{ required: true }]} ><Input placeholder="Ví dụ: A101..." /></Form.Item>
                    <Form.Item name="totalSlot" label="Loại phòng" rules={[{ required: true }]} >
                        <Select>{pricings.map(p => ( <Option key={p?.id} value={p?.totalSlot}> {p?.totalSlot} giường ({p?.price?.toLocaleString('vi-VN')} VND)</Option> ))}</Select>
                    </Form.Item>
                    <div style={{textAlign: 'right', marginTop: 10}}><Button type="primary" htmlType="submit" loading={isAddingSingleRoom}>Thêm</Button></div>
                </Form>
            </Modal>
        </Layout>
    );
}