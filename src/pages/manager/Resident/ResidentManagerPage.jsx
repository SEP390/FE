import React, { useState, useEffect } from 'react';
import {
    Layout, Typography, Row, Col, Table, Input, Select, Button, Tag, Space,
    Dropdown, Menu, message, Spin
} from "antd";
import { SideBarManager } from "../../../components/layout/SideBarManger.jsx";
import { Link, useNavigate } from 'react-router-dom';
// === THÊM MỚI: Thêm icon Search, Clear, Logout và MenuOutlined ===
import { EyeOutlined, SearchOutlined, ClearOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";
// Import AppHeader (Giả định path đúng)
import { AppHeader } from '../../../components/layout/AppHeader.jsx';
// Thêm import hook quản lý state global (Giả định hook này có tồn tại)
import { useCollapsed } from '../../../hooks/useCollapsed.js';
// === KẾT THÚC THÊM MỚI ===
import axiosClient from '../../../api/axiosClient/axiosClient.js';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

export function ResidentManagerPage() {
    // === SỬ DỤNG HOOK GLOBAL CHO COLLAPSED (THAY THẾ useState) ===
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);

    const [loading, setLoading] = useState(false);
    const [residents, setResidents] = useState([]);
    const [searchText, setSearchText] = useState('');

    const navigate = useNavigate();

    // === LOGIC TOGGLE SIDEBAR (ĐÃ SỬA DÙNG CALLBACK) ===
    const toggleSideBar = () => {
        setCollapsed(prev => !prev);
    }
    // === KẾT THÚC LOGIC TOGGLE ===

    // Hàm gọi API lấy danh sách sinh viên (Giữ nguyên)
    const fetchResidents = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/users/residents');
            if (response && response.data) {
                const dataWithKeyAndIndex = response.data.map((item, index) => ({
                    ...item,
                    key: item.residentId,
                    index: index + 1,
                }));
                setResidents(dataWithKeyAndIndex);
            } else {
                setResidents([]);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách sinh viên:", error);
            message.error("Không thể tải danh sách sinh viên!");
        } finally {
            setLoading(false);
        }
    };

    // useEffect (Giữ nguyên)
    useEffect(() => {
        fetchResidents();
    }, []);

    // === THÊM MỚI: Logic Lọc và Xóa Filter ===
    const handleClearFilters = () => {
        setSearchText('');
    };

    const filteredData = residents.filter(item => {
        const searchTarget = `
            ${item.fullName || ''} 
            ${item.userName || ''} 
            ${item.email || ''} 
            ${item.phoneNumber || ''}
        `.toLowerCase();
        const matchesSearch = searchTarget.includes(searchText.toLowerCase());
        return matchesSearch;
    });

    // === CỘT (Giữ nguyên) ===
    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            width: 70,
        },
        {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
            sorter: (a, b) => (a.fullName || '').localeCompare(b.fullName || ''),
        },
        {
            title: "Username",
            dataIndex: "userName",
            key: "userName",
            sorter: (a, b) => (a.userName || '').localeCompare(b.userName || ''),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Space>
                    <Link to={`/manager/resident-detail/${record.residentId}`}>
                        <Button type="primary" icon={<EyeOutlined />} title="Xem chi tiết">
                            Xem
                        </Button>
                    </Link>
                </Space>
            ),
        }
    ];

    return (
        <Layout className={"!h-screen"}>
            <SideBarManager active={"manager-residents"} collapsed={collapsed}/>
            <Layout>
                {/* === SỬ DỤNG APPHEADER THAY THẾ HEADER CŨ === */}
                <AppHeader
                    header={"Quản lý sinh viên"}
                    toggleSideBar={toggleSideBar}
                />
                {/* === KẾT THÚC APPHEADER === */}
                <Content className={"!overflow-auto h-full p-5 flex flex-col"}>

                    {/* === SỬA LẠI: Thêm thanh tìm kiếm === */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                        <Col flex="400px">
                            <Input
                                placeholder="Tìm kiếm (Họ tên, Username, Email, SĐT)..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />
                        </Col>
                        <Col>
                            <Button onClick={handleClearFilters} icon={<ClearOutlined />}>
                                Xóa bộ lọc
                            </Button>
                        </Col>
                    </Row>
                    {/* === KẾT THÚC SỬA === */}

                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        loading={loading}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        bordered
                    />
                </Content>
            </Layout>
        </Layout>
    )
}