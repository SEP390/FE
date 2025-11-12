import React, { useState, useEffect } from "react";
import { SideBarManager } from "../../../components/layout/SideBarManger.jsx";
import { Layout, Typography, Card, Table, Button, Tag, Select, Input, Space, DatePicker } from "antd";
import { useNavigate } from "react-router-dom";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useApi } from "../../../hooks/useApi.js";
import dayjs from "dayjs";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export function ManagerRequests() {
    const navigate = useNavigate();
    const [collapsed] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [dateRange, setDateRange] = useState(null);
    const [quickDateFilter, setQuickDateFilter] = useState("all");

    // API call for requests
    const { get: getRequests, data: requestsData, isSuccess: isRequestsSuccess, isComplete: isRequestsComplete, isError: isRequestsError, error: requestsError } = useApi();

    // Fetch requests on mount
    useEffect(() => {
        console.log("Fetching all requests...");
        getRequests("/requests");
    }, []);

    // Update dataSource when requests are loaded
    useEffect(() => {
        if (isRequestsSuccess && requestsData) {
            console.log("=== REQUEST DATA RECEIVED ===");
            console.log("Requests data:", requestsData);

            let dataArray = [];

            // Handle different response structures
            if (Array.isArray(requestsData)) {
                dataArray = requestsData;
            } else if (requestsData.data && Array.isArray(requestsData.data)) {
                dataArray = requestsData.data;
            } else if (requestsData.data && requestsData.data.data && Array.isArray(requestsData.data.data)) {
                dataArray = requestsData.data.data;
            }

            console.log("Data array length:", dataArray.length);

            if (dataArray.length > 0) {
                // Map dữ liệu từ backend response
                const formattedData = dataArray.map((item) => {
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
                });

                console.log("Formatted data count:", formattedData.length);
                setDataSource(formattedData);
            } else {
                console.log("No requests found in response");
                setDataSource([]);
            }
        } else if (isRequestsError) {
            console.error("Error fetching requests:", requestsError);
            setDataSource([]);
        }
    }, [isRequestsSuccess, isRequestsError, requestsData, requestsError, isRequestsComplete]);

    // Handler cho quick date filter
    const handleQuickDateFilterChange = (value) => {
        setQuickDateFilter(value);
        
        if (value === "all") {
            setDateRange(null);
        } else if (value === "today") {
            const today = dayjs();
            setDateRange([today, today]);
        } else if (value === "week") {
            const today = dayjs();
            const weekAgo = today.subtract(7, 'day');
            setDateRange([weekAgo, today]);
        } else if (value === "month") {
            const today = dayjs();
            const monthAgo = today.subtract(1, 'month');
            setDateRange([monthAgo, today]);
        } else if (value === "3months") {
            const today = dayjs();
            const threeMonthsAgo = today.subtract(3, 'month');
            setDateRange([threeMonthsAgo, today]);
        }
    };

    // Reset quick filter khi user chọn date range thủ công
    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
        if (!dates) {
            setQuickDateFilter("all");
        } else {
            // Kiểm tra xem date range có khớp với quick filter nào không
            const startDate = dayjs(dates[0]).startOf('day');
            const endDate = dayjs(dates[1]).startOf('day');
            const today = dayjs().startOf('day');
            const weekAgo = today.subtract(7, 'day');
            const monthAgo = today.subtract(1, 'month');
            const threeMonthsAgo = today.subtract(3, 'month');
            
            if (startDate.isSame(today, 'day') && endDate.isSame(today, 'day')) {
                setQuickDateFilter("today");
            } else if (startDate.isSame(weekAgo, 'day') && endDate.isSame(today, 'day')) {
                setQuickDateFilter("week");
            } else if (startDate.isSame(monthAgo, 'day') && endDate.isSame(today, 'day')) {
                setQuickDateFilter("month");
            } else if (startDate.isSame(threeMonthsAgo, 'day') && endDate.isSame(today, 'day')) {
                setQuickDateFilter("3months");
            }
            // Nếu không khớp với quick filter nào, giữ nguyên giá trị hiện tại
        }
    };

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

        // Filter by date range
        if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
            const startDate = dayjs(dateRange[0]).startOf('day');
            const endDate = dayjs(dateRange[1]).endOf('day');
            
            filtered = filtered.filter(item => {
                if (!item.createdDate) return false;
                const itemDate = dayjs(item.createdDate);
                // Kiểm tra xem ngày của item có nằm trong khoảng từ startDate đến endDate không (bao gồm cả 2 đầu)
                const isAfterOrSameStart = itemDate.isAfter(startDate, 'day') || itemDate.isSame(startDate, 'day');
                const isBeforeOrSameEnd = itemDate.isBefore(endDate, 'day') || itemDate.isSame(endDate, 'day');
                return isAfterOrSameStart && isBeforeOrSameEnd;
            });
        }

        setFilteredData(filtered);
    }, [dataSource, statusFilter, typeFilter, searchText, dateRange]);

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
                    onClick={() => navigate(`/manager/request-detail/${record.requestId}`)}
                >
                    View Details
                </Button>
            ),
        },
    ];

    const isLoading = !isRequestsComplete;

    // Statistics - tính theo dataSource để hiển thị tổng số requests (không bị filter)
    const totalRequests = dataSource.length;
    const pendingRequests = dataSource.filter(d => d.status === "PENDING" || d.status === "PROCESSING").length;
    const approvedRequests = dataSource.filter(d => d.status === "APPROVED" || d.status === "COMPLETED" || d.status === "ACCEPTED").length;
    const rejectedRequests = dataSource.filter(d => d.status === "REJECTED" || d.status === "CANCELLED").length;

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <SideBarManager collapsed={collapsed} active="manager-requests" />
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
                        Quản lý yêu cầu sinh viên
                    </Title>
                </Header>

                <Content style={{ margin: "24px", background: "#fff", padding: 24 }}>
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
                                value={quickDateFilter}
                                onChange={handleQuickDateFilterChange}
                                style={{ width: 180 }}
                            >
                                <Option value="all">Tất cả thời gian</Option>
                                <Option value="today">Hôm nay</Option>
                                <Option value="week">1 tuần</Option>
                                <Option value="month">1 tháng</Option>
                                <Option value="3months">3 tháng đổ lại</Option>
                            </Select>
                            <RangePicker
                                placeholder={["Từ ngày", "Đến ngày"]}
                                format="DD/MM/YYYY"
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                style={{ width: 250 }}
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
                                    setDateRange(null);
                                    setQuickDateFilter("all");
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