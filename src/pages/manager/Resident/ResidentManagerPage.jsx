import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Input, Button, Space, message, Tag } from "antd";
import { Link } from 'react-router-dom';
import { EyeOutlined, SearchOutlined, ClearOutlined } from "@ant-design/icons";
import { LayoutManager } from '../../../components/layout/LayoutManager.jsx';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import { RequireRole } from "../../../components/authorize/RequireRole.jsx";

export function ResidentManagerPage() {
    const [loading, setLoading] = useState(false);
    const [residents, setResidents] = useState([]);
    const [searchText, setSearchText] = useState('');

    const fetchResidents = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/users/residents');
            if (response && response.data) {
                const dataWithKey = response.data.map((item, index) => ({
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

    const filteredData = residents.filter(item => {
        const searchTarget = `${item.fullName || ''} ${item.userName || ''} ${item.slotName || ''}`.toLowerCase();
        return searchTarget.includes(searchText.toLowerCase());
    });

    const columns = [
        { title: "STT", dataIndex: "stt", key: "stt", width: 70 },
        { title: "Họ và tên", dataIndex: "fullName", key: "fullName" },
        { title: "Username", dataIndex: "userName", key: "userName" },
        {
            title: "Chỗ ở (Slot)",
            dataIndex: "slotName",
            key: "slotName",
            render: (val) => val ? <Tag color="blue">{val}</Tag> : <Tag>Chưa xếp</Tag>
        },
        { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber" },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Link to={`/manager/resident-detail/${record.residentId}`} state={{ slotName: record.slotName }}>
                    <Button type="primary" icon={<EyeOutlined />}>Xem</Button>
                </Link>
            ),
        }
    ];

    return (
        <RequireRole role="MANAGER">
            <LayoutManager active="manager-residents" header="Quản lý sinh viên">
                <div className="p-5">
                    <Row gutter={16} style={{ marginBottom: 20 }}>
                        <Col flex="400px">
                            <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} />
                        </Col>
                        <Col><Button onClick={() => setSearchText('')} icon={<ClearOutlined />}>Xóa lọc</Button></Col>
                    </Row>
                    <Table columns={columns} dataSource={filteredData} loading={loading} bordered />
                </div>
            </LayoutManager>
        </RequireRole>
    );
}