import React, {useEffect, useState} from 'react';
import {
    Layout, Typography, Row, Col, Table, Input, Select, Button, Tag, Space,
    Modal, Form, message, InputNumber
} from 'antd';
import {
    SearchOutlined, EditOutlined, PlusOutlined, DollarCircleOutlined,
    EyeOutlined, LogoutOutlined, MenuOutlined
} from "@ant-design/icons";
import { Link, useNavigate } from 'react-router-dom';

// Import SideBarManager
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';
// Import Component quản lý giá mới
import { RoomPricingModal } from './RoomPricingModal.jsx';
// Import AppHeader (Giả định path đúng)
import { AppHeader } from '../../../components/layout/AppHeader.jsx';
// Thêm import hook quản lý state global (Giả định hook này có tồn tại)
import { useCollapsed } from '../../../hooks/useCollapsed.js';

// Import axiosClient
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// === CỘT BẢNG PHÒNG CHÍNH ===
const roomColumns = [
    {
        title: 'STT',
        key: 'stt',
        render: (text, record, index) => index + 1,
        width: 60,
    },
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
        render: (text) => <span>{text || 'N/A'}</span>,
    },
    {
        title: 'Số slot tối đa',
        key: 'maxOccupancy',
        render: (text, record) => {
            const totalSlot = record?.totalSlot ?? record?.pricing?.totalSlot ?? 0;
            return <span>{totalSlot}</span>;
        },
    },
    {
        title: 'Hành động',
        key: 'action',
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
    // === SỬ DỤNG HOOK GLOBAL CHO COLLAPSED (THAY THẾ useState) ===
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);

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
    // ➡️ BỔ SUNG STATE CHO SỐ SLOT TỐI ĐA
    const [filterMaxSlot, setFilterMaxSlot] = useState(undefined);

    // (State Loading)
    const [isGettingRooms, setIsGettingRooms] = useState(false);
    const [isCreatingBuilding, setIsCreatingBuilding] = useState(false);
    const [isUpdatingRoom, setIsUpdatingRoom] = useState(false);
    const [isAddingSingleRoom, setIsAddingSingleRoom] = useState(false);

    // (State Modal)
    const [isAddBuildingModalVisible, setIsAddBuildingModalVisible] = useState(false);
    const [isPricingModalVisible, setIsPricingModalVisible] = useState(false);
    const [isEditRoomModalVisible, setIsEditRoomModalVisible] = useState(false);
    const [isAddSingleRoomModalVisible, setIsAddSingleRoomModalVisible] = useState(false);

    // (State Form)
    const [formBuilding] = Form.useForm();
    const [formEditRoom] = Form.useForm();
    const [formAddSingleRoom] = Form.useForm();

    // (State Editing & Selection)
    const [editingRoom, setEditingRoom] = useState(null);
    const [selectedDormForAddRoom, setSelectedDormForAddRoom] = useState(null);

    const navigate = useNavigate();

    // === LOGIC LOGOUT VÀ TOGGLE SIDEBAR ===
    const handleLogout = () => {
        localStorage.removeItem('token');
        message.success('Đã đăng xuất thành công!');
        navigate('/');
    };
    const toggleSideBar = () => {
        // Hàm này gọi setCollapsed từ hook global
        setCollapsed(prev => !prev);
    }
    // === KẾT THÚC LOGIC LOGOUT VÀ TOGGLE ===


    // --- API CALLS ---
    const fetchPricings = async () => {
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
            // ➡️ CẬP NHẬT PARAMS ĐỂ THÊM filterMaxSlot
            const params = {
                page: pageParams.current - 1,
                size: pageParams.pageSize,
                dormId: filterBuildingId,
                floor: filterFloor,
                roomNumber: searchText,
                totalSlot: filterMaxSlot // 💡 THÊM THAM SỐ LỌC NÀY
            };
            const response = await axiosClient.get('/rooms', { params });
            if (response && response.data && Array.isArray(response.data.content)) {
                const dataWithKey = response.data.content.filter(room => room && room.id).map(room => ({...room, key: room.id }));
                setRoomData(dataWithKey); setPagination(prev => ({ ...prev, current: pageParams.current, pageSize: pageParams.pageSize, total: response.data.totalElements }));
            } else { setRoomData([]); setPagination(prev => ({ ...prev, total: 0, current: 1 })); }
        } catch (error) { message.error("Không thể tải danh sách phòng!"); setRoomData([]); }
        finally { setIsGettingRooms(false); }
    };

    useEffect(() => { fetchBuildings(); fetchPricings(); }, []);

    // ➡️ CẬP NHẬT useEffect để lắng nghe thay đổi của filterMaxSlot
    useEffect(() => { fetchRooms(pagination); }, [filterBuildingId, filterFloor, searchText, filterMaxSlot, pagination.current, pagination.pageSize]);

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
            setIsAddBuildingModalVisible(false);
            formBuilding.resetFields();
            fetchBuildings();
        } catch (error) {
            console.error(error);
            message.error("Tạo tòa nhà thất bại!");
        } finally {
            setIsCreatingBuilding(false);
        }
    };

    // Modal SỬA PHÒNG
    const handleShowEditRoomModal = (roomRecord) => {
        setEditingRoom(roomRecord);
        const currentTotalSlot = roomRecord?.totalSlot ?? roomRecord?.pricing?.totalSlot;
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
        if (col.key === 'action') return {
            ...col,
            render: (text, record) => (
                <Space size="middle">
                    {/* NÚT XEM CHI TIẾT DẠNG ICON */}
                    <Link to={`/manager/room-detail/${record.id}`}>
                        <Button
                            icon={<EyeOutlined />}
                            title="Xem chi tiết phòng"
                            type="text" // Sử dụng type="text" để loại bỏ màu nền và chỉ hiển thị icon
                        />
                    </Link>
                    {/* Nút chỉnh sửa phòng */}
                    <Button
                        icon={<EditOutlined />}
                        title="Chỉnh sửa phòng"
                        onClick={() => handleShowEditRoomModal(record)}
                    />
                </Space>
            )
        };
        return col;
    });

    return (
        <RequireRole role = "MANAGER">
            <Layout style={{ minHeight: '100vh' }}>
                {/* SideBarManager sử dụng state global */}
                <SideBarManager collapsed={collapsed} active={activeKey} />
                <Layout>
                    {/* AppHeader gọi hàm toggleSideBar global */}
                    <AppHeader
                        header={"Quản lý ký túc xá / Thông tin phòng"}
                        toggleSideBar={toggleSideBar}
                    />
                    <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                        {/* Filter Buttons */}
                        <Row gutter={[16, 16]} style={{ marginBottom: 20 }} justify="space-between" align="middle">
                            <Col><Space wrap>
                                {/* Bộ lọc Tòa nhà */}
                                <Select
                                    placeholder="Tòa nhà"
                                    style={{ width: 120 }}
                                    value={filterBuildingId}
                                    onChange={handleFilterBuildingChange}
                                    allowClear
                                    onClear={() => handleFilterBuildingChange(undefined)}
                                >
                                    {buildings.map(b => (<Option key={b?.id} value={b?.id}>{b?.dormName}</Option>))}
                                </Select>

                                {/* Bộ lọc Tầng */}
                                <Select
                                    placeholder="Tầng"
                                    style={{ width: 100 }}
                                    value={filterFloor}
                                    onChange={setFilterFloor}
                                    allowClear
                                    disabled={!selectedBuildingInfo}
                                >
                                    {generateFloorOptions(selectedBuildingInfo?.totalFloor)}
                                </Select>

                                {/* ➡️ BỘ LỌC SỐ SLOT TỐI ĐA MỚI */}
                                <Select
                                    placeholder="Số Slot Tối đa"
                                    style={{ width: 150 }}
                                    value={filterMaxSlot}
                                    onChange={setFilterMaxSlot}
                                    allowClear
                                    onClear={() => setFilterMaxSlot(undefined)}
                                >
                                    {/* Lấy danh sách Slot từ Pricings */}
                                    {pricings
                                        .map(p => p.totalSlot)
                                        .filter((value, index, self) => self.indexOf(value) === index) // Lọc giá trị duy nhất
                                        .map(slot => (
                                            <Option key={`slot-${slot}`} value={slot}>{slot} Slots</Option>
                                        ))
                                    }
                                </Select>

                                {/* Tìm kiếm Số phòng */}
                                <Input
                                    placeholder="Tìm kiếm Số phòng..."
                                    prefix={<SearchOutlined />}
                                    style={{ width: 250 }}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </Space> </Col>
                            <Col><Space>
                                <Button icon={<DollarCircleOutlined />} onClick={() => setIsPricingModalVisible(true)}>Quản lý giá phòng</Button>
                                <Button icon={<PlusOutlined />} onClick={() => setIsAddSingleRoomModalVisible(true)}>Thêm phòng lẻ</Button>
                                {/* === NÚT THÊM TÒA NHÀ === */}
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => {
                                        formBuilding.resetFields();
                                        setIsAddBuildingModalVisible(true);
                                    }}
                                >
                                    Thêm tòa nhà
                                </Button>
                            </Space></Col>
                        </Row>

                        {/* MAIN TABLE */}
                        <Table
                            loading={isGettingRooms}
                            columns={finalRoomColumns}
                            dataSource={roomData}
                            onChange={handleTableChange}
                            pagination={{...pagination, showSizeChanger: true}}
                            bordered
                        />
                    </Content>
                </Layout>

                {/* === MODAL 1: COMPONENT QUẢN LÝ GIÁ (MỚI) === */}
                <RoomPricingModal
                    open={isPricingModalVisible}
                    onCancel={() => setIsPricingModalVisible(false)}
                    onDataChange={() => fetchPricings()}
                />

                {/* === MODAL 2: THÊM TÒA NHÀ === */}
                <Modal
                    title="Thêm tòa nhà mới"
                    open={isAddBuildingModalVisible}
                    onOk={handleOkBuilding}
                    onCancel={() => setIsAddBuildingModalVisible(false)}
                    confirmLoading={isCreatingBuilding}
                >
                    <Form form={formBuilding} layout="vertical">
                        <Form.Item
                            name="dormName"
                            label="Tên tòa nhà"
                            rules={[{ required: true, message: 'Vui lòng nhập tên tòa nhà!' }]}
                        >
                            <Input placeholder="Ví dụ: A5..." />
                        </Form.Item>
                        <Form.Item
                            name="totalFloor"
                            label="Tổng số tầng"
                            rules={[{ required: true, message: 'Vui lòng nhập số tầng!' }, { type: 'number', min: 1, message: 'Phải lớn hơn 0' }]}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Modal 3: Sửa Phòng */}
                <Modal title={`Chỉnh sửa phòng ${editingRoom?.roomNumber || ''}`} open={isEditRoomModalVisible} onOk={handleOkEditRoom} onCancel={() => setIsEditRoomModalVisible(false)} confirmLoading={isUpdatingRoom} destroyOnClose>
                    <Form form={formEditRoom} layout="vertical">
                        <Form.Item name="totalSlot" label="Loại phòng (Số giường tối đa)" rules={[{ required: true }]}>
                            <Select placeholder="Chọn số giường mới">
                                {pricings.map(p => ( <Option key={p?.id} value={p?.totalSlot}>{p?.totalSlot} giường ({p?.price?.toLocaleString('vi-VN')} VND)</Option>))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Modal 4: Thêm Phòng Lẻ */}
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
        </RequireRole>
    );
}