import React, {useEffect, useState} from 'react';
import {
    Layout, Typography, Row, Col, Table, Input, Select, Button, Tag, Space,
    Modal, Form, InputNumber, App, Tooltip
} from 'antd';
import {
    SearchOutlined, EditOutlined, PlusOutlined, DollarCircleOutlined,
    EyeOutlined, LogoutOutlined
} from "@ant-design/icons";
import { Link, useNavigate } from 'react-router-dom';

// Import SideBarManager (Giả định path đúng)
import { SideBarManager } from '../../../components/layout/SideBarManger.jsx';
// Import Component quản lý giá mới (Giả định path đúng)
import { RoomPricingModal } from './RoomPricingModal.jsx';
// Import AppHeader (Giả định path đúng)
import { AppHeader } from '../../../components/layout/AppHeader.jsx';
// Import hook quản lý state global (Giả định hook này có tồn tại)
import { useCollapsed } from '../../../hooks/useCollapsed.js';

// Import axiosClient
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";

const { Content } = Layout;
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
            return <Tag color="blue">{totalSlot} Slots</Tag>;
        },
    },
    {
        title: 'Hành động',
        key: 'action',
        width: 100,
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
    // === HOOK GLOBAL VÀ ANTD CONTEXT ===
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);
    const { message } = App.useApp();

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
    const [filterMaxSlot, setFilterMaxSlot] = useState(undefined);

    // (State Loading & Modal)
    const [isGettingRooms, setIsGettingRooms] = useState(false);
    const [isCreatingBuilding, setIsCreatingBuilding] = useState(false);
    const [isUpdatingRoom, setIsUpdatingRoom] = useState(false);
    const [isAddingSingleRoom, setIsAddingSingleRoom] = useState(false);
    const [isAddBuildingModalVisible, setIsAddBuildingModalVisible] = useState(false); // Modal Quản lý Tòa nhà (Danh sách/Thêm)
    const [isEditBuildingModalVisible, setIsEditBuildingModalVisible] = useState(false); // Modal Sửa Tòa nhà <-- MỚI
    const [isPricingModalVisible, setIsPricingModalVisible] = useState(false);
    const [isEditRoomModalVisible, setIsEditRoomModalVisible] = useState(false);
    const [isAddSingleRoomModalVisible, setIsAddSingleRoomModalVisible] = useState(false);

    // (State Form)
    const [formBuilding] = Form.useForm(); // Sử dụng cho cả Thêm và Sửa Tòa nhà
    const [formEditRoom] = Form.useForm();
    const [formAddSingleRoom] = Form.useForm();

    // (State Editing & Selection)
    const [editingRoom, setEditingRoom] = useState(null);
    const [editingBuilding, setEditingBuilding] = useState(null); // <-- MỚI
    const [selectedDormForAddRoom, setSelectedDormForAddRoom] = useState(null);

    const navigate = useNavigate();

    // === LOGIC LOGOUT VÀ TOGGLE SIDEBAR ===
    const handleLogout = () => {
        localStorage.removeItem('token');
        message.success('Đã đăng xuất thành công!');
        navigate('/');
    };
    // === LOGIC TOGGLE SIDEBAR ===
    // useCollapsed.setCollapsed expects a boolean; pass the negated current value
    const toggleSideBar = () => { setCollapsed(!collapsed); }
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
            const params = {
                page: pageParams.current - 1,
                size: pageParams.pageSize,
                dormId: filterBuildingId,
                floor: filterFloor,
                roomNumber: searchText,
                totalSlot: filterMaxSlot
            };
            const response = await axiosClient.get('/rooms', { params });
            if (response && response.data && Array.isArray(response.data.content)) {
                const dataWithKey = response.data.content.filter(room => room && room.id).map(room => ({...room, key: room.id }));
                setRoomData(dataWithKey);
                setPagination(prev => ({ ...prev, current: pageParams.current, pageSize: pageParams.pageSize, total: response.data.totalElements }));
            } else { setRoomData([]); setPagination(prev => ({ ...prev, total: 0, current: 1 })); }
        } catch (error) { message.error("Không thể tải danh sách phòng!"); setRoomData([]); }
        finally { setIsGettingRooms(false); }
    };

    useEffect(() => { fetchBuildings(); fetchPricings(); }, []);

    // Logic lọc: Khi filter thay đổi, reset về trang 1
    useEffect(() => {
        if (pagination.current !== 1) {
            setPagination(prev => ({ ...prev, current: 1 }));
        } else {
            fetchRooms(pagination);
        }
    }, [filterBuildingId, filterFloor, searchText, filterMaxSlot]);

    // Lắng nghe khi thay đổi trang hoặc pageSize
    useEffect(() => {
        fetchRooms(pagination);
    }, [pagination.current, pagination.pageSize]);

    const handleTableChange = (newPagination) => setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));

    // --- Handlers Logic ---
    const handleFilterBuildingChange = (dormId) => {
        setFilterBuildingId(dormId);
        const selectedBuilding = buildings.find(b => b.id === dormId);
        setSelectedBuildingInfo(selectedBuilding);
        setFilterFloor(undefined);
    };

    // Modal THÊM TÒA NHÀ
    const handleOkAddBuilding = async (values) => {
        try {
            setIsCreatingBuilding(true);
            await axiosClient.post('/dorms', { dormName: values.dormName, totalFloor: values.totalFloor });
            message.success(`Đã tạo tòa nhà "${values.dormName}"!`);
            formBuilding.resetFields();
            fetchBuildings();
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || "Lỗi không xác định khi tạo tòa nhà.";
            message.error(`Tạo tòa nhà thất bại! Chi tiết: ${errorMessage}`);
        } finally {
            setIsCreatingBuilding(false);
        }
    };

    // LOGIC SỬA TÒA NHÀ (MỚI)
    const handleShowEditBuildingModal = (buildingRecord) => {
        setEditingBuilding(buildingRecord);
        // Thiết lập giá trị cho formBuilding (vì nó được tái sử dụng)
        formBuilding.setFieldsValue({
            dormName: buildingRecord.dormName,
            totalFloor: buildingRecord.totalFloor
        });
        setIsEditBuildingModalVisible(true);
    };

    const handleOkEditBuilding = async () => {
        if (!editingBuilding) return;
        try {
            // Lấy values. TotalFloor vẫn được lấy dù bị disabled, miễn là nó đã được setFieldsValue
            const values = await formBuilding.validateFields();
            setIsCreatingBuilding(true);

            // Sử dụng endpoint POST /dorms/{id} để cập nhật
            await axiosClient.post(`/dorms/${editingBuilding.id}`, values);

            message.success(`Đã cập nhật tòa nhà "${values.dormName}"!`);
            setIsEditBuildingModalVisible(false);
            setIsAddBuildingModalVisible(false);
            setEditingBuilding(null);
            formBuilding.resetFields();
            fetchBuildings(); // Cập nhật lại danh sách tòa nhà
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi không xác định khi cập nhật tòa nhà.";
            message.error(`Cập nhật tòa nhà thất bại! Chi tiết: ${errorMessage}`);
        } finally {
            setIsCreatingBuilding(false);
        }
    };
    // KẾT THÚC LOGIC SỬA TÒA NHÀ

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
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi không xác định khi cập nhật phòng.";
            message.error(`Cập nhật phòng thất bại! Chi tiết: ${errorMessage}`);
        } finally { setIsUpdatingRoom(false); }
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
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Lỗi không xác định khi thêm phòng lẻ.";
            message.error(`Thêm phòng thất bại! Chi tiết: ${errorMessage}`);
        } finally { setIsAddingSingleRoom(false); }
    };

    // Cột động
    const finalRoomColumns = roomColumns.map(col => {
        if (col.key === 'action') return {
            ...col,
            render: (text, record) => (
                <Space size="middle">
                    {/* NÚT XEM CHI TIẾT DẠNG ICON */}
                    <Tooltip title="Xem chi tiết phòng">
                        <Link to={`/manager/room-detail/${record.id}`}>
                            <Button
                                icon={<EyeOutlined />}
                                type="text"
                            />
                        </Link>
                    </Tooltip>
                    {/* Nút chỉnh sửa phòng */}
                    <Tooltip title="Chỉnh sửa loại phòng (Số slot)">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleShowEditRoomModal(record)}
                        />
                    </Tooltip>
                </Space>
            )
        };
        return col;
    });

    return (
        <RequireRole role = "MANAGER">
            <Layout style={{ minHeight: '100vh' }}>
                <SideBarManager collapsed={collapsed} active={activeKey} />
                <Layout
                    // THÊM: Điều chỉnh margin cho Layout nội dung để bù đắp Sidebar cố định
                    style={{
                        marginTop: 64, // Bù đắp Header (H = 64px)
                        marginLeft: collapsed ? 80 : 260, // Bù đắp Sidebar
                        transition: 'margin-left 0.3s ease',
                    }}
                >
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

                                {/* BỘ LỌC SỐ SLOT TỐI ĐA */}
                                <Select
                                    placeholder="Số Slot Tối đa"
                                    style={{ width: 150 }}
                                    value={filterMaxSlot}
                                    onChange={setFilterMaxSlot}
                                    allowClear
                                    onClear={() => setFilterMaxSlot(undefined)}
                                >
                                    {pricings
                                        .map(p => p.totalSlot)
                                        .filter((value, index, self) => self.indexOf(value) === index)
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
                                {/* NÚT QUẢN LÝ TÒA NHÀ (Thêm và Sửa) */}
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        formBuilding.resetFields(); // Đảm bảo form sạch khi mở
                                        setIsAddBuildingModalVisible(true);
                                    }}
                                >
                                    Quản lý Tòa nhà
                                </Button>
                            </Space></Col>
                        </Row>

                        {/* MAIN TABLE */}
                        <Table
                            loading={isGettingRooms}
                            columns={finalRoomColumns}
                            dataSource={roomData}
                            onChange={handleTableChange}
                            pagination={{...pagination, showSizeChanger: true, pageSizeOptions: ['10', '20', '50']}}
                            bordered
                            size="middle"
                        />
                    </Content>
                </Layout>

                {/* === MODAL 1: COMPONENT QUẢN LÝ GIÁ === */}
                <RoomPricingModal
                    open={isPricingModalVisible}
                    onCancel={() => setIsPricingModalVisible(false)}
                    onDataChange={fetchPricings}
                />

                {/* === MODAL 2: QUẢN LÝ TÒA NHÀ (THÊM/SỬA) === */}
                <Modal
                    title="Quản lý Tòa nhà Ký túc xá"
                    open={isAddBuildingModalVisible}
                    onCancel={() => setIsAddBuildingModalVisible(false)}
                    footer={null}
                    destroyOnClose
                >
                    <div style={{ marginBottom: 16 }}>
                        <Typography.Title level={5}>Thêm Tòa nhà mới</Typography.Title>
                        {/* Tái sử dụng formBuilding cho việc thêm */}
                        <Form form={formBuilding} layout="inline" onFinish={handleOkAddBuilding} style={{ gap: 8 }}>
                            <Form.Item
                                name="dormName"
                                rules={[{ required: true, message: 'Tên!' }]}
                                style={{ flex: 1 }}
                            >
                                <Input placeholder="Tên tòa nhà (Ví dụ: A5)" />
                            </Form.Item>
                            <Form.Item
                                name="totalFloor"
                                rules={[{ required: true, message: 'Tầng!' }, { type: 'number', min: 1, message: '>=1' }]}
                                style={{ width: 100 }}
                            >
                                <InputNumber min={1} placeholder="Tầng" precision={0} />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={isCreatingBuilding} icon={<PlusOutlined />}>Thêm</Button>
                            </Form.Item>
                        </Form>
                    </div>

                    <Typography.Title level={5}>Chỉnh sửa Tòa nhà hiện có</Typography.Title>
                    <Table
                        dataSource={buildings}
                        columns={[
                            { title: 'Tên', dataIndex: 'dormName', key: 'dormName' },
                            { title: 'Số tầng', dataIndex: 'totalFloor', key: 'totalFloor', width: 100 },
                            {
                                title: 'Hành động',
                                key: 'action',
                                width: 80,
                                render: (text, record) => (
                                    <Tooltip title="Chỉnh sửa thông tin">
                                        <Button
                                            icon={<EditOutlined />}
                                            onClick={() => handleShowEditBuildingModal(record)}
                                            size="small"
                                        />
                                    </Tooltip>
                                )
                            }
                        ]}
                        pagination={false}
                        size="small"
                        rowKey="id"
                    />
                </Modal>

                {/* === MODAL 3: CHỈNH SỬA TÒA NHÀ (ĐÃ CHỈ CHO ĐỔI TÊN) === */}
                <Modal
                    title={`Chỉnh sửa Tòa nhà: ${editingBuilding?.dormName || ''}`}
                    open={isEditBuildingModalVisible}
                    onOk={handleOkEditBuilding}
                    onCancel={() => {
                        setIsEditBuildingModalVisible(false);
                        setEditingBuilding(null);
                        formBuilding.resetFields(); // Reset form sau khi đóng
                    }}
                    confirmLoading={isCreatingBuilding}
                    destroyOnClose
                >
                    <Form form={formBuilding} layout="vertical">
                        <Form.Item
                            name="dormName"
                            label="Tên tòa nhà"
                            rules={[{ required: true, message: 'Vui lòng nhập tên tòa nhà!' }]}
                        >
                            <Input placeholder="Ví dụ: A5 mới" />
                        </Form.Item>
                        <Form.Item
                            name="totalFloor"
                            label="Tổng số tầng"
                            rules={[{ required: true, message: 'Vui lòng nhập số tầng!' }, { type: 'number', min: 1, message: 'Phải lớn hơn 0' }]}
                        >
                            <InputNumber
                                min={1}
                                style={{ width: '100%' }}
                                precision={0}
                                disabled // <--- Đã vô hiệu hóa theo yêu cầu
                            />
                        </Form.Item>
                    </Form>
                </Modal>


                {/* Modal 4: Sửa Phòng (Cũ) */}
                <Modal
                    title={`Chỉnh sửa phòng ${editingRoom?.roomNumber || ''}`}
                    open={isEditRoomModalVisible}
                    onOk={handleOkEditRoom}
                    onCancel={() => setIsEditRoomModalVisible(false)}
                    confirmLoading={isUpdatingRoom}
                    destroyOnClose
                >
                    <Form form={formEditRoom} layout="vertical">
                        {/* ⚠️ DÒNG NOTE CẢNH BÁO */}
                        <div style={{ padding: '8px', marginBottom: '16px', border: '1px solid #faad14', backgroundColor: '#fffbe6', color: '#d46b08', borderRadius: '4px', fontWeight: 'bold' }}>
                            ⚠️ Chú ý: Phòng đã có sinh viên ở sẽ **không thể** thay đổi loại phòng (số giường tối đa). Vui lòng kiểm tra chi tiết phòng.
                        </div>

                        <Form.Item
                            name="totalSlot"
                            label="Loại phòng (Số giường tối đa)"
                            rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
                        >
                            <Select placeholder="Chọn số giường mới">
                                {pricings.map(p => (
                                    <Option key={p?.id} value={p?.totalSlot}>
                                        {p?.totalSlot} giường ({p?.price?.toLocaleString('vi-VN')} VND)
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Modal 5: Thêm Phòng Lẻ (Cũ) */}
                <Modal
                    title="Thêm phòng lẻ"
                    open={isAddSingleRoomModalVisible}
                    onCancel={() => setIsAddSingleRoomModalVisible(false)}
                    footer={null}
                    destroyOnClose
                >
                    <Form form={formAddSingleRoom} layout="vertical" onFinish={handleAddSingleRoom}>
                        <Form.Item name="dormId" label="Tòa nhà" rules={[{ required: true, message: 'Vui lòng chọn Tòa nhà!' }]} >
                            <Select onChange={handleDormChangeForAddRoom} allowClear >
                                {buildings.map(dorm => (<Option key={dorm?.id} value={dorm?.id}>{dorm?.dormName}</Option> ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="floor" label="Tầng" rules={[{ required: true, message: 'Vui lòng chọn Tầng!' }]} >
                            <Select disabled={!selectedDormForAddRoom} >
                                {generateFloorOptions(selectedDormForAddRoom?.totalFloor)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="roomNumber" label="Số phòng" rules={[{ required: true, message: 'Vui lòng nhập Số phòng!' }]} ><Input placeholder="Ví dụ: A101..." /></Form.Item>
                        <Form.Item name="totalSlot" label="Loại phòng" rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]} >
                            <Select>
                                {pricings.map(p => (
                                    <Option key={p?.id} value={p?.totalSlot}>
                                        {p?.totalSlot} giường ({p?.price?.toLocaleString('vi-VN')} VND)
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <div style={{textAlign: 'right', marginTop: 10}}><Button type="primary" htmlType="submit" loading={isAddingSingleRoom}>Thêm</Button></div>
                    </Form>
                </Modal>
            </Layout>
        </RequireRole>
    );
}