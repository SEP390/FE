import React, { useState, useEffect } from "react";
import { AppLayout } from "../../../components/layout/AppLayout.jsx";
import { Layout, Typography, Card, Button, Tag, Spin, Descriptions, Alert } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useApi } from "../../../hooks/useApi.js";

const { Header, Content } = Layout;
const { Title } = Typography;

export function ResidentRequestDetail() {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const [requestData, setRequestData] = useState(null);

    // API hooks
    const {
        get: getRequest,
        data: requestResponse,
        isSuccess: isRequestSuccess,
        isComplete: isRequestComplete,
        isLoading: isRequestLoading
    } = useApi();

    // Fetch request details on mount
    useEffect(() => {
        if (requestId) {
            console.log("Fetching request details for ID:", requestId);
            getRequest(`/requests/${requestId}`);
        }
    }, [requestId, getRequest]);

    // Handle request data response
    useEffect(() => {
        if (isRequestSuccess && requestResponse) {
            console.log("Request data received:", requestResponse);

            let requestData = null;
            if (requestResponse.data) {
                requestData = requestResponse.data;
            } else if (requestResponse.requestId) {
                requestData = requestResponse;
            }

            if (requestData) {
                setRequestData(requestData);
            }
        }
    }, [isRequestSuccess, requestResponse]);

    // Status color mapping
    const statusColor = (status) => {
        if (status === "ACCEPTED" || status === "APPROVED") return "green";
        if (status === "PENDING" || status === "PROCESSING") return "blue";
        if (status === "REJECTED" || status === "CANCELLED") return "red";
        return "default";
    };

    // Format status text
    const formatStatus = (status) => {
        const statusMap = {
            PENDING: "Đang xử lý",
            PROCESSING: "Đang xử lý",
            ACCEPTED: "Đã chấp nhận",
            APPROVED: "Đã duyệt",
            REJECTED: "Từ chối",
            CANCELLED: "Đã hủy",
            COMPLETED: "Hoàn thành"
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

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout>
            <div className="p-4">
                {/* Header with back button */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/my-requests")}
                        size="large"
                    >
                        Quay lại
                    </Button>
                    <Title level={2} style={{ margin: 0, color: "#004aad" }}>
                        {requestData ? `Chi tiết Request #${requestData.requestId?.substring(0, 8)}` : "Chi tiết yêu cầu"}
                    </Title>
                </div>

                {/* Loading state */}
                {isRequestLoading && (
                    <div style={{ textAlign: "center", padding: "60px 0" }}>
                        <Spin size="large" />
                        <p style={{ marginTop: 16 }}>Đang tải thông tin request...</p>
                    </div>
                )}

                {/* Error state */}
                {!isRequestLoading && isRequestComplete && !isRequestSuccess && (
                    <Alert
                        message="Lỗi"
                        description="Không thể tải thông tin request. Vui lòng thử lại sau."
                        type="error"
                        showIcon
                        action={
                            <Button type="primary" onClick={() => navigate("/my-requests")}>
                                Quay lại danh sách
                            </Button>
                        }
                    />
                )}

                {/* No data state */}
                {!isRequestLoading && isRequestComplete && isRequestSuccess && !requestData && (
                    <Alert
                        message="Không tìm thấy request"
                        description="Request không tồn tại hoặc bạn không có quyền xem."
                        type="warning"
                        showIcon
                        action={
                            <Button type="primary" onClick={() => navigate("/my-requests")}>
                                Quay lại danh sách
                            </Button>
                        }
                    />
                )}

                {/* Request details */}
                {!isRequestLoading && requestData && (
                    <div className="space-y-6">
                        {/* Request Information Card */}
                        <Card title="Thông tin Request" className="shadow-sm">
                            <Descriptions column={1} bordered size="middle">
                                <Descriptions.Item label="Request ID">
                                    <span className="font-mono text-sm">{requestData.requestId || 'N/A'}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Loại Request">
                                    <Tag color="blue" className="text-sm">
                                        {formatRequestType(requestData.requestType)}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag color={statusColor(requestData.responseStatus || requestData.requestStatus)} className="text-sm">
                                        {formatStatus(requestData.responseStatus || requestData.requestStatus)}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Tên phòng">
                                    {requestData.roomName || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Học kỳ">
                                    {requestData.semesterName || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày tạo">
                                    {formatDate(requestData.createTime)}
                                </Descriptions.Item>
                                {requestData.executeTime && (
                                    <Descriptions.Item label="Ngày thực hiện">
                                        {formatDate(requestData.executeTime)}
                                    </Descriptions.Item>
                                )}
                                {requestData.userName && (
                                    <Descriptions.Item label="Người tạo">
                                        {requestData.userName}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>

                        {/* Request Content Card */}
                        <Card title="Nội dung Request" className="shadow-sm">
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                    {requestData.content || "Không có nội dung"}
                                </p>
                            </div>
                        </Card>

                        {/* Response Message Card */}
                        {(requestData.responseMessage || requestData.ResponseMessage) && (
                            <Card title="Phản hồi từ quản lý" className="shadow-sm">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <p className="whitespace-pre-wrap text-blue-800 leading-relaxed">
                                        {requestData.responseMessage || requestData.ResponseMessage}
                                    </p>
                                </div>
                            </Card>
                        )}

                        {/* Action buttons */}
                        <div className="flex justify-center gap-4 pt-4">
                            <Button
                                type="primary"
                                onClick={() => navigate("/my-requests")}
                                size="large"
                                style={{ backgroundColor: "#004aad", borderColor: "#004aad" }}
                            >
                                Quay lại danh sách
                            </Button>
                            <Button
                                onClick={() => navigate("/create-request")}
                                size="large"
                            >
                                Tạo request mới
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
