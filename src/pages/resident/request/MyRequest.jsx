import React, { useState, useEffect } from "react";
import { AppLayout } from "../../../components/layout/AppLayout.jsx";
import { Card, Table, Button, Tag, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import { useApi } from "../../../hooks/useApi.js";

export function MyRequest() {
    const navigate = useNavigate();
    const [dataSource, setDataSource] = useState([]);

    // API call for requests
    const { get: getRequests, data: requestsData, isSuccess: isRequestsSuccess, isComplete: isRequestsComplete } = useApi();

    // Fetch requests on mount
    useEffect(() => {
        console.log("Fetching requests...");
        getRequests("/requests");
    }, []);

    // Update dataSource when requests are loaded
    useEffect(() => {
        console.log("=== EFFECT TRIGGERED ===");
        console.log("Requests data:", requestsData);
        console.log("Is success:", isRequestsSuccess);
        console.log("Is complete:", isRequestsComplete);
        console.log("Type of requestsData:", typeof requestsData);
        console.log("requestsData is null?", requestsData === null);
        console.log("requestsData is undefined?", requestsData === undefined);

        // Kiểm tra tất cả các trường hợp có thể
        if (requestsData) {
            console.log("requestsData exists!");
            console.log("requestsData.data:", requestsData.data);
            console.log("requestsData.status:", requestsData.status);
            console.log("requestsData.message:", requestsData.message);

            // Thử nhiều cách truy xuất data
            let dataArray = [];

            if (Array.isArray(requestsData)) {
                console.log("requestsData is array directly");
                dataArray = requestsData;
            } else if (requestsData.data && Array.isArray(requestsData.data)) {
                console.log("requestsData.data is array");
                dataArray = requestsData.data;
            } else if (requestsData.data && requestsData.data.data && Array.isArray(requestsData.data.data)) {
                console.log("requestsData.data.data is array");
                dataArray = requestsData.data.data;
            }

            console.log("Data array length:", dataArray.length);
            console.log("Data array:", dataArray);

            if (dataArray.length > 0) {
                // Map dữ liệu từ backend response
                const formattedData = dataArray.map((item) => {
                    console.log("Mapping item:", item);
                    return {
                        key: item.requestId,
                        requestId: item.requestId,
                        requestType: item.requestType,
                        content: "N/A",
                        reply: "N/A",
                        semester: item.semesterName,
                        createdDate: item.createTime,
                        status: item.responseStatus,
                        userName: item.userName,
                    };
                });

                console.log("Formatted data:", formattedData);
                console.log("Setting dataSource...");
                setDataSource(formattedData);
            } else {
                console.log("Data array is empty");
            }
        } else {
            console.log("requestsData is null or undefined");
        }
    }, [isRequestsSuccess, requestsData, isRequestsComplete]);

    // Màu cho trạng thái
    const statusColor = (status) => {
        if (status === "APPROVED" || status === "COMPLETED") return "green";
        if (status === "PENDING" || status === "PROCESSING") return "blue";
        if (status === "REJECTED" || status === "CANCELLED") return "red";
        return "default";
    };

    // Format status text
    const formatStatus = (status) => {
        const statusMap = {
            PENDING: "Đang xử lý",
            PROCESSING: "Đang xử lý",
            APPROVED: "Đã duyệt",
            REJECTED: "Từ chối",
            COMPLETED: "Hoàn thành",
            CANCELLED: "Đã hủy"
        };
        return statusMap[status] || status;
    };

    // Format request type
    const formatRequestType = (type) => {
        const typeMap = {
            CHECKOUT: "Trả phòng",
            SECURITY_INCIDENT: "Sự cố an ninh",
            METER_READING_DISCREPANCY: "Chênh lệch đồng hồ",
            MAINTENANCE: "Bảo trì",
            COMPLAINT: "Khiếu nại",
            OTHER: "Khác"
        };
        return typeMap[type] || type;
    };

    // Cấu hình bảng
    const columns = [
        {
            title: "Request Type",
            dataIndex: "requestType",
            key: "requestType",
            width: 180,
            render: (type) => formatRequestType(type),
        },
        {
            title: "Semester",
            dataIndex: "semester",
            key: "semester",
            width: 150,
        },
        {
            title: "Created Date",
            dataIndex: "createdDate",
            key: "createdDate",
            width: 180,
            render: (date) => {
                if (!date) return "N/A";
                const d = new Date(date);
                return d.toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 160,
            render: (status) => (
                <Tag color={statusColor(status)}>
                    {formatStatus(status)}
                </Tag>
            ),
        },
        {
            title: "Details",
            key: "details",
            width: 130,
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => navigate(`/request-detail/${record.requestId}`)}
                >
                    View
                </Button>
            ),
        },
    ];

    const isLoading = !isRequestsComplete;

    const processingCount = dataSource.filter((d) =>
        d.status === "PENDING" || d.status === "PROCESSING"
    ).length;

    console.log("Data source:", dataSource);
    console.log("Is loading:", isLoading);
    console.log("Processing count:", processingCount);

    return (
        <Spin spinning={isLoading}>
            <AppLayout>
                <div className="p-4">
                    {/* Tiêu đề và nút tạo mới */}
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-[#004aad]">
                            My Requests
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
                            loading={isLoading}
                        />
                    </Card>
                </div>
            </AppLayout>
        </Spin>
    );
}