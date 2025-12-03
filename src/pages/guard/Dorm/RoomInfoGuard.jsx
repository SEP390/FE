// File: RoomInfoGuard.jsx

import React, { useEffect, useState, useCallback } from 'react';
import {
    Layout, Row, Col, Table, Input, Select, Space, message
} from 'antd';
import {
    SearchOutlined, EyeOutlined
} from "@ant-design/icons";
import { Link } from 'react-router-dom';

import { GuardSidebar } from '../../../components/layout/GuardSidebar.jsx';
import { AppHeader } from '../../../components/layout/AppHeader.jsx';
import { useCollapsed } from '../../../hooks/useCollapsed.js';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import { RequireRole } from "../../../components/authorize/RequireRole.jsx";

const { Content } = Layout;
const { Option } = Select;

// ... (Giữ nguyên các hàm hỗ trợ và roomColumns) ...
const generateFloorOptions = (totalFloors) => {
    const options = [];
    if (typeof totalFloors === 'number' && totalFloors > 0) {
        for (let i = 1; i <= totalFloors; i++) { options.push(<Option key={i} value={i}>{`Tầng ${i}`}</Option>); }
    }
    return options;
};

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

export function RoomInfoGuard() {
    // ... (Giữ nguyên toàn bộ logic states, useEffect, handlers) ...
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);
    const activeKey = 'guard-rooms';
    const [buildings, setBuildings] = useState([]);
    const [roomData, setRoomData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    const [filterBuildingId, setFilterBuildingId] = useState(undefined);
    const [selectedBuildingInfo, setSelectedBuildingInfo] = useState(null);
    const [filterFloor, setFilterFloor] = useState(undefined);
    const [searchText, setSearchText] = useState('');

    const [isGettingRooms, setIsGettingRooms] = useState(false);
    const [isGettingBuildings, setIsGettingBuildings] = useState(false);

     // useCollapsed.setCollapsed expects a boolean value.
     // Passing a function (prev => !prev) would set the collapsed state to a function
     // which can cause layout calculations to behave incorrectly. Use the current
     // `collapsed` value to compute the new boolean state instead.
     const toggleSideBar = () => { setCollapsed(!collapsed); }

     const fetchBuildings = async () => {
         setIsGettingBuildings(true);
         try {
             const response = await axiosClient.get('/dorms');
             if (response && response.data) setBuildings(response.data);
         } catch (error) {
             console.error(error);
             message.error("Không thể tải danh sách tòa nhà!");
         } finally {
             setIsGettingBuildings(false);
         }
     };

    const fetchRooms = useCallback(async (pageParams = {}) => {
        setIsGettingRooms(true);
        setRoomData([]);
        try {
            const params = {
                page: (pageParams.current - 1) || 0,
                size: pageParams.pageSize,
                dormId: filterBuildingId,
                floor: filterFloor,
                roomNumber: searchText,
            };
            const response = await axiosClient.get('/rooms', { params });
            if (response && response.data && Array.isArray(response.data.content)) {
                const dataWithKey = response.data.content
                    .filter(room => room && room.id)
                    .map(room => ({ ...room, key: room.id }));
                setRoomData(dataWithKey);
                setPagination(prev => ({
                    ...prev,
                    current: pageParams.current || 1,
                    pageSize: pageParams.pageSize,
                    total: response.data.totalElements,
                }));
            } else {
                setRoomData([]);
                setPagination(prev => ({ ...prev, total: 0, current: 1 }));
            }
        } catch (error) {
            console.error(error);
            message.error("Không thể tải danh sách phòng!");
            setRoomData([]);
        } finally {
            setIsGettingRooms(false);
        }
    }, [filterBuildingId, filterFloor, searchText]);

    useEffect(() => { fetchBuildings(); }, []);
    useEffect(() => { setPagination(prev => ({ ...prev, current: 1 })); }, [filterBuildingId, filterFloor, searchText]);
    // call fetchRooms when pagination or filters change. fetchRooms is stable via useCallback.
    useEffect(() => { fetchRooms({ current: pagination.current, pageSize: pagination.pageSize }); }, [pagination.current, pagination.pageSize, fetchRooms]);

    const handleTableChange = (newPagination) => setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }));

    const handleFilterBuildingChange = (dormId) => {
        setFilterBuildingId(dormId);
        const selectedBuilding = buildings.find(b => b.id === dormId);
        setSelectedBuildingInfo(selectedBuilding);
        setFilterFloor(undefined);
    };

    const finalRoomColumns = roomColumns.map(col => {
        if (col.key === 'action') return {
            ...col,
            render: (text, record) => (
                <Space size="middle">
                    <Link to={`/guard/room-detail/${record.id}`}>
                        <EyeOutlined style={{ fontSize: '18px', color: '#1890ff' }} title="Xem chi tiết phòng" />
                    </Link>
                </Space>
            )
        };
        return col;
    });

    // Tính toán chiều rộng Sidebar
    const sidebarWidth = collapsed ? 80 : 260;

    return (
        <RequireRole role="GUARD">
            <Layout style={{ minHeight: '100vh' }}>
                {/* 1. Sidebar cố định */}
                <GuardSidebar collapsed={collapsed} active={activeKey} />

                {/* 2. Header cố định: Đưa ra ngoài Layout chuyển động để tránh lỗi render */}
                <AppHeader
                    header={"Quản lý ký túc xá / Thông tin phòng (Bảo vệ)"}
                    toggleSideBar={toggleSideBar}
                />

                {/* 3. Wrapper Layout: Chỉ đẩy nội dung sang phải */}
                <Layout
                    style={{
                        marginLeft: sidebarWidth,
                        // SỬA QUAN TRỌNG: Chỉ transition margin-left, KHÔNG dùng 'all'
                        transition: 'margin-left 0.3s ease',
                        minHeight: '100vh',
                    }}
                >
                    {/* 4. Content */}
                    <Content
                        style={{
                            // Bù trừ Header (64px) + Gap (24px) = 88px
                            paddingTop: 88,
                            paddingLeft: 24,
                            paddingRight: 24,
                            paddingBottom: 24,
                            background: '#f0f2f5',
                        }}
                    >
                        <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)' }}>
                            {/* Filter Buttons */}
                            <Row gutter={[16, 16]} style={{ marginBottom: 20 }} justify="start" align="middle">
                                <Col>
                                    <Space wrap>
                                        <Select placeholder="Tòa nhà" style={{ width: 120 }} value={filterBuildingId} onChange={handleFilterBuildingChange} allowClear onClear={() => handleFilterBuildingChange(undefined)} loading={isGettingBuildings}>
                                            {buildings.map(b => (<Option key={b?.id} value={b?.id}>{b?.dormName}</Option>))}
                                        </Select>
                                        <Select placeholder="Tầng" style={{ width: 100 }} value={filterFloor} onChange={setFilterFloor} allowClear disabled={!selectedBuildingInfo}>
                                            {generateFloorOptions(selectedBuildingInfo?.totalFloor)}
                                        </Select>
                                        <Input placeholder="Tìm kiếm Số phòng..." prefix={<SearchOutlined />} style={{ width: 250 }} onChange={(e) => setSearchText(e.target.value)} />
                                    </Space>
                                </Col>
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
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </RequireRole>
    );
}