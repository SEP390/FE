import React, { useState, useEffect } from "react";
import { SideBarManager } from "../../../components/layout/SideBarManger.jsx";
import { Layout, Typography, Card, Button, Tag, Form, Select, Input, message, Space, Spin, Descriptions } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useApi } from "../../../hooks/useApi.js";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function RequestDetailPage() {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const [collapsed] = useState(false);
    const [form] = Form.useForm();
    const [requestData, setRequestData] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // API hooks
    const {
        get: getRequest,
        put: updateRequest,
        data: requestResponse,
        isSuccess: isRequestSuccess,
        isComplete: isRequestComplete,
        isLoading: isRequestLoading
    } = useApi();

    const {
        data: updateResponse,
        isSuccess: isUpdateSuccess,
        isComplete: isUpdateComplete,
        isLoading: isUpdateLoading
    } = useApi();

    // Fetch request details on mount
    useEffect(() => {
        if (requestId) {
            console.log("Fetching request details for ID:", requestId);
            getRequest(`/requests/${requestId}`);
        }
    }, [requestId]);

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
                // Set form values
                form.setFieldsValue({
                    requestStatus: requestData.responseStatus || requestData.requestStatus,
                    responseMessage: requestData.responseMessage || requestData.ResponseMessage || ""
                });

                // Note: We don't fetch student info here because there's no API endpoint
                // to get another user's profile by userId. The /users/profile endpoint only 
                // returns the current authenticated user's information.
                // We'll just show the userId in the display if needed.
            }
        }
    }, [isRequestSuccess, requestResponse]);

    // Handle update response
    useEffect(() => {
        if (isUpdateSuccess && updateResponse) {
            message.success("Cập nhật trạng thái request thành công!");
            setIsUpdating(false);
            // Refresh request data
            getRequest(`/requests/${requestId}`);
        }
    }, [isUpdateSuccess, updateResponse]);

    // Handle update error
    useEffect(() => {
        if (isUpdateComplete && !isUpdateSuccess) {
            message.error("Có lỗi xảy ra khi cập nhật request!");
            setIsUpdating(false);
        }
    }, [isUpdateComplete, isUpdateSuccess]);

    // Status color mapping
    const statusColor = (status) => {
        if (status === "ACCEPTED") return "green";
        if (status === "PENDING") return "blue";
        if (status === "REJECTED") return "red";
        return "default";
    };

    // Format status text
    const formatStatus = (status) => {
        const statusMap = {
            PENDING: "Đang xử lý",
            ACCEPTED: "Đã chấp nhận",
            REJECTED: "Từ chối"
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

    // Handle form submission
    const handleUpdateRequest = async (values) => {
        setIsUpdating(true);
        console.log("Updating request with values:", values);

        const updatePayload = {
            requestStatus: values.requestStatus,
            responseMessage: values.responseMessage
        };

        updateRequest(`/requests/${requestId}`, updatePayload);
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
        <Layout style={{ minHeight: "100vh" }}>
            <SideBarManager collapsed={collapsed} active="manager-requests" />
            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 24px",
                        borderBottom: "1px solid #f0f0f0",
                        height: 80,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", width: "100%" }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/manager/requests")}
                        >
                            Quay lại
                        </Button>
                        <Title level={2} style={{ margin: 0 }}>
                            {requestData ? `Chi tiết Request #${requestData.requestId?.substring(0, 8)}` : "Chi tiết yêu cầu"}
                        </Title>
                    </div>
                </Header>

                <Content style={{ margin: "24px", background: "#fff", padding: 24 }}>
                    {isRequestLoading && (
                        <div style={{ textAlign: "center", padding: "60px 0" }}>
                            <Spin size="large" />
                            <p style={{ marginTop: 16 }}>Đang tải thông tin request...</p>
                        </div>
                    )}

                    {!isRequestLoading && !requestData && (
                        <div style={{ textAlign: "center", padding: "60px 0" }}>
                            <h2>Không tìm thấy request</h2>
                            <Button type="primary" onClick={() => navigate("/manager/requests")}>
                                Quay lại danh sách
                            </Button>
                        </div>
                    )}

                    {!isRequestLoading && requestData && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Request Information */}
                                <Card title="Thông tin Request" className="h-fit">
                                    <Descriptions column={1} bordered size="small">
                                        <Descriptions.Item label="Request ID">
                                            {requestData.requestId || 'N/A'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Loại Request">
                                            {formatRequestType(requestData.requestType)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Trạng thái">
                                                <Tag color={statusColor(requestData.responseStatus || requestData.requestStatus)}>
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
                                        {requestData.userId && (
                                            <Descriptions.Item label="User ID">
                                                {requestData.userId}
                                            </Descriptions.Item>
                                        )}
                                    </Descriptions>
                                </Card>

                                {/* Update Form */}
                                <Card title="Cập nhật trạng thái" className="h-fit">
                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onFinish={handleUpdateRequest}
                                        disabled={isUpdateLoading}
                                    >
                                        <Form.Item
                                            label="Trạng thái mới"
                                            name="requestStatus"
                                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                                        >
                                            <Select placeholder="Chọn trạng thái">
                                                <Option value="PENDING">Đang xử lý</Option>
                                                <Option value="ACCEPTED">Chấp nhận</Option>
                                                <Option value="REJECTED">Từ chối</Option>
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            label="Tin nhắn phản hồi"
                                            name="responseMessage"
                                            rules={[{ required: true, message: 'Vui lòng nhập tin nhắn phản hồi!' }]}
                                        >
                                            <TextArea
                                                rows={4}
                                                placeholder="Nhập tin nhắn phản hồi cho sinh viên..."
                                            />
                                        </Form.Item>

                                        <Form.Item>
                                            <Space>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    icon={<SaveOutlined />}
                                                    loading={isUpdateLoading}
                                                >
                                                    Cập nhật
                                                </Button>
                                                <Button onClick={() => form.resetFields()}>
                                                    Đặt lại
                                                </Button>
                                            </Space>
                                        </Form.Item>
                                    </Form>
                                </Card>
                            </div>

                            {/* Request Content */}
                            <Card title="Nội dung Request" className="mt-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="whitespace-pre-wrap">{requestData.content || "Không có nội dung"}</p>
                                </div>
                            </Card>

                            {/* Response Message */}
                            {requestData.responseMessage || requestData.ResponseMessage ? (
                                <Card title="Tin nhắn phản hồi" className="mt-6">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="whitespace-pre-wrap">{requestData.responseMessage || requestData.ResponseMessage}</p>
                                    </div>
                                </Card>
                            ) : null}

                        </>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}