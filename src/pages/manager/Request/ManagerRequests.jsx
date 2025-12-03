import React, { useState, useEffect } from "react";
import { SideBarManager } from "../../../components/layout/SideBarManger.jsx";
import { AppHeader } from "../../../components/layout/AppHeader.jsx";
import { Layout, Card, Table, Button, Tag, Alert, Select, Input, Space, DatePicker } from "antd";
import { useNavigate } from "react-router-dom";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useApi } from "../../../hooks/useApi.js";
import dayjs from "dayjs";

const { Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

export function ManagerRequests() {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [dateRange, setDateRange] = useState(null);
    const [quickDateFilter, setQuickDateFilter] = useState("all");
    const [showAnonymous, setShowAnonymous] = useState(false);

    // API call for requests
    const { get: getRequests, data: requestsData, isSuccess: isRequestsSuccess, isComplete: isRequestsComplete, isError: isRequestsError, error: requestsError } = useApi();

    // Fetch requests based on filter
    useEffect(() => {
        if (typeFilter === 'ANONYMOUS') {
            console.log("Fetching anonymous requests...");
            getRequests("/requests/anonymous");
            setShowAnonymous(true);
        } else {
            console.log("Fetching all requests...");
            getRequests("/requests");
            setShowAnonymous(false);
        }
    }, [typeFilter]);

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
                const formattedData = dataArray.map((item) => {
                    if (showAnonymous) {
                        return {
                            key: item.requestId || item.id,
                            requestId: item.requestId || item.id,
                            requestType: item.requestType || 'ANONYMOUS',
                            content: item.content,
                            createdDate: item.createTime || item.createdAt,
                            status: item.responseStatus || item.status,
                            isAnonymous: true
                        };
                    }

                    return {
                        key: item.requestId,
                        requestId: item.requestId,
                        requestType: item.requestType,
                        userName: item.residentName,
                        roomName: item.roomName,
                        semester: item.semesterName,
                        createdDate: item.createTime,
                        status: item.responseStatus,
                        isAnonymous: false
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
    }, [isRequestsSuccess, isRequestsError, requestsData, requestsError, isRequestsComplete, showAnonymous]);

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

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
        if (!dates) {
            setQuickDateFilter("all");
        } else {
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
        }
    };

    // Filter data based on filters
    useEffect(() => {
        let filtered = [...dataSource];

        if (!showAnonymous) {
            if (statusFilter !== "all") {
                filtered = filtered.filter(item => item.status === statusFilter);
            }

            if (typeFilter !== "all") {
                filtered = filtered.filter(item => item.requestType === typeFilter);
            }

            if (searchText) {
                filtered = filtered.filter(item =>
                    item.userName && item.userName.toLowerCase().includes(searchText.toLowerCase())
                );
            }
        } else {
            if (searchText) {
                filtered = filtered.filter(item =>
                    (item.content && item.content.toLowerCase().includes(searchText.toLowerCase())) ||
                    (item.requestType && item.requestType.toLowerCase().includes(searchText.toLowerCase()))
                );
            }
        }

        if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
            const startDate = dayjs(dateRange[0]).startOf('day');
            const endDate = dayjs(dateRange[1]).endOf('day');

            filtered = filtered.filter(item => {
                if (!item.createdDate) return false;
                const itemDate = dayjs(item.createdDate);
                const isAfterOrSameStart = itemDate.isAfter(startDate, 'day') || itemDate.isSame(startDate, 'day');
                const isBeforeOrSameEnd = itemDate.isBefore(endDate, 'day') || itemDate.isSame(endDate, 'day');
                return isAfterOrSameStart && isBeforeOrSameEnd;
            });
        }

        setFilteredData(filtered);
    }, [dataSource, statusFilter, typeFilter, searchText, dateRange, showAnonymous]);

    const statusColor = (status) => {
        if (status === "APPROVED" || status === "COMPLETED" || status === "ACCEPTED") return "green";
        if (status === "PENDING" || status === "PROCESSING") return "blue";
        if (status === "REJECTED" || status === "CANCELLED") return "red";
        return "default";
    };

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

    const formatRequestType = (type) => {
        const typeMap = {
            CHECKOUT: "Yêu cầu trả phòng",
            METER_READING_DISCREPANCY: "Kiểm tra sai số điện/nước",
            SECURITY_INCIDENT: "Sự cố an ninh",
            TECHNICAL_ISSUE: "Sự cố kỹ thuật",
            POLICY_VIOLATION_REPORT: "Báo cáo vi phạm quy định",
            CHANGEROOM: "Yêu cầu đổi phòng",
            ANONYMOUS: "Yêu cầu ẩn danh",
            OTHER: "Khác"
        };
        return typeMap[type] || type;
    };

    const uniqueStatuses = [...new Set(dataSource.map(item => item.status))];
    const uniqueTypes = [...new Set(dataSource.map(item => item.requestType))];

    const getTableColumns = () => {
        if (showAnonymous) {
            return [
                {
                    title: "Loại yêu cầu",
                    dataIndex: "requestType",
                    key: "requestType",
                    width: 180,
                    render: (type) => formatRequestType(type),
                },
                {
                    title: "Ngày tạo",
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
                    title: "Thao tác",
                    key: "action",
                    width: 130,
                    render: (_, record) => (
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/manager/request-detail/${record.requestId}`)}
                        >
                            Xem chi tiết
                        </Button>
                    ),
                },
            ];
        }

        return [
            {
                title: "Tên sinh viên",
                dataIndex: "userName",
                key: "userName",
                width: 200,
                sorter: (a, b) => a.userName?.localeCompare(b.userName || ''),
            },
            {
                title: "Phòng",
                dataIndex: "roomName",
                key: "roomName",
                width: 120,
            },
            {
                title: "Loại yêu cầu",
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
                title: "Học kỳ",
                dataIndex: "semester",
                key: "semester",
                width: 150,
            },
            {
                title: "Ngày tạo",
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
                title: "Trạng thái",
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
                title: "Thao tác",
                key: "action",
                width: 130,
                render: (_, record) => (
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/manager/request-detail/${record.requestId}`)}
                    >
                        Xem chi tiết
                    </Button>
                ),
            },
        ];
    };

    const columns = getTableColumns();
    const isLoading = !isRequestsComplete;

    const totalRequests = dataSource.length;
    const pendingRequests = dataSource.filter(d => d.status === "PENDING" || d.status === "PROCESSING").length;
    const approvedRequests = dataSource.filter(d => d.status === "APPROVED" || d.status === "COMPLETED" || d.status === "ACCEPTED").length;
    const rejectedRequests = dataSource.filter(d => d.status === "REJECTED" || d.status === "CANCELLED").length;

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <SideBarManager collapsed={collapsed} active="manager-requests" />
            <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: "all 0.2s" }}>
                <AppHeader
                    toggleSideBar={() => setCollapsed(!collapsed)}
                    header="Quản lý yêu cầu sinh viên"
                    collapsed={collapsed}
                />

                <Content style={{ marginTop: "64px", padding: "24px", background: "#f0f2f5", minHeight: "calc(100vh - 64px)" }}>
                    <div style={{ background: "#fff", padding: 24, borderRadius: "8px" }}>
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
                                    placeholder="Chọn loại yêu cầu"
                                    style={{ width: 200 }}
                                    onChange={(value) => {
                                        setTypeFilter(value);
                                        if (value !== 'ANONYMOUS') {
                                            setSearchText('');
                                            setStatusFilter('all');
                                        }
                                    }}
                                    value={typeFilter}
                                >
                                    <Option value="all">Tất cả</Option>
                                    <Option value="CHECKOUT">Trả phòng</Option>
                                    <Option value="SECURITY_INCIDENT">Sự cố an ninh</Option>
                                    <Option value="METER_READING_DISCREPANCY">Chênh lệch đồng hồ</Option>
                                    <Option value="MAINTENANCE">Bảo trì</Option>
                                    <Option value="TECHNICAL_ISSUE">Yêu cầu kỹ thuật</Option>
                                    <Option value="COMPLAINT">Khiếu nại</Option>
                                    <Option value="ANONYMOUS">Yêu cầu ẩn danh</Option>
                                    <Option value="OTHER">Khác</Option>
                                </Select>
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
                        <div className="mb-4">
                            {showAnonymous && (
                                <Alert
                                    message="Đang hiển thị yêu cầu ẩn danh"
                                    type="info"
                                    showIcon
                                    className="mb-4"
                                />
                            )}
                            <Table
                                columns={columns}
                                dataSource={filteredData}
                                pagination={{ pageSize: 10 }}
                                scroll={{ x: 1000 }}
                                rowKey="requestId"
                                loading={isLoading}
                                locale={{
                                    emptyText: showAnonymous
                                        ? 'Không có yêu cầu ẩn danh nào'
                                        : 'Không có dữ liệu'
                                }}
                            />
                        </div>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}