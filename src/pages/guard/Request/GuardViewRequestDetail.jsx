import React, { useState, useEffect } from "react";
import { GuardSidebar } from "../../../components/layout/GuardSidebar.jsx";
import { AppHeader } from "../../../components/layout/AppHeader.jsx";
import { Layout, Typography, Card, Button, Tag, Descriptions, Spin, Form, Input, Select, App } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useApi } from "../../../hooks/useApi.js";
import { useCollapsed } from "../../../hooks/useCollapsed.js";

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export function GuardViewRequestDetail() {
    const { notification } = App.useApp();
    const { requestId } = useParams();
    const navigate = useNavigate();
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);
    const [requestData, setRequestData] = useState(null);
    const [residentInfo, setResidentInfo] = useState(null);
    const [form] = Form.useForm();

    // API hooks for getting request
    const {
        get: getRequest,
        data: requestResponse,
        isSuccess: isRequestSuccess,
        isLoading: isRequestLoading
    } = useApi();

    // API hooks for updating request
    const {
        put: updateRequest,
        data: updateResponse,
        isSuccess: isUpdateSuccess,
        isComplete: isUpdateComplete,
        isLoading: isUpdateLoading
    } = useApi();

    // API hook to get user by id
    const {
        get: getUserById,
        data: userResponse,
        isSuccess: isUserSuccess,
        isLoading: isUserLoading
    } = useApi();

    // Fetch request details
    const fetchRequestDetails = () => {
        if (requestId) {
            console.log("Fetching request details for ID:", requestId);
            getRequest(`/requests/${requestId}`);
        }
    };

    // Fetch request details on mount
    useEffect(() => {
        fetchRequestDetails();
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
                    requestStatus: requestData.requestStatus || requestData.responseStatus || "PENDING",
                    responseMessage: requestData.responseMessageByEmployee || requestData.responseMessage || requestData.ResponseMessage || ""
                });
            }
        }
    }, [isRequestSuccess, requestResponse, form]);

    // Fetch resident info by userId once request data is available
    useEffect(() => {
        if (requestData?.userId) {
            getUserById(`/users/residents/${requestData.userId}`);
        }
    }, [requestData]);

    // Handle user info response
    useEffect(() => {
        if (isUserSuccess && userResponse) {
            let userData = null;
            if (userResponse.data) {
                userData = userResponse.data;
            } else if (userResponse.username) {
                userData = userResponse;
            }
            if (userData) {
                setResidentInfo({
                    username: userData.username,
                    userCode: userData.userCode
                });
            }
        }
    }, [isUserSuccess, userResponse]);

    // Handle update response
    useEffect(() => {
        if (isUpdateSuccess && updateResponse) {
            notification.success({
                message: 'Cập nhật thành công',
                description: 'Trạng thái request đã được cập nhật thành công!',
                placement: 'topRight',
                duration: 3
            });

            // Refresh request data after successful update
            setTimeout(() => {
                fetchRequestDetails();
            }, 500);
        }
    }, [isUpdateSuccess, updateResponse, notification]);

    // Handle update error
    useEffect(() => {
        if (isUpdateComplete && !isUpdateSuccess) {
            notification.error({
                message: 'Cập nhật thất bại',
                description: 'Có lỗi xảy ra khi cập nhật request. Vui lòng thử lại!',
                placement: 'topRight',
                duration: 3
            });
        }
    }, [isUpdateComplete, isUpdateSuccess, notification]);

    // Status color mapping
    const statusColor = (status) => {
        if (status === "APPROVED" || status === "COMPLETED" || status === "ACCEPTED" || status === "CHECKED") return "green";
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
            CHECKED: "Đã kiểm tra",
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

    // Handle form submission
    const handleUpdateRequest = async (values) => {
        console.log("Updating request with values:", values);

        const updatePayload = {
            requestStatus: values.requestStatus || "CHECKED",
            responseMessage: values.responseMessage
        };

        updateRequest(`/requests/${requestId}`, updatePayload);
    };

    const toggleSideBar = () => {
        setCollapsed(prev => !prev);
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <GuardSidebar collapsed={collapsed} active="guard-requests" />
            <Layout
                style={{
                    marginLeft: collapsed ? 80 : 260,
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <AppHeader
                    toggleSideBar={toggleSideBar}
                    header={
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate("/guard/requests")}
                            >
                                Quay lại
                            </Button>
                            <Title level={2} style={{ margin: 0 }}>
                                {requestData ? `Chi tiết Request #${requestData.requestId?.substring(0, 8)}` : "Chi tiết yêu cầu"}
                            </Title>
                        </div>
                    }
                    collapsed={collapsed}
                />

                <Content style={{ margin: "24px", background: "#fff", padding: 24, marginTop: 64 }}>
                    {isRequestLoading && (
                        <div style={{ textAlign: "center", padding: "60px 0" }}>
                            <Spin size="large" />
                            <p style={{ marginTop: 16 }}>Đang tải thông tin request...</p>
                        </div>
                    )}

                    {!isRequestLoading && !requestData && (
                        <div style={{ textAlign: "center", padding: "60px 0" }}>
                            <h2>Không tìm thấy request</h2>
                            <Button type="primary" onClick={() => navigate("/guard/requests")}>
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
                                        <Descriptions.Item label="Username người ở">
                                            {residentInfo?.username || (isUserLoading ? 'Đang tải...' : 'N/A')}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Mã người ở">
                                            {residentInfo?.userCode || (isUserLoading ? 'Đang tải...' : 'N/A')}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Ngày tạo">
                                            {formatDate(requestData.createTime)}
                                        </Descriptions.Item>
                                        {requestData.executeTime && (
                                            <Descriptions.Item label="Ngày thực hiện">
                                                {formatDate(requestData.executeTime)}
                                            </Descriptions.Item>
                                        )}
                                    </Descriptions>
                                </Card>

                                {/* Update Status Card */}
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
                                            <Select placeholder="Chọn trạng thái cập nhật">
                                                <Option value="PENDING">Đang xử lý (PENDING)</Option>
                                                <Option value="CHECKED">Đã kiểm tra (CHECKED)</Option>
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
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                icon={<SaveOutlined />}
                                                loading={isUpdateLoading}
                                                block
                                                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                                            >
                                                Cập nhật trạng thái
                                            </Button>
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

                            {/* Response Message from Employee */}
                            {requestData.responseMessageByEmployee && (
                                <Card title="Phản hồi từ nhân viên (Bảo vệ)" className="mt-6">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <p className="whitespace-pre-wrap text-blue-800">{requestData.responseMessageByEmployee}</p>
                                    </div>
                                </Card>
                            )}

                            {/* Response Message from Manager */}
                            {requestData.responseMessageByManager && (
                                <Card title="Phản hồi từ quản lý" className="mt-6">
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <p className="whitespace-pre-wrap text-green-800">{requestData.responseMessageByManager}</p>
                                    </div>
                                </Card>
                            )}
                        </>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}