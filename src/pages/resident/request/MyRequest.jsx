import React, { useState, useEffect } from "react";
import { AppLayout } from "../../../components/layout/AppLayout.jsx";
import { Card, Typography, Table, Button, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;

export function MyRequest() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [dataSource, setDataSource] = useState([]);

    useEffect(() => {
        fetch('/user/profile')
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch user info');
                }
                return res.json();
            })
            .then(json => {
                setUserInfo(json.data);
            })
            .catch(err => console.error('Error fetching user info:', err));
    }, []);

    useEffect(() => {
        if (userInfo) {
            fetch(`/requests?studentId=${userInfo.StudentId}`) // Giả định endpoint để lấy requests dựa trên StudentId
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Failed to fetch requests');
                    }
                    return res.json();
                })
                .then(json => {
                    setDataSource(json.data || []);
                })
                .catch(err => console.error('Error fetching requests:', err));
        }
    }, [userInfo]);

    // 🎨 Màu cho trạng thái
    const statusColor = (status) => {
        if (status.includes("thành công")) return "green";
        if (status.includes("Đang xử lý")) return "blue";
        return "default";
    };

    // 🧾 Cấu hình bảng
    const columns = [
        {
            title: "Request Type",
            dataIndex: "requestType",
            key: "requestType",
            width: 150,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Content",
            dataIndex: "content",
            key: "content",
            width: 250,
        },
        {
            title: "Reply",
            dataIndex: "reply",
            key: "reply",
            width: 250,
        },
        {
            title: "Semester",
            dataIndex: "semester",
            key: "semester",
            width: 130,
        },
        {
            title: "Created Date",
            dataIndex: "createdDate",
            key: "createdDate",
            width: 160,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 160,
            render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
        },
        {
            title: "Details",
            key: "details",
            width: 130,
            render: (_, record) => (
                <Button type="link" onClick={() => navigate(`/request-detail/${record.key}`)}>
                    View
                </Button>
            ),
        },
    ];

    return (
        <AppLayout>
            <div className="p-4">
                {/* Tiêu đề và nút tạo mới */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-[#004aad]">
                        {userInfo ? `${userInfo.username}'s Requests` : "My Requests"}
                    </h1>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/create-request")}
                        style={{ backgroundColor: "#004aad" }}
                    >
                        Create new request
                    </Button>
                </div>

                {/* Đếm số lượng yêu cầu đang xử lý */}
                <p className="text-green-600 mb-4">
                    Your processing CIM request:{" "}
                    {dataSource.filter((d) => d.status.includes("Đang xử lý")).length}
                </p>

                {/* Bảng danh sách */}
                <Card>
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        bordered
                        pagination={false}
                        scroll={{ x: true }}
                    />
                </Card>

                {/* Phần chi tiết thời gian & comment */}
                <div className="mt-6">
                    <Card
                        title="🕒 Thời gian & phản hồi của quản lý"
                        headStyle={{ background: "#004aad", color: "white" }}
                    >
                        {dataSource.map((req) => (
                            <div key={req.key} className="border-b border-gray-200 py-3">
                                <Text strong>{req.requestType}</Text>
                                <br />
                                <Text type="secondary">
                                    ⏰ Thời gian xử lý: {req.timeRange}
                                </Text>
                                <br />
                                <Text>
                                    💬 <strong>Comment của quản lý:</strong> {req.managerComment}
                                </Text>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}