import React, { useState, useEffect } from "react";
import { GuardSidebar } from "../../../components/layout/GuardSidebar.jsx";
import { AppHeader } from "../../../components/layout/AppHeader.jsx";
import { Layout, Typography, Card, Table, Button, Tag, Select, Input, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useApi } from "../../../hooks/useApi.js";
import { useCollapsed } from "../../../hooks/useCollapsed.js";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

export function GuardViewRequest() {
    const navigate = useNavigate();
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);
    const [dataSource, setDataSource] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [searchText, setSearchText] = useState("");

    // API call for requests
    const { get: getRequests, data: requestsData, isSuccess: isRequestsSuccess, isComplete: isRequestsComplete } = useApi();

    // Fetch requests on mount
    useEffect(() => {
        console.log("Fetching all requests...");
        getRequests("/requests");
    }, []);

    // Update dataSource when requests are loaded
    useEffect(() => {
        console.log("=== EFFECT TRIGGERED ===");
        console.log("Requests data:", requestsData);
        console.log("Is success:", isRequestsSuccess);
        console.log("Is complete:", isRequestsComplete);

        if (requestsData) {
            console.log("requestsData exists!");
            console.log("requestsData.data:", requestsData.data);

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
                const formattedData = dataArray
                    .map((item) => {
                        console.log("Mapping item:", item);
                        return {
                            key: item.requestId,
                            requestId: item.requestId,
                            requestType: item.requestType,
                            userName: item.userName,
                            roomName: item.roomName,
                            semester: item.semesterName,
                            createdDate: item.createTime,
                            status: item.responseStatus,
                        };
                    })
                    .filter((item) => item.requestType !== "TECHNICAL_ISSUE"); // Loại bỏ TECHNICAL_ISSUE

                console.log("Formatted data:", formattedData);
                setDataSource(formattedData);
                setFilteredData(formattedData);
            } else {
                console.log("Data array is empty");
                setDataSource([]);
                setFilteredData([]);
            }
        } else {
            console.log("requestsData is null or undefined");
        }
    }, [isRequestsSuccess, requestsData, isRequestsComplete]);

    // Filter data based on filters
    useEffect(() => {
        let filtered = [...dataSource];

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter(item => item.status === statusFilter);
        }

        // Filter by type
        if (typeFilter !== "all") {
            filtered = filtered.filter(item => item.requestType === typeFilter);
        }

        // Filter by search text (user name)
        if (searchText) {
            filtered = filtered.filter(item =>
                item.userName.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        setFilteredData(filtered);
    }, [dataSource, statusFilter, typeFilter, searchText]);

    // Màu cho trạng thái
    const statusColor = (status) => {
        if (status === "APPROVED" || status === "COMPLETED" || status === "ACCEPTED") return "green";
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
            ACCEPTED: "Đã chấp nhận",
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

    // Get unique statuses and types for filter options
    const uniqueStatuses = [...new Set(dataSource.map(item => item.status))];
    const uniqueTypes = [...new Set(dataSource.map(item => item.requestType))];

    // Cấu hình bảng
    const columns = [
        {
            title: "Student Name",
            dataIndex: "userName",
            key: "userName",
            width: 200,
            sorter: (a, b) => a.userName.localeCompare(b.userName),
        },
        {
            title: "Room Name",
            dataIndex: "roomName",
            key: "roomName",
            width: 150,
        },
        {
            title: "Request Type",
            dataIndex: "requestType",
            key: "requestType",
            width: 180,
            render: (type) => formatRequestType(type),
            filters: uniqueTypes.map(type => ({
                text: formatRequestType(type),
                value: type,
            })),
            onFilter: (value, record) => record.requestType === value,
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
            sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
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
            filters: uniqueStatuses.map(status => ({
                text: formatStatus(status),
                value: status,
            })),
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "Action",
            key: "action",
            width: 130,
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/guard/request-detail/${record.requestId}`)}
                >
                    View Details
                </Button>
            ),
        },
    ];

    const isLoading = !isRequestsComplete;

    // Statistics
    const totalRequests = dataSource.length;
    const pendingRequests = dataSource.filter(d => d.status === "PENDING" || d.status === "PROCESSING").length;
    const approvedRequests = dataSource.filter(d => d.status === "APPROVED" || d.status === "COMPLETED" || d.status === "ACCEPTED").length;
    const rejectedRequests = dataSource.filter(d => d.status === "REJECTED" || d.status === "CANCELLED").length;

    const toggleSideBar = () => { setCollapsed(prev => !prev); };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <GuardSidebar collapsed={collapsed} active="guard-requests" />
            <Layout
                style={{
                    marginLeft: collapsed ? 80 : 260,
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <AppHeader toggleSideBar={toggleSideBar} collapsed={collapsed} header={"Yêu cầu của sinh viên (Bảo vệ)"} />
                <Content style={{ margin: "24px", background: "#fff", padding: 24, marginTop: 64 }}>
                    <Title level={2} style={{ marginBottom: 24 }}>
                        Yêu cầu của sinh viên
                    </Title>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{totalRequests}</div>
                            <div className="text-gray-600">Tổng số yêu cầu</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{pendingRequests}</div>
                            <div className="text-gray-600">Đang xử lý</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-green-600">{approvedRequests}</div>
                            <div className="text-gray-600">Đã chấp nhận</div>
                        </Card>
                        <Card className="text-center">
                            <div className="text-2xl font-bold text-red-600">{rejectedRequests}</div>
                            <div className="text-gray-600">Từ chối</div>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Space
                        style={{
                            marginBottom: 16,
                            width: "100%",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                        }}
                    >
                        <Space wrap>
                            <Input
                                placeholder="Tìm kiếm sinh viên..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                                style={{ width: 200 }}
                                allowClear
                            />
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                style={{ width: 150 }}
                            >
                                <Option value="all">Tất cả trạng thái</Option>
                                {uniqueStatuses.map(status => (
                                    <Option key={status} value={status}>
                                        {formatStatus(status)}
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                value={typeFilter}
                                onChange={setTypeFilter}
                                style={{ width: 180 }}
                            >
                                <Option value="all">Tất cả loại</Option>
                                {uniqueTypes.map(type => (
                                    <Option key={type} value={type}>
                                        {formatRequestType(type)}
                                    </Option>
                                ))}
                            </Select>
                            <Button
                                onClick={() => {
                                    setStatusFilter("all");
                                    setTypeFilter("all");
                                    setSearchText("");
                                }}
                            >
                                Xóa bộ lọc
                            </Button>
                        </Space>
                    </Space>

                    {/* Bảng danh sách */}
                    <Table
                        dataSource={filteredData}
                        columns={columns}
                        bordered
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} yêu cầu`
                        }}
                        scroll={{ x: true }}
                        locale={{ emptyText: "Không tìm thấy yêu cầu" }}
                        loading={isLoading}
                    />
                </Content>
            </Layout>
        </Layout>
    );
}
