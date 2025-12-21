import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Input, Button, App, Tag, Select } from "antd";
import { Link } from 'react-router-dom';
import { EyeOutlined, SearchOutlined, ClearOutlined } from "@ant-design/icons";
import { LayoutManager } from '../../../components/layout/LayoutManager.jsx';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import { RequireRole } from "../../../components/authorize/RequireRole.jsx";
import dayjs from 'dayjs';

const { Option } = Select;

export function ResidentManagerPage() {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [residents, setResidents] = useState([]);
    const [searchText, setSearchText] = useState('');
    // 1. Thêm state để quản lý trạng thái lọc chỗ ở
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchResidents = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/users/residents');
            const actualData = response.data?.data || response.data || [];

            if (Array.isArray(actualData)) {
                const dataWithKey = actualData.map((item, index) => ({
                    ...item,
                    key: item.residentId,
                    stt: index + 1,
                }));
                setResidents(dataWithKey);
            }
        } catch (error) {
            message.error("Không thể tải danh sách sinh viên!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchResidents(); }, []);

    // 2. Cập nhật Logic lọc dữ liệu kết hợp cả Search và Status
    const filteredData = residents.filter(item => {
        const matchesSearch = `${item.fullName || ''} ${item.email || ''} ${item.userCode || ''} ${item.slotName || ''}`
            .toLowerCase()
            .includes(searchText.toLowerCase());

        const matchesStatus =
            filterStatus === 'all' ? true :
                filterStatus === 'assigned' ? !!item.slotName : // Có slotName là đã xếp
                    !item.slotName; // Không có slotName là chưa xếp

        return matchesSearch && matchesStatus;
    });

    // Hàm reset bộ lọc
    const handleClearFilters = () => {
        setSearchText('');
        setFilterStatus('all');
    };

    const columns = [
        { title: "STT", dataIndex: "stt", key: "stt", width: 60, align: "center" },
        { title: "Họ và tên", dataIndex: "fullName", key: "fullName" },
        { title: "Mã SV", dataIndex: "userCode", key: "userCode" },
        { title: "Email", dataIndex: "email", key: "email" },
        {
            title: "Ngày sinh",
            dataIndex: "dob",
            key: "dob",
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
        },
        {
            title: "Chỗ ở (Slot)",
            dataIndex: "slotName",
            key: "slotName",
            render: (val) => val ? <Tag color="blue">{val}</Tag> : <Tag color="default">Chưa xếp</Tag>
        },
        { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber" },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Link to={`/manager/resident-detail/${record.residentId}`}>
                    <Button type="primary" icon={<EyeOutlined />}>Xem</Button>
                </Link>
            ),
        }
    ];

    return (
        <RequireRole role="MANAGER">
            <LayoutManager active="manager-students" header="Quản lý sinh viên">
                <div className="p-5">
                    <Row gutter={16} style={{ marginBottom: 20 }}>
                        <Col flex="300px">
                            <Input
                                placeholder="Tìm kiếm theo tên, email, mã SV..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                            />
                        </Col>

                        {/* 3. Thêm Select để lọc theo trạng thái xếp chỗ */}
                        <Col flex="200px">
                            <Select
                                style={{ width: '100%' }}
                                value={filterStatus}
                                onChange={value => setFilterStatus(value)}
                            >
                                <Option value="all">Tất cả sinh viên</Option>
                                <Option value="assigned">Đã xếp chỗ</Option>
                                <Option value="unassigned">Chưa xếp chỗ</Option>
                            </Select>
                        </Col>

                        <Col>
                            <Button
                                onClick={handleClearFilters}
                                icon={<ClearOutlined />}
                            >
                                Xóa lọc
                            </Button>
                        </Col>
                    </Row>

                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        loading={loading}
                        bordered
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Tổng cộng ${total} sinh viên`
                        }}
                    />
                </div>
            </LayoutManager>
        </RequireRole>
    );
}