import React, {useEffect, useState} from 'react';
import { Layout, Typography, Row, Col, Table, Input, Select, Button, Tag, Space } from 'antd';
import { SearchOutlined, EditOutlined } from "@ant-design/icons";
// THÊM IMPORT LINK TỪ REACT-ROUTER-DOM
import { Link } from 'react-router-dom';

// Import SideBarManager từ file bạn đã có
import { SideBarManager } from '../../components/layout/SideBarManger';
import {useApiTest} from "../../hooks/useApiTest.js";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

// Định nghĩa các cột cho bảng (Cột Số phòng đã được cập nhật)
const columns = [
    {
        title: 'Tòa nhà',
        dataIndex: 'building',
        key: 'building',
        filters: [
            { text: 'A1', value: 'A1' },
            { text: 'B2', value: 'B2' },
            { text: 'C3', value: 'C3' },
        ],
        onFilter: (value, record) => record.building.indexOf(value) === 0,
        sorter: (a, b) => a.building.localeCompare(b.building),
    },
    {
        title: 'Tầng',
        dataIndex: 'floor',
        key: 'floor',
        sorter: (a, b) => a.floor - b.floor,
    },
    {
        title: 'Số phòng',
        dataIndex: 'roomNumber',
        key: 'roomNumber',
        // THAY ĐỔI LỚN NHẤT: Thêm Link để chuyển hướng sang trang chi tiết
        render: (text, record) => (
            <Link
                // Đường dẫn URL phải khớp với Route bạn đã định nghĩa cho RoomInforDetail
                to={`/manager/rooms/${record.roomNumber}`}
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
        render: (text, record) => (
            <span>
                {record.currentOccupants} / {record.maxCapacity}
            </span>
        ),
        sorter: (a, b) => (a.currentOccupants / a.maxCapacity) - (b.currentOccupants / b.maxCapacity),
    },
    {
        title: 'Trạng thái',
        key: 'status',
        dataIndex: 'status',
        render: (status) => (
            <Tag color={status === 'Đã đầy' ? 'red' : 'green'}>
                {status.toUpperCase()}
            </Tag>
        ),
        filters: [
            { text: 'Còn chỗ', value: 'Còn chỗ' },
            { text: 'Đã đầy', value: 'Đã đầy' },
        ],
        onFilter: (value, record) => record.status.indexOf(value) === 0,
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

// --- COMPONENT CHÍNH ---
export function RoomInfoManager() {
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'manager-rooms';

    const [filterBuilding, setFilterBuilding] = useState(undefined);
    const [filterFloor, setFilterFloor] = useState(undefined);
    const [filterStatus, setFilterStatus] = useState(undefined);
    const [searchText, setSearchText] = useState('');

    // mock data if payload is X then {data, error} is Y
    const { get, data, error } = useApiTest((payload) => {
        return {
            data: [
                { key: '1', building: 'A1', floor: 1, roomNumber: '101', maxCapacity: 4, currentOccupants: 3, status: 'Còn chỗ' },
                { key: '2', building: 'A1', floor: 2, roomNumber: '205', maxCapacity: 4, currentOccupants: 4, status: 'Đã đầy' },
                { key: '3', building: 'B2', floor: 3, roomNumber: '310', maxCapacity: 2, currentOccupants: 1, status: 'Còn chỗ' },
                { key: '4', building: 'B2', floor: 3, roomNumber: '311', maxCapacity: 2, currentOccupants: 2, status: 'Đã đầy' },
                { key: '5', building: 'C3', floor: 5, roomNumber: '501', maxCapacity: 6, currentOccupants: 6, status: 'Đã đầy' },
            ].filter(room => {
                const matchesBuilding = payload.dorm ? room.building === payload.dorm : true;
                const matchesFloor = payload.floor ? room.floor === parseInt(payload.floor) : true;
                const matchesStatus = payload.status ? room.status === payload.status : true;
                const matchesSearch = payload.roomNumber ? room.roomNumber.toLowerCase().includes(searchText.toLowerCase()) : true;
                return matchesBuilding && matchesFloor && matchesStatus && matchesSearch;
            }),
            error: null
        };
    });

    // call when first render
    useEffect(() => {
        get("/rooms", {
            dorm: filterBuilding,
            floor: filterFloor,
            status: filterStatus,
            roomNumber: searchText
        });
    }, [get, filterBuilding, filterFloor, filterStatus, searchText]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* 1. SIDEBAR */}
            <SideBarManager collapsed={collapsed} active={activeKey} />

            {/* 2. KHU VỰC NỘI DUNG */}
            <Layout>
                {/* Header Title */}
                <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>
                        Quản lý ký túc xá / Thông tin phòng
                    </Title>
                </Header>

                {/* Main Content */}
                <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>

                    {/* KHU VỰC LỌC VÀ TÌM KIẾM */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 20, alignItems: 'center' }}>

                        {/* Lọc theo Tòa nhà */}
                        <Col>
                            <Select
                                placeholder="Tòa nhà"
                                style={{ width: 120 }}
                                onChange={setFilterBuilding}
                                allowClear
                            >
                                <Option value="A1">A1</Option>
                                <Option value="B2">B2</Option>
                                <Option value="C3">C3</Option>
                            </Select>
                        </Col>

                        {/* Lọc theo Tầng */}
                        <Col>
                            <Select
                                placeholder="Tầng"
                                style={{ width: 100 }}
                                onChange={setFilterFloor}
                                allowClear
                            >
                                <Option value="1">1</Option>
                                <Option value="2">2</Option>
                                <Option value="3">3</Option>
                                <Option value="5">5</Option>
                            </Select>
                        </Col>

                        {/* Lọc theo Trạng thái */}
                        <Col>
                            <Select
                                placeholder="Trạng thái"
                                style={{ width: 120 }}
                                onChange={setFilterStatus}
                                allowClear
                            >
                                <Option value="Còn chỗ">Còn chỗ</Option>
                                <Option value="Đã đầy">Đã đầy</Option>
                            </Select>
                        </Col>

                        {/* Tìm kiếm theo Số phòng */}
                        <Col flex="auto">
                            <Input
                                placeholder="Tìm kiếm Số phòng..."
                                prefix={<SearchOutlined />}
                                style={{ width: 250 }}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Col>

                    </Row>

                    {/* BẢNG DANH SÁCH PHÒNG */}
                    <Table
                        loading={!data}
                        columns={columns}
                        dataSource={data}
                        pagination={{ pageSize: 10 }}
                        bordered
                    />

                </Content>
            </Layout>
        </Layout>
    );
}