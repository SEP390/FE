import React, { useState, useEffect } from "react";
import { AppLayout } from "../../../components/layout/AppLayout.jsx";
import { Card, Table, Button, Tag, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import { useApi } from "../../../hooks/useApi.js";

export function MyRequest() {
    const navigate = useNavigate();
    const [dataSource, setDataSource] = useState([]);

    // API call for user profile
    const { get: getProfile, data: profileData, isSuccess: isProfileSuccess, isComplete: isProfileComplete } = useApi();

    // API call for requests
    const { get: getRequests, data: requestsData, isSuccess: isRequestsSuccess, isComplete: isRequestsComplete } = useApi();

    // Fetch user profile on mount
    useEffect(() => {
        getProfile("/users/profile");
    }, [getProfile]);

    // Fetch requests when profile is loaded
    useEffect(() => {
        if (isProfileSuccess && profileData) {
            const studentId = profileData.studentId;
            if (studentId) {
                getRequests(`/requests?studentId=${studentId}`);
            }
        }
    }, [isProfileSuccess, profileData, getRequests]);

    // Update dataSource when requests are loaded
    useEffect(() => {
        if (isRequestsSuccess && requestsData) {
            // Add key for Table component
            const formattedData = (requestsData.data || requestsData || []).map((item, index) => ({
                ...item,
                key: item.id || index,
            }));
            setDataSource(formattedData);
        }
    }, [isRequestsSuccess, requestsData]);

    // 🎨 Màu cho trạng thái
    const statusColor = (status) => {
        if (status.includes("thành công") || status.toLowerCase().includes("success")) return "green";
        if (status.includes("Đang xử lý") || status.toLowerCase().includes("processing") || status.toLowerCase().includes("pending")) return "blue";
        if (status.includes("từ chối") || status.toLowerCase().includes("rejected")) return "red";
        return "default";
    };

    // 🧾 Cấu hình bảng
    const columns = [
        {
            title: "Request Type",
            dataIndex: "requestType",
            key: "requestType",
            width: 150,
        },
        {
            title: "Content",
            dataIndex: "content",
            key: "content",
            width: 250,
            ellipsis: true,
        },
        {
            title: "Reply",
            dataIndex: "reply",
            key: "reply",
            width: 250,
            ellipsis: true,
            render: (text) => text || "N/A",
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
            render: (date) => date ? new Date(date).toLocaleDateString() : "N/A",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 160,
            render: (status) => <Tag color={statusColor(status)}>{status || "N/A"}</Tag>,
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

    const isLoading = !isProfileComplete || (isProfileSuccess && !isRequestsComplete);
    const username = profileData?.username || "User";
    const processingCount = dataSource.filter((d) =>
        d.status?.includes("Đang xử lý") ||
        d.status?.toLowerCase().includes("processing") ||
        d.status?.toLowerCase().includes("pending")
    ).length;

    return (
        <Spin spinning={isLoading}>
            <AppLayout>
                <div className="p-4">
                    {/* Tiêu đề và nút tạo mới */}
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-[#004aad]">
                            {username}'s Requests
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
                        Your processing requests: {processingCount}
                    </p>

                    {/* Bảng danh sách */}
                    <Card>
                        <Table
                            dataSource={dataSource}
                            columns={columns}
                            bordered
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: true }}
                            locale={{ emptyText: "No requests found" }}
                        />
                    </Card>

                    {/* Phần chi tiết thời gian & comment */}
                    {dataSource.length > 0 && (
                        <div className="mt-6">
                            <Card
                                title="🕒 Thời gian & phản hồi của quản lý"
                                headStyle={{ background: "#004aad", color: "white" }}
                            >
                                {dataSource.map((req) => (
                                    <div key={req.key} className="border-b border-gray-200 py-3 last:border-b-0">
                                        <strong>{req.requestType}</strong>
                                        <br />
                                        <span className="text-gray-600">
                                            ⏰ Thời gian xử lý: {req.timeRange || "N/A"}
                                        </span>
                                        <br />
                                        <span>
                                            💬 <strong>Comment của quản lý:</strong> {req.managerComment || "Chưa có phản hồi"}
                                        </span>
                                    </div>
                                ))}
                            </Card>
                        </div>
                    )}
                </div>
            </AppLayout>
        </Spin>
    );
}