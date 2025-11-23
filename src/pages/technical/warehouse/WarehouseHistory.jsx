import React, { useState, useEffect } from "react";
import { Card, Table, Typography, Layout, Tag, Input, DatePicker, Select, Space, Button, message, Modal, Descriptions, Spin } from "antd";
import { SideBarTechnical } from "../../../components/layout/SideBarTechnical.jsx";
import { AppHeader } from "../../../components/layout/AppHeader.jsx";
import { SearchOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useApi } from "../../../hooks/useApi.js";

const { Title, Link } = Typography;
const { Content } = Layout;
const { RangePicker } = DatePicker;

export function WarehouseHistory() {
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'technical-inventory-history';

    // Filter states
    const [filters, setFilters] = useState({
        transactionType: null,
        searchText: '',
        dateRange: null
    });

    const [historyData, setHistoryData] = useState([]);

    // Modal states
    const [requestModalVisible, setRequestModalVisible] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [requestDetail, setRequestDetail] = useState(null);
    const [reportDetail, setReportDetail] = useState(null);
    const [residentInfo, setResidentInfo] = useState(null);

    // API hooks
    const transactionApi = useApi();
    const requestApi = useApi();
    const reportApi = useApi();
    const userApi = useApi();

    // Fetch warehouse transaction history
    const fetchWarehouseHistory = () => {
        transactionApi.get('/warehouse_transactions');
    };

    useEffect(() => {
        fetchWarehouseHistory();
    }, []);

    // Handle transaction API response
    useEffect(() => {
        if (transactionApi.isSuccess && transactionApi.data) {
            console.log('Raw API Response:', transactionApi.data);

            // transactionApi.data is already the array, not wrapped in {data: [...]}
            const responseData = Array.isArray(transactionApi.data)
                ? transactionApi.data
                : (transactionApi.data.data || []);

            console.log('Response Data:', responseData);

            const formattedData = responseData.map(item => {
                console.log('Processing item:', item);
                return {
                    ...item,
                    key: item.id,
                    // Backend already returns camelCase: transactionType, transactionQuantity, etc.
                    // Just keep them as is
                };
            });

            // Sort by createdAt descending (newest first)
            const sortedData = formattedData.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateB - dateA; // Descending order (newest first)
            });

            console.log('Formatted Data:', sortedData);
            setHistoryData(sortedData);
        }
        if (transactionApi.isError) {
            message.error('Không thể tải lịch sử kho hàng');
        }
    }, [transactionApi.isSuccess, transactionApi.isError, transactionApi.data]);

    // Fetch request detail by ID
    const fetchRequestDetail = (requestId) => {
        setRequestModalVisible(true);
        setRequestDetail(null);
        setResidentInfo(null); // Reset resident info
        requestApi.get(`/requests/${requestId}`);
    };

    // Handle request API response
    useEffect(() => {
        if (requestApi.isSuccess && requestApi.data) {
            console.log('Request API Response:', requestApi.data);

            // Handle both formats: {data: {...}} or direct {...}
            let requestData = null;
            if (requestApi.data.data) {
                requestData = requestApi.data.data;
            } else if (requestApi.data.requestId) {
                requestData = requestApi.data;
            }

            if (requestData) {
                setRequestDetail(requestData);
                // Fetch user info if userId exists
                if (requestData.userId) {
                    userApi.get(`/users/residents/${requestData.userId}`);
                }
            }
        }
        if (requestApi.isError) {
            message.error('Không thể tải thông tin yêu cầu');
            setRequestModalVisible(false);
        }
    }, [requestApi.isSuccess, requestApi.isError, requestApi.data]);

    // Handle user API response
    useEffect(() => {
        if (userApi.isSuccess && userApi.data) {
            console.log('User API Response:', userApi.data);

            let userData = null;
            if (userApi.data.data) {
                userData = userApi.data.data;
            } else if (userApi.data.username) {
                userData = userApi.data;
            }

            if (userData) {
                setResidentInfo({
                    username: userData.username,
                    userCode: userData.userCode
                });
            }
        }
    }, [userApi.isSuccess, userApi.data]);

    // Fetch report detail by ID
    const fetchReportDetail = (reportId) => {
        setReportModalVisible(true);
        setReportDetail(null);
        reportApi.get(`/reports/${reportId}`);
    };

    // Handle report API response
    useEffect(() => {
        if (reportApi.isSuccess && reportApi.data) {
            console.log('Report API Response:', reportApi.data);

            // Handle both formats: {data: {...}} or direct {...}
            let reportData = null;
            if (reportApi.data.data) {
                reportData = reportApi.data.data;
            } else if (reportApi.data.reportId) {
                reportData = reportApi.data;
            }

            if (reportData) {
                setReportDetail(reportData);
            }
        }
        if (reportApi.isError) {
            message.error('Không thể tải thông tin báo cáo');
            setReportModalVisible(false);
        }
    }, [reportApi.isSuccess, reportApi.isError, reportApi.data]);

    const columns = [
        {
            title: "Thời gian",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 180,
            defaultSortOrder: 'descend',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (date) => {
                if (!date) return "-";
                const dateObj = new Date(date);
                return dateObj.toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
        },
        {
            title: "Hành động",
            dataIndex: "transactionType",
            key: "transactionType",
            width: 120,
            filters: [
                { text: "Nhập kho", value: "IMPORT" },
                { text: "Xuất kho", value: "EXPORT" },
            ],
            onFilter: (value, record) => record.transactionType === value,
            render: (transactionType) => (
                <Tag color={transactionType === "IMPORT" ? "green" : "red"}>
                    {transactionType === "IMPORT" ? "Nhập kho" : "Xuất kho"}
                </Tag>
            )
        },
        {
            title: "Số lượng",
            dataIndex: "transactionQuantity",
            key: "transactionQuantity",
            width: 120,
            align: "right",
            render: (quantity, record) => (
                <span style={{
                    color: record.transactionType === "IMPORT" ? "#52c41a" : "#ff4d4f",
                    fontWeight: "bold"
                }}>
                    {record.transactionType === "IMPORT" ? "+" : "-"}{quantity}
                </span>
            )
        },
        {
            title: "Người thực hiện",
            dataIndex: "actionByName",
            key: "actionByName",
            width: 150,
            render: (text) => text || "-"
        },
        {
            title: "Request ID",
            dataIndex: "requestId",
            key: "requestId",
            width: 150,
            ellipsis: true,
            render: (requestId) => requestId ? (
                <Link
                    onClick={() => fetchRequestDetail(requestId)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <EyeOutlined />
                    {String(requestId).substring(0, 8)}...
                </Link>
            ) : "-"
        },
        {
            title: "Report ID",
            dataIndex: "reportId",
            key: "reportId",
            width: 150,
            ellipsis: true,
            render: (reportId) => reportId ? (
                <Link
                    onClick={() => fetchReportDetail(reportId)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <EyeOutlined />
                    {String(reportId).substring(0, 8)}...
                </Link>
            ) : "-"
        },
        {
            title: "Lý do/Ghi chú",
            dataIndex: "note",
            key: "note",
            ellipsis: true,
            render: (text) => text || "Không có ghi chú"
        }
    ];

    // Filter data based on filters state
    const filteredData = historyData.filter(item => {
        // Filter by transaction type
        if (filters.transactionType && item.transactionType !== filters.transactionType) {
            return false;
        }

        // Filter by search text
        if (filters.searchText) {
            const searchLower = filters.searchText.toLowerCase();
            const matchesSearch =
                item.actionByName?.toLowerCase().includes(searchLower) ||
                item.note?.toLowerCase().includes(searchLower) ||
                item.requestId?.toLowerCase().includes(searchLower) ||
                item.reportId?.toLowerCase().includes(searchLower) ||
                item.id?.toLowerCase().includes(searchLower);

            if (!matchesSearch) return false;
        }

        // Filter by date range
        if (filters.dateRange && filters.dateRange.length === 2) {
            const itemDate = dayjs(item.createdAt);
            const startDate = filters.dateRange[0].startOf('day');
            const endDate = filters.dateRange[1].endOf('day');
            if (itemDate.isBefore(startDate) || itemDate.isAfter(endDate)) {
                return false;
            }
        }

        return true;
    });

    const handleResetFilters = () => {
        setFilters({
            transactionType: null,
            searchText: '',
            dateRange: null
        });
    };

    const getRequestStatusColor = (status) => {
        const statusColors = {
            'PENDING': 'orange',
            'APPROVED': 'green',
            'REJECTED': 'red',
            'PROCESSING': 'blue',
            'COMPLETED': 'cyan',
            'CANCELLED': 'default'
        };
        return statusColors[status] || 'default';
    };

    const getReportStatusColor = (status) => {
        const statusColors = {
            'PENDING': 'orange',
            'APPROVED': 'green',
            'REJECTED': 'red',
            'RESOLVED': 'cyan',
            'IN_PROGRESS': 'blue'
        };
        return statusColors[status] || 'default';
    };

    return (
        <Layout className={"!h-screen"}>
            <SideBarTechnical active={activeKey} collapsed={collapsed} />
            <Layout>
                <AppHeader toggleSideBar={() => setCollapsed(!collapsed)} />
                <Content className={"!overflow-auto h-full p-5 flex flex-col"}>
                    <div className="p-0">
                        <Title level={3} style={{ marginBottom: 16 }}>Lịch sử kho kỹ thuật</Title>

                        {/* Filter Section */}
                        <Card className="mb-4">
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Space wrap>
                                    <Input
                                        placeholder="Tìm kiếm theo người thực hiện, ghi chú, ID..."
                                        prefix={<SearchOutlined />}
                                        style={{ width: 400 }}
                                        value={filters.searchText}
                                        onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                                        allowClear
                                    />
                                    <Select
                                        placeholder="Chọn hành động"
                                        style={{ width: 150 }}
                                        allowClear
                                        value={filters.transactionType}
                                        onChange={(value) => setFilters({ ...filters, transactionType: value })}
                                    >
                                        <Select.Option value="IMPORT">Nhập kho</Select.Option>
                                        <Select.Option value="EXPORT">Xuất kho</Select.Option>
                                    </Select>
                                    <RangePicker
                                        placeholder={["Từ ngày", "Đến ngày"]}
                                        format="DD/MM/YYYY"
                                        value={filters.dateRange}
                                        onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                                    />
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleResetFilters}
                                    >
                                        Đặt lại
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<ReloadOutlined />}
                                        onClick={fetchWarehouseHistory}
                                        loading={transactionApi.isLoading}
                                    >
                                        Làm mới
                                    </Button>
                                </Space>
                            </Space>
                        </Card>

                        {/* History Table */}
                        <Card>
                            <div style={{ marginBottom: 16 }}>
                                <Typography.Text strong>
                                    Tổng số bản ghi: {filteredData.length}
                                </Typography.Text>
                            </div>
                            <Table
                                columns={columns}
                                dataSource={filteredData}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Tổng ${total} bản ghi`
                                }}
                                scroll={{ x: true }}
                                loading={transactionApi.isLoading}
                            />
                        </Card>
                    </div>
                </Content>
            </Layout>

            {/* Request Detail Modal */}
            <Modal
                title="Chi tiết yêu cầu"
                open={requestModalVisible}
                onCancel={() => {
                    setRequestModalVisible(false);
                    setRequestDetail(null);
                    setResidentInfo(null);
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        setRequestModalVisible(false);
                        setRequestDetail(null);
                        setResidentInfo(null);
                    }}>
                        Đóng
                    </Button>
                ]}
                width={700}
            >
                {requestApi.isLoading || userApi.isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin size="large" />
                    </div>
                ) : requestDetail ? (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Request ID">
                            <Typography.Text copyable>{requestDetail.requestId}</Typography.Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="User ID">
                            <Typography.Text copyable>{requestDetail.userId}</Typography.Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại yêu cầu">
                            <Tag color="blue">{requestDetail.requestType}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={getRequestStatusColor(requestDetail.status || requestDetail.responseStatus)}>
                                {requestDetail.status || requestDetail.responseStatus}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Username người ở">
                            {residentInfo?.username || (userApi.isLoading ? 'Đang tải...' : 'N/A')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã người ở">
                            {residentInfo?.userCode || (userApi.isLoading ? 'Đang tải...' : 'N/A')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nội dung">
                            {requestDetail.content || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng">
                            {requestDetail.roomName || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Học kỳ">
                            {requestDetail.semesterName || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian tạo">
                            {requestDetail.createTime ? dayjs(requestDetail.createTime).format('DD/MM/YYYY HH:mm:ss') : "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian thực hiện">
                            {requestDetail.executeTime ? dayjs(requestDetail.executeTime).format('DD/MM/YYYY HH:mm:ss') : "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phản hồi từ nhân viên">
                            {requestDetail.ResponseMessageByEmployee || requestDetail.responseMessageByEmployee || requestDetail.responseMessage || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phản hồi từ quản lý">
                            {requestDetail.ResponseMessageByManager || "-"}
                        </Descriptions.Item>
                    </Descriptions>
                ) : null}
            </Modal>

            {/* Report Detail Modal */}
            <Modal
                title="Chi tiết báo cáo"
                open={reportModalVisible}
                onCancel={() => {
                    setReportModalVisible(false);
                    setReportDetail(null);
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        setReportModalVisible(false);
                        setReportDetail(null);
                    }}>
                        Đóng
                    </Button>
                ]}
                width={700}
            >
                {reportApi.isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin size="large" />
                    </div>
                ) : reportDetail ? (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Report ID">
                            <Typography.Text copyable>{reportDetail.reportId}</Typography.Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Employee ID">
                            <Typography.Text copyable>{reportDetail.employeeId}</Typography.Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên nhân viên">
                            {reportDetail.employeeName || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mã người dùng">
                            {reportDetail.userCode || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại báo cáo">
                            <Tag color="purple">{reportDetail.reportType}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={getReportStatusColor(reportDetail.reportStatus)}>
                                {reportDetail.reportStatus}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Nội dung">
                            {reportDetail.content || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phản hồi">
                            {reportDetail.responseMessage || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {reportDetail.createdDate ? dayjs(reportDetail.createdDate).format('DD/MM/YYYY HH:mm:ss') : "-"}
                        </Descriptions.Item>
                    </Descriptions>
                ) : null}
            </Modal>
        </Layout>
    );
}

export default WarehouseHistory;