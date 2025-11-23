import React, { useEffect, useState } from 'react';
import {
    Layout, Typography, Row, Col, Table, Input, Select, Tag, Space, message
} from 'antd';
import {
    SearchOutlined, EyeOutlined,
} from "@ant-design/icons";
import { Link } from 'react-router-dom';

// Import SideBar đã sửa thành GuardSidebar
import { GuardSidebar } from '../../../components/layout/GuardSidebar.jsx';
// Import axiosClient
import axiosClient from '../../../api/axiosClient/axiosClient.js';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// === HÀM HỖ TRỢ: Tạo option tầng ===
const generateFloorOptions = (totalFloors) => {
    const options = [];
    if (typeof totalFloors === 'number' && totalFloors > 0) {
        for (let i = 1; i <= totalFloors; i++) { options.push(<Option key={i} value={i}>{`Tầng ${i}`}</Option>); }
    }
    return options;
};

// === CỘT BẢNG PHÒNG CHÍNH (CHỈ XEM) ===
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
        render: (text) => <span style={{ fontWeight: 'bold' }}>{text || 'N/A'}</span>,
    },
    {
        title: 'Số người (Hiện tại/Tối đa)',
        key: 'occupancy',
        render: (text, record) => {
            const totalSlot = record?.totalSlot ?? record?.pricing?.totalSlot ?? 0;
            // Đếm trực tiếp các slot có trạng thái KHÁC "AVAILABLE"
            const currentResidents = record?.slots?.filter(slot => slot?.status !== "AVAILABLE").length ?? 0;
            return <span>{currentResidents} / {totalSlot}</span>;
        },
    },
    {
        title: 'Trạng thái',
        key: 'status',
        render: (text, record) => {
            const totalSlot = record?.totalSlot ?? record?.pricing?.totalSlot ?? 0;
            const availableSlotCount = record?.slots?.filter(slot => slot?.status === "AVAILABLE").length ?? 0;
            const isFull = totalSlot > 0 && availableSlotCount === 0;

            const statusText = isFull ? 'Đã đầy' : 'Còn chỗ';
            return <Tag color={isFull ? 'red' : 'green'}>{statusText.toUpperCase()}</Tag>;
        }
    },
    {
        title: 'Hành động',
        key: 'action',
    },
];

// --- COMPONENT CHÍNH ---
export function RoomInfoGuard() {
    // (States chung)
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'guard-rooms';
    const [buildings, setBuildings] = useState([]);
    const [roomData, setRoomData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    // (State Filter)
    const [filterBuildingId, setFilterBuildingId] = useState(undefined);
    const [selectedBuildingInfo, setSelectedBuildingInfo] = useState(null);
    const [filterFloor, setFilterFloor] = useState(undefined);
    const [searchText, setSearchText] = useState('');

    // (State Loading)
    const [isGettingRooms, setIsGettingRooms] = useState(false);
    const [isGettingBuildings, setIsGettingBuildings] = useState(false);


    // --- API CALLS ---
    const fetchBuildings = async () => {
        setIsGettingBuildings(true);
        try {
            const response = await axiosClient.get('/dorms');
            if (response && response.data) setBuildings(response.data);
        }
        catch (error) {
            message.error("Không thể tải danh sách tòa nhà!");
        } finally {
            setIsGettingBuildings(false);
        }
    };

    const fetchRooms = async (pageParams = {}) => {
        setIsGettingRooms(true);
        setRoomData([]);
        try {
            const params = {
                page: (pageParams.current - 1) || 0,
                size: pageParams.pageSize,
                dormId: filterBuildingId,
                floor: filterFloor,
                roomNumber: searchText
            };
            const response = await axiosClient.get('/rooms', { params });
            if (response && response.data && Array.isArray(response.data.content)) {
                const dataWithKey = response.data.content.filter(room => room && room.id).map(room => ({...room, key: room.id }));
                setRoomData(dataWithKey);
                setPagination(prev => ({
                    ...prev,
                    current: pageParams.current || 1,
                    pageSize: pageParams.pageSize,
                    total: response.data.totalElements
                }));
            } else {
                setRoomData([]);
                setPagination(prev => ({ ...prev, total: 0, current: 1 }));
            }
        } catch (error) {
            message.error("Không thể tải danh sách phòng!");
            setRoomData([]);
        } finally {
            setIsGettingRooms(false);
        }
    };

    useEffect(() => {
        fetchBuildings();
    }, []);

    // Logic: Khi filter thay đổi, reset page về 1
    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [filterBuildingId, filterFloor, searchText]);

    // Logic: Khi pagination.current hoặc filter thay đổi, fetch rooms
    useEffect(() => {
        fetchRooms(pagination);
    }, [pagination.current, pagination.pageSize, filterBuildingId, filterFloor, searchText]);

    const handleTableChange = (newPagination) => setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));

    // --- Handlers Logic ---
    const handleFilterBuildingChange = (dormId) => {
        setFilterBuildingId(dormId);
        const selectedBuilding = buildings.find(b => b.id === dormId);
        setSelectedBuildingInfo(selectedBuilding);
        setFilterFloor(undefined); // Reset tầng khi chọn tòa nhà mới
    };

    // Cột động: Loại bỏ nút Sửa, chỉ giữ lại nút Xem chi tiết
    const finalRoomColumns = roomColumns.map(col => {
        if (col.key === 'dormName') return { ...col, filters: buildings.map(b => ({ text: b.dormName, value: b.id })) };
        if (col.key === 'action') return {
            ...col,
            render: (text, record) => (
                <Space size="middle">
                    {/* NÚT XEM CHI TIẾT DẠNG ICON */}
                    {/* Link đến trang chi tiết phòng cho Bảo vệ (Giả định path là /guard/room-detail) */}
                    <Link to={`/guard/room-detail/${record.id}`}>
                        <EyeOutlined
                            style={{ fontSize: '18px', color: '#1890ff' }}
                            title="Xem chi tiết phòng"
                        />
                    </Link>
                </Space>
            )
        };
        return col;
    });

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <GuardSidebar collapsed={collapsed} active={activeKey} />
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}> Quản lý ký túc xá / Thông tin phòng (Bảo vệ) </Title>
                </Header>
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
                    {/* Filter */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 20 }} justify="start" align="middle">
                        <Col><Space wrap>
                            <Select placeholder="Tòa nhà" style={{ width: 120 }} value={filterBuildingId} onChange={handleFilterBuildingChange} allowClear onClear={() => handleFilterBuildingChange(undefined)} loading={isGettingBuildings}>
                                {buildings.map(b => (<Option key={b?.id} value={b?.id}>{b?.dormName}</Option>))}
                            </Select>
                            <Select placeholder="Tầng" style={{ width: 100 }} value={filterFloor} onChange={setFilterFloor} allowClear disabled={!selectedBuildingInfo}>
                                {generateFloorOptions(selectedBuildingInfo?.totalFloor)}
                            </Select>
                            <Input placeholder="Tìm kiếm Số phòng..." prefix={<SearchOutlined />} style={{ width: 250 }} onChange={(e) => setSearchText(e.target.value)} />
                        </Space> </Col>
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
        </Layout>
    );
}