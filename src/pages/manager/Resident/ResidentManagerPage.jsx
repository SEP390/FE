import React, { useState, useEffect } from 'react';
import {
    Row, Col, Table, Input, Button, Space, message
} from "antd";
import { Link } from 'react-router-dom';
import { EyeOutlined, SearchOutlined, ClearOutlined } from "@ant-design/icons";
// Use LayoutManager to get consistent header/sidebar/layout behavior
import { LayoutManager } from '../../../components/layout/LayoutManager.jsx';
// === KẾT THÚC THÊM MỚI ===
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";

export function ResidentManagerPage() {
    const [loading, setLoading] = useState(false);
    const [residents, setResidents] = useState([]);
    const [searchText, setSearchText] = useState('');

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
        const searchTarget = `${item.fullName || ''} ${item.userName || ''} ${item.email || ''} ${item.phoneNumber || ''}`.toLowerCase();
        return searchTarget.includes(searchText.toLowerCase());
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
        <RequireRole role = "MANAGER">
            <LayoutManager active={"manager-residents"} header={"Quản lý sinh viên"}>
                <div className="!overflow-auto h-full p-5 flex flex-col">
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

                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        loading={loading}
                        pagination={{ pageSize: 10, showSizeChanger: true }}
                        bordered
                    />
                </div>
            </LayoutManager>
        </RequireRole>
    )
}