import React, { useState, useEffect } from 'react';
import {
    Layout, Typography, Row, Col, Table, Input, Select, Button, Tag, Space,
    Dropdown, Menu, message, Spin
} from "antd";
import { SideBarManager } from "../../components/layout/SideBarManger.jsx";
// === THÊM: Import Link và EyeOutlined ===
import { Link } from 'react-router-dom';
import { EllipsisOutlined, EyeOutlined } from "@ant-design/icons";
// === KẾT THÚC THÊM ===
import axiosClient from '../../api/axiosClient/axiosClient.js';

const { Header, Content } = Layout;
const { Title } = Typography;

export function ResidentManagerPage() {
    const [loading, setLoading] = useState(false);
    const [residents, setResidents] = useState([]);

    // Hàm gọi API lấy danh sách sinh viên
    const fetchResidents = async () => {
        setLoading(true);
        try {
            // 1. Gọi API GET /api/users/residents
            const response = await axiosClient.get('/users/residents');

            // 2. Xử lý dữ liệu trả về (List<GetAllResidentResponse>)
            if (response && response.data) {
                const dataWithKeyAndIndex = response.data.map((item, index) => ({
                    ...item,
                    key: item.residentId, // Dùng residentId từ DTO
                    index: index + 1, // Tạo STT
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

    // useEffect để gọi API khi trang tải
    useEffect(() => {
        fetchResidents();
    }, []); // Chỉ gọi 1 lần


    // === CỘT (Đã cập nhật HÀNH ĐỘNG) ===
    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            key: "index",
            width: 70,
        },
        {
            title: "Họ và tên",
            dataIndex: "fullName", // <-- DTO có
            key: "fullName",
        },
        {
            title: "Username", // <-- DTO có
            dataIndex: "userName",
            key: "userName",
        },
        {
            title: "Email",
            dataIndex: "email", // <-- DTO có
            key: "email",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phoneNumber", // <-- DTO có
            key: "phoneNumber",
        },
        // (Bỏ cột Giới tính và Phòng vì DTO không có)
        {
            title: "Hành động",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Space>
                    {/* === SỬA LẠI: Chỉ còn nút Xem chi tiết === */}
                    <Link to={`/manager/resident-detail/${record.residentId}`}>
                        <Button type="primary" icon={<EyeOutlined />} title="Xem chi tiết">
                            Xem
                        </Button>
                    </Link>
                    {/* === KẾT THÚC SỬA === */}
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
                    <Title level={2} style={{ margin: 0, lineHeight: "80px" }}>
                        Quản lý người ở
                    </Title>
                </Header>
                <Content className={"!overflow-auto h-full p-5 flex flex-col"}>
                    <Space style={{ marginBottom: 16 }}>
                        {/* Có thể thêm Filter/Search ở đây */}
                    </Space>
                    <Table
                        columns={columns}
                        dataSource={residents} // <-- Dùng state
                        loading={loading}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        bordered
                    />
                </Content>
            </Layout>
        </Layout>
    )
}