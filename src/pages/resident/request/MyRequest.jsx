import React, {useEffect, useMemo, useRef, useState} from "react";
import {AppLayout} from "../../../components/layout/AppLayout.jsx";
import {Alert, App, Badge, Button, Card, Col, Empty, Row, Select, Space, Spin, Statistic, Table, Tag} from "antd";
import {useLocation, useNavigate} from "react-router-dom";
import {
    CheckCircleOutlined,
    ClearOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    FilterOutlined,
    PlusOutlined
} from "@ant-design/icons";
import {useApi} from "../../../hooks/useApi.js";
import axiosClient from "../../../api/axiosClient/axiosClient.js";

const {Option} = Select;

export function MyRequest() {
    const navigate = useNavigate();
    const location = useLocation();
    const [dataSource, setDataSource] = useState([]);
    const [allData, setAllData] = useState([]);
    const [isResident, setIsResident] = useState(null);
    const [currentSlotData, setCurrentSlotData] = useState(null);
    const hasShownMessage = useRef(false);

    // Filter states
    const [timeFilter, setTimeFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const {get, data: requestsData, isSuccess: isRequestsSuccess, isComplete: isRequestsComplete} = useApi();

    // Check resident status on mount
    useEffect(() => {
        axiosClient.get("/slots/current")
            .then(data => {
                setCurrentSlotData(data);
                if (data && data.data && data.data.status === "UNAVAILABLE") {
                    setIsResident(true);
                } else {
                    setIsResident(false);
                }
            })
            .catch(err => {
                console.error("Error checking resident status:", err);
                setIsResident(false);
            });
    }, []);

    // Fetch requests on mount
    useEffect(() => {
        get("/requests");
    }, [get]);

    // Update dataSource when requests are loaded
    useEffect(() => {
        if (requestsData) {
            let dataArray = [];

            if (Array.isArray(requestsData)) {
                dataArray = requestsData;
            } else if (requestsData.data && Array.isArray(requestsData.data)) {
                dataArray = requestsData.data;
            } else if (requestsData.data && requestsData.data.data && Array.isArray(requestsData.data.data)) {
                dataArray = requestsData.data.data;
            }

            if (dataArray.length > 0) {
                const formattedData = dataArray.map((item) => ({
                    key: item.requestId,
                    requestId: item.requestId,
                    requestType: item.requestType,
                    content: "N/A",
                    reply: "N/A",
                    semester: item.semesterName,
                    createdDate: item.createTime,
                    status: item.responseStatus,
                    userName: item.userName,
                }));

                setAllData(formattedData);
                setDataSource(formattedData);
            } else {
                setAllData([]);
                setDataSource([]);
            }
        }
    }, [isRequestsSuccess, requestsData, isRequestsComplete]);

    const statusColor = (status) => {
        if (status === "APPROVED" || status === "COMPLETED") return "green";
        if (status === "PENDING" || status === "PROCESSING") return "blue";
        if (status === "REJECTED" || status === "CANCELLED") return "red";
        return "default";
    };

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

    const requestTypes = useMemo(() => {
        const types = [...new Set(allData.map(item => item.requestType))];
        return types;
    }, [allData]);

    const statuses = useMemo(() => {
        const statusList = [...new Set(allData.map(item => item.status))];
        return statusList;
    }, [allData]);

    // Filter data based on selected filters
    const filteredData = useMemo(() => {
        let filtered = [...allData];

        if (timeFilter !== "all") {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekStart = new Date(todayStart);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            filtered = filtered.filter(item => {
                if (!item.createdDate) return false;
                const itemDate = new Date(item.createdDate);

                if (timeFilter === "today") {
                    return itemDate >= todayStart;
                } else if (timeFilter === "week") {
                    return itemDate >= weekStart;
                } else if (timeFilter === "month") {
                    return itemDate >= monthStart;
                }
                return true;
            });
        }

        if (typeFilter !== "all") {
            filtered = filtered.filter(item => item.requestType === typeFilter);
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(item => item.status === statusFilter);
        }

        return filtered;
    }, [allData, timeFilter, typeFilter, statusFilter]);

    useEffect(() => {
        setDataSource(filteredData);
    }, [filteredData]);

// Hiển thị thông báo thành công khi tạo request xong
    const {message} = App.useApp()
    useEffect(() => {
        if (location.state?.showSuccessMessage && !hasShownMessage.current) {
            console.log("✅ Showing success message");

            message.success('Yêu cầu đã được tạo thành công!');

            hasShownMessage.current = true;

            // Clear state
            navigate(location.pathname, {replace: true, state: {}});
        }
    }, [location.state, navigate, location.pathname]);


    // Statistics calculations
    const stats = useMemo(() => {
        const processing = filteredData.filter((d) =>
            d.status === "PENDING" || d.status === "PROCESSING" || d.status === "CHECKED"
        ).length;

        const completed = filteredData.filter((d) =>
            d.status === "APPROVED" || d.status === "COMPLETED"
        ).length;

        const rejected = filteredData.filter((d) =>
            d.status === "REJECTED" || d.status === "CANCELLED"
        ).length;

        return {processing, completed, rejected, total: filteredData.length};
    }, [filteredData]);

    const columns = [
        {
            title: "Loại yêu cầu",
            dataIndex: "requestType",
            key: "requestType",
            width: 200,
            sorter: (a, b) => a.requestType.localeCompare(b.requestType),
            render: (type) => (
                <Space>
                    <FileTextOutlined style={{color: '#004aad'}}/>
                    <span>{formatRequestType(type)}</span>
                </Space>
            ),
        },
        {
            title: "Học kỳ",
            dataIndex: "semester",
            key: "semester",
            width: 150,
            sorter: (a, b) => (a.semester || '').localeCompare(b.semester || ''),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdDate",
            key: "createdDate",
            width: 180,
            sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
            defaultSortOrder: 'descend',
            render: (date) => {
                if (!date) return "N/A";
                const d = new Date(date);
                return (
                    <Space direction="vertical" size={0}>
                        <span>{d.toLocaleDateString('vi-VN')}</span>
                        <span style={{fontSize: '12px', color: '#999'}}>
                            {d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
                        </span>
                    </Space>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            width: 160,
            sorter: (a, b) => a.status.localeCompare(b.status),
            render: (status) => {
                const displayStatus = status === "CHECKED" ? "PENDING" : status;
                return (
                    <Tag
                        color={statusColor(displayStatus)}
                        style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontWeight: '500'
                        }}
                    >
                        {formatStatus(displayStatus)}
                    </Tag>
                );
            },
        },
        {
            title: "Thao tác",
            key: "details",
            width: 130,
            fixed: 'right',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate(`/resident-request-detail/${record.requestId}`)}
                    style={{backgroundColor: '#004aad'}}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    const isLoading = !isRequestsComplete;

    if (isResident === null) {
        return (
            <Spin spinning={true}>
                <AppLayout>
                    <div className="p-4">
                        <Card>
                            <Empty description="Đang kiểm tra trạng thái..."/>
                        </Card>
                    </div>
                </AppLayout>
            </Spin>
        );
    }

    if (isResident === false) {
        return (
            <AppLayout>
                <div className="p-4">
                    <Card>
                        <Alert
                            message="Thông báo"
                            description="Bạn không phải là người ở. Chỉ những người đã đăng ký và ở trong phòng mới có thể tạo yêu cầu."
                            type="warning"
                            showIcon
                            action={
                                <Button
                                    type="primary"
                                    onClick={() => navigate("/pages/booking")}
                                    style={{backgroundColor: '#004aad'}}
                                >
                                    Đăng ký phòng
                                </Button>
                            }
                        />
                    </Card>
                </div>
            </AppLayout>
        );
    }

    const hasActiveFilters = timeFilter !== "all" || typeFilter !== "all" || statusFilter !== "all";

    return (
        <Spin spinning={isLoading}>
            <AppLayout>
                <div className="p-6" style={{background: '#f5f5f5', minHeight: '100vh'}}>
                    {/* Header with gradient */}
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #004aad 0%, #0066cc 100%)',
                            borderRadius: '12px',
                            padding: '24px',
                            marginBottom: '24px',
                            boxShadow: '0 4px 12px rgba(0, 74, 173, 0.15)'
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">
                                    Yêu cầu của tôi
                                </h1>
                                <p className="text-blue-100">
                                    Quản lý và theo dõi tất cả yêu cầu của bạn
                                </p>
                            </div>
                            <Button
                                type="primary"
                                size="large"
                                icon={<PlusOutlined/>}
                                onClick={() => navigate("/create-request")}
                                style={{
                                    backgroundColor: 'white',
                                    color: '#004aad',
                                    border: 'none',
                                    height: '48px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                Tạo yêu cầu mới
                            </Button>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} sm={12} lg={6}>
                            <Card
                                hoverable
                                style={{
                                    borderRadius: '12px',
                                    border: '1px solid #e8e8e8',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}
                            >
                                <Statistic
                                    title={<span style={{color: '#666', fontSize: '14px'}}>Tổng yêu cầu</span>}
                                    value={stats.total}
                                    prefix={<FileTextOutlined style={{color: '#004aad'}}/>}
                                    valueStyle={{color: '#004aad', fontWeight: 'bold'}}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card
                                hoverable
                                style={{
                                    borderRadius: '12px',
                                    border: '1px solid #e8e8e8',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}
                            >
                                <Statistic
                                    title={<span style={{color: '#666', fontSize: '14px'}}>Đang xử lý</span>}
                                    value={stats.processing}
                                    prefix={<ClockCircleOutlined style={{color: '#1890ff'}}/>}
                                    valueStyle={{color: '#1890ff', fontWeight: 'bold'}}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card
                                hoverable
                                style={{
                                    borderRadius: '12px',
                                    border: '1px solid #e8e8e8',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}
                            >
                                <Statistic
                                    title={<span style={{color: '#666', fontSize: '14px'}}>Hoàn thành</span>}
                                    value={stats.completed}
                                    prefix={<CheckCircleOutlined style={{color: '#52c41a'}}/>}
                                    valueStyle={{color: '#52c41a', fontWeight: 'bold'}}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card
                                hoverable
                                style={{
                                    borderRadius: '12px',
                                    border: '1px solid #e8e8e8',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}
                            >
                                <Statistic
                                    title={<span style={{color: '#666', fontSize: '14px'}}>Từ chối</span>}
                                    value={stats.rejected}
                                    prefix={<CloseCircleOutlined style={{color: '#ff4d4f'}}/>}
                                    valueStyle={{color: '#ff4d4f', fontWeight: 'bold'}}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Filters */}
                    <Card
                        className="mb-4"
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                        title={
                            <Space>
                                <FilterOutlined style={{color: '#004aad'}}/>
                                <span style={{color: '#004aad', fontWeight: '600'}}>Bộ lọc</span>
                                {hasActiveFilters && (
                                    <Badge
                                        count="Đang lọc"
                                        style={{backgroundColor: '#52c41a'}}
                                    />
                                )}
                            </Space>
                        }
                        extra={
                            hasActiveFilters && (
                                <Button
                                    icon={<ClearOutlined/>}
                                    onClick={() => {
                                        setTimeFilter("all");
                                        setTypeFilter("all");
                                        setStatusFilter("all");
                                    }}
                                >
                                    Xóa bộ lọc
                                </Button>
                            )
                        }
                    >
                        <Row gutter={[24, 16]}>
                            <Col xs={24} sm={24} md={8}>
                                <div>
                                    <div style={{
                                        marginBottom: '12px',
                                        fontWeight: '600',
                                        color: '#333',
                                        fontSize: '15px'
                                    }}>
                                        Thời gian
                                    </div>
                                    <Select
                                        value={timeFilter}
                                        onChange={setTimeFilter}
                                        style={{width: "100%"}}
                                        placeholder="Chọn khoảng thời gian"
                                        size="large"
                                    >
                                        <Option value="all">Tất cả</Option>
                                        <Option value="today">Hôm nay</Option>
                                        <Option value="week">Tuần này</Option>
                                        <Option value="month">Tháng này</Option>
                                    </Select>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={8}>
                                <div>
                                    <div style={{
                                        marginBottom: '12px',
                                        fontWeight: '600',
                                        color: '#333',
                                        fontSize: '15px'
                                    }}>
                                        Loại yêu cầu
                                    </div>
                                    <Select
                                        value={typeFilter}
                                        onChange={setTypeFilter}
                                        style={{width: "100%"}}
                                        placeholder="Chọn loại yêu cầu"
                                        size="large"
                                    >
                                        <Option value="all">Tất cả</Option>
                                        {requestTypes.map(type => (
                                            <Option key={type} value={type}>
                                                {formatRequestType(type)}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                            <Col xs={24} sm={24} md={8}>
                                <div>
                                    <div style={{
                                        marginBottom: '12px',
                                        fontWeight: '600',
                                        color: '#333',
                                        fontSize: '15px'
                                    }}>
                                        Trạng thái
                                    </div>
                                    <Select
                                        value={statusFilter}
                                        onChange={setStatusFilter}
                                        style={{width: "100%"}}
                                        placeholder="Chọn trạng thái"
                                        size="large"
                                    >
                                        <Option value="all">Tất cả</Option>
                                        {statuses.map(status => (
                                            <Option key={status} value={status}>
                                                {formatStatus(status === "CHECKED" ? "PENDING" : status)}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                        </Row>
                    </Card>

                    {/* Table */}
                    <Card
                        style={{
                            borderRadius: '12px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                        bodyStyle={{padding: 0}}
                    >
                        <Table
                            dataSource={filteredData}
                            columns={columns}
                            bordered={false}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng ${total} yêu cầu`,
                                style: {padding: '16px'}
                            }}
                            scroll={{x: 800}}
                            locale={{emptyText: "Không tìm thấy yêu cầu nào"}}
                            loading={isLoading}
                            style={{
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}
                        />
                    </Card>
                </div>
            </AppLayout>
        </Spin>

    );
}