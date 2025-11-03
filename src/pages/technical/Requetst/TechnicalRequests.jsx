import React, {useState, useEffect} from "react";
import { Card, Table, Tag, Typography, Layout, Button } from "antd";
import { SideBarTechnical } from "../../../components/layout/SideBarTechnical.jsx";
import { AppHeader } from "../../../components/layout/AppHeader.jsx";
import { useApi } from "../../../hooks/useApi.js";
import { useNavigate } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Content } = Layout;

export function TechnicalRequests() {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const activeKey = 'technical-requests';
    
    // API call for requests
    const { get: getRequests, data: requestsData, isSuccess: isRequestsSuccess, isComplete: isRequestsComplete } = useApi();

    // Fetch requests on mount
    useEffect(() => {
        console.log("Fetching all requests...");
        getRequests("/requests");
    }, []);

    // Update dataSource when requests are loaded and filter for MAINTENANCE requests
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
                // Filter for TECHNICAL_ISSUE requests only (all statuses)
                const technicalRequests = dataArray.filter(item => item.requestType === "TECHNICAL_ISSUE");
                console.log("Technical requests:", technicalRequests);

                // Map dữ liệu từ backend response
                const formattedData = technicalRequests.map((item) => {
                    console.log("Mapping item:", item);
                    return {
                        key: item.requestId,
                        code: `RQ-${item.requestId}`,
                        requestId: item.requestId,
                        title: item.title || "Yêu cầu bảo trì",
                        createdAt: item.createTime,
                        room: item.roomName || "N/A",
                        status: item.responseStatus,
                    };
                });

                console.log("Formatted data:", formattedData);
                setDataSource(formattedData);
            } else {
                console.log("Data array is empty");
                setDataSource([]);
            }
        } else {
            console.log("requestsData is null or undefined");
        }
    }, [isRequestsSuccess, requestsData, isRequestsComplete]);

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

    const columns = [
        { title: "Mã YC", dataIndex: "code", key: "code", width: 120 },
        { title: "Tiêu đề", dataIndex: "title", key: "title" },
        { 
            title: "Ngày tạo", 
            dataIndex: "createdAt", 
            key: "createdAt", 
            width: 160,
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
            }
        },
        { title: "Phòng", dataIndex: "room", key: "room", width: 100 },
        { 
            title: "Trạng thái", 
            dataIndex: "status", 
            key: "status", 
            width: 140, 
            render: (status) => (
                <Tag color={statusColor(status)}>
                    {formatStatus(status)}
                </Tag>
            )
        },
        {
            title: "Thao tác",
            key: "action",
            width: 130,
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/technical/request-detail/${record.requestId}`)}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    const isLoading = !isRequestsComplete;

    return (
        <Layout className={"!h-screen"}>
            <SideBarTechnical active={activeKey} collapsed={collapsed} />
            <Layout>
                <AppHeader toggleSideBar={() => setCollapsed(!collapsed)} />
                <Content className={"!overflow-auto h-full p-5 flex flex-col"}>
                    <div className="p-0">
                        <Title level={3} style={{ marginBottom: 16 }}>Yêu cầu kỹ thuật</Title>
                        <Card>
                            <Table 
                                columns={columns} 
                                dataSource={dataSource} 
                                pagination={{ pageSize: 10 }} 
                                loading={isLoading}
                                locale={{ emptyText: "Không có yêu cầu kỹ thuật nào" }}
                            />
                        </Card>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default TechnicalRequests;


