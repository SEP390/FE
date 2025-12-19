import React, { useState, useEffect } from "react";
import { SideBarManager } from "../../../components/layout/SideBarManger.jsx";
import { AppHeader } from "../../../components/layout/AppHeader.jsx";
import { Layout, Typography, Card, Button, Tag, Form, Select, Input, message, Space, Spin, Descriptions, Row, Col } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useApi } from "../../../hooks/useApi.js";

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function RequestDetailPage() {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [form] = Form.useForm();
    const [requestData, setRequestData] = useState(null);
    const [residentInfo, setResidentInfo] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [acceptanceFormData, setAcceptanceFormData] = useState(null);

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

    // API hook to get user by id
    const {
        get: getUserById,
        data: userResponse,
        isSuccess: isUserSuccess,
        isComplete: isUserComplete,
        isLoading: isUserLoading
    } = useApi();

    // Parse acceptance form from text
    const parseAcceptanceFormFromText = (text) => {
        if (!text || !text.includes('BIÊN BẢN NGHIỆM THU')) {
            return null;
        }

        const parsed = {
            giuong: { tot: false, hong: false },
            ghe: { tot: false, hong: false },
            ban: { tot: false, hong: false },
            tu: { tot: false, hong: false },
            ghichu: ""
        };

        const lines = text.split('\n');
        lines.forEach(line => {
            if (line.includes('Giường:')) {
                parsed.giuong.tot = line.includes('☑ Tốt');
                parsed.giuong.hong = line.includes('☑ Hỏng');
            } else if (line.includes('Ghế:')) {
                parsed.ghe.tot = line.includes('☑ Tốt');
                parsed.ghe.hong = line.includes('☑ Hỏng');
            } else if (line.includes('Bàn:')) {
                parsed.ban.tot = line.includes('☑ Tốt');
                parsed.ban.hong = line.includes('☑ Hỏng');
            } else if (line.includes('Tủ:')) {
                parsed.tu.tot = line.includes('☑ Tốt');
                parsed.tu.hong = line.includes('☑ Hỏng');
            } else if (line.includes('Ghi chú:')) {
                parsed.ghichu = line.replace('Ghi chú:', '').trim();
            }
        });

        return parsed;
    };

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
                    responseMessageByManager: requestData.responseMessageByManager || ""
                });

                // Parse acceptance form if exists and request type is CHECKOUT
                if (requestData.requestType === "CHECKOUT" && requestData.responseMessageByEmployee) {
                    const parsedForm = parseAcceptanceFormFromText(requestData.responseMessageByEmployee);
                    setAcceptanceFormData(parsedForm);
                }
            }
        }
    }, [isRequestSuccess, requestResponse]);

    // Fetch resident info by userId once request data is available
    useEffect(() => {
        if (requestData?.userId) {
            getUserById(`/users/residents/${requestData.userId}`);
        }
    }, [requestData, getUserById]);

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
        if (status === "ACCEPTED" || status === "CHECKED" || status === "APPROVED" || status === "COMPLETED") return "green";
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

    // Format request type - Cập nhật đồng bộ với ManagerRequests.jsx
    const formatRequestType = (type) => {
        const typeMap = {
            CHECKOUT: "Yêu cầu trả phòng",
            METER_READING_DISCREPANCY: "Kiểm tra sai số điện/nước",
            SECURITY_INCIDENT: "Sự cố an ninh",
            TECHNICAL_ISSUE: "Sự cố kỹ thuật",
            POLICY_VIOLATION_REPORT: "Báo cáo vi phạm quy định",
            CHANGEROOM: "Yêu cầu đổi phòng",
            ANONYMOUS: "Yêu cầu ẩn danh",
            MAINTENANCE: "Bảo trì", // Giữ lại để tương thích ngược nếu có
            COMPLAINT: "Khiếu nại", // Giữ lại để tương thích ngược nếu có
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
            responseMessage: values.responseMessageByManager
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

    // Render acceptance form display
    const renderAcceptanceFormDisplay = () => {
        if (!acceptanceFormData || requestData?.requestType !== "CHECKOUT") {
            return null;
        }

        const items = [
            { key: 'giuong', label: 'Giường' },
            { key: 'ghe', label: 'Ghế' },
            { key: 'ban', label: 'Bàn' },
            { key: 'tu', label: 'Tủ' }
        ];

        return (
            <Card
                title="Biên bản nghiệm thu tình trạng phòng"
                className="mt-6"
                style={{ background: '#f0f7ff', borderColor: '#1890ff' }}
            >
                <div style={{ padding: '16px' }}>
                    {items.map(item => (
                        <Row key={item.key} style={{ marginBottom: 16, padding: '12px', background: 'white', borderRadius: '8px' }} align="middle">
                            <Col span={6}>
                                <strong style={{ fontSize: '16px' }}>{item.label}:</strong>
                            </Col>
                            <Col span={9}>
                                <Space>
                                    {acceptanceFormData[item.key].tot ? (
                                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                                    ) : (
                                        <CloseCircleOutlined style={{ color: '#d9d9d9', fontSize: '18px' }} />
                                    )}
                                    <span style={{ color: acceptanceFormData[item.key].tot ? '#52c41a' : '#8c8c8c' }}>
                                        Tốt
                                    </span>
                                </Space>
                            </Col>
                            <Col span={9}>
                                <Space>
                                    {acceptanceFormData[item.key].hong ? (
                                        <CheckCircleOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
                                    ) : (
                                        <CloseCircleOutlined style={{ color: '#d9d9d9', fontSize: '18px' }} />
                                    )}
                                    <span style={{ color: acceptanceFormData[item.key].hong ? '#ff4d4f' : '#8c8c8c' }}>
                                        Hỏng
                                    </span>
                                </Space>
                            </Col>
                        </Row>
                    ))}

                    {acceptanceFormData.ghichu && (
                        <div style={{ marginTop: 24, padding: '12px', background: '#fff9e6', borderRadius: '8px', border: '1px solid #ffd666' }}>
                            <strong style={{ display: 'block', marginBottom: 8 }}>Ghi chú:</strong>
                            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{acceptanceFormData.ghichu}</p>
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <SideBarManager collapsed={collapsed} active="manager-requests" />
            <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: "all 0.2s" }}>
                <AppHeader
                    toggleSideBar={() => setCollapsed(!collapsed)}
                    header="Chi tiết yêu cầu"
                    collapsed={collapsed}
                />
                <Content
                    style={{
                        marginTop: "64px",
                        padding: 24,
                        minHeight: 'calc(100vh - 64px)',
                        background: '#f0f2f5'
                    }}
                >
                    <div style={{ background: "#fff", padding: 24, borderRadius: "8px" }}>
                        <Space style={{ marginBottom: 24 }}>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate("/manager/requests")}
                            >
                                Quay lại
                            </Button>
                            <Title level={2} style={{ margin: 0 }}>
                                {requestData ? `Chi tiết Request ` : "Chi tiết yêu cầu"}
                            </Title>
                        </Space>

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
                                                    <Option value="ACCEPTED">Chấp nhận</Option>
                                                    <Option value="REJECTED">Từ chối</Option>
                                                </Select>
                                            </Form.Item>

                                            <Form.Item
                                                label="Tin nhắn phản hồi"
                                                name="responseMessageByManager"
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

                                {/* Display Acceptance Form if available */}
                                {renderAcceptanceFormDisplay()}

                                {/* Response Message from Employee (show raw text if not acceptance form) */}
                                {requestData.responseMessageByEmployee && !acceptanceFormData && (
                                    <Card title="Tin nhắn phản hồi từ nhân viên" className="mt-6">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="whitespace-pre-wrap">{requestData.responseMessageByEmployee}</p>
                                        </div>
                                    </Card>
                                )}

                                {/* Response Message from Manager */}
                                {requestData.responseMessageByManager && (
                                    <Card title="Tin nhắn phản hồi từ quản lý" className="mt-6">
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <p className="whitespace-pre-wrap">{requestData.responseMessageByManager}</p>
                                        </div>
                                    </Card>
                                )}

                            </>
                        )}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}