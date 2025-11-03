import React, { useState, useEffect } from 'react';
import {
    Layout, Typography, Row, Col, Table, Input, Select, Button, Tag, Space,
    Dropdown, Menu, message, Spin
} from "antd";
import { SideBarManager } from "../../components/layout/SideBarManger.jsx";
import { Link } from 'react-router-dom';
// === THÊM MỚI: Thêm icon Search và Clear ===
import { EyeOutlined, SearchOutlined, ClearOutlined } from "@ant-design/icons";
// === KẾT THÚC THÊM MỚI ===
import axiosClient from '../../api/axiosClient/axiosClient.js';

const { Header, Content } = Layout;
const { Title } = Typography;
// (Lấy Option từ Select nếu bạn cần Filter sau này)
const { Option } = Select;

export function ResidentManagerPage() {
    const [loading, setLoading] = useState(false);
    // [residents] là state lưu trữ danh sách GỐC từ API
    const [residents, setResidents] = useState([]);

    // === THÊM MỚI: State cho tìm kiếm ===
    const [searchText, setSearchText] = useState('');
    // (Bạn có thể thêm state cho filter (ví dụ filterKhuVuc) ở đây sau)
    // const [filterKhuVuc, setFilterKhuVuc] = useState(undefined);

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
        // (setFilterKhuVuc(undefined); // Nếu có)
    };

    const filteredData = residents.filter(item => {
        // 1. Chuẩn bị chuỗi mục tiêu để tìm kiếm
        const searchTarget = `
            ${item.fullName || ''} 
            ${item.userName || ''} 
            ${item.email || ''} 
            ${item.phoneNumber || ''}
        `.toLowerCase();

        // 2. Kiểm tra match với searchText
        const matchesSearch = searchTarget.includes(searchText.toLowerCase());

        // (3. Kiểm tra match với filterKhuVuc - ví dụ sau này)
        // const matchesKhuVuc = filterKhuVuc ? item.dormName === filterKhuVuc : true;

        // Trả về true nếu tất cả điều kiện đều đúng
        return matchesSearch; // && matchesKhuVuc;
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
            <SideBarManager active={"manager-residents"} collapsed={false}/>
            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 24px",
                        borderBottom: "1px solid #f0f0f0",
                        height: 80,
                    }}
                >
                    {/* === SỬA LẠI: Title cho nhất quán === */}
                    <Title level={2} style={{ margin: 0, lineHeight: "80px" }}>
                        Quản lý sinh viên
                    </Title>
                </Header>
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
                        {/* (Bạn có thể thêm Select lọc theo Tòa/Phòng ở đây) */}
                        {/* <Col>
                            <Select placeholder="Lọc theo Tòa" style={{ width: 150 }} onChange={setFilterKhuVuc} value={filterKhuVuc} allowClear>
                                <Option value="A1">Tòa A1</Option>
                                <Option value="B2">Tòa B2</Option>
                            </Select>
                        </Col> */}
                        <Col>
                            <Button onClick={handleClearFilters} icon={<ClearOutlined />}>
                                Xóa bộ lọc
                            </Button>
                        </Col>
                    </Row>
                    {/* === KẾT THÚC SỬA === */}

                    <Table
                        columns={columns}
                        // === SỬA LẠI: Dùng dữ liệu đã lọc ===
                        dataSource={filteredData}
                        // === KẾT THÚC SỬA ===
                        loading={loading}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        bordered
                    />
                </Content>
            </Layout>
        </Layout>
    )
}