import React, { useState, useEffect } from "react";
import { Typography, Card, Button, Tag, Descriptions, Spin, Form, Input, Select, App, Row, Col, Radio } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { useApi } from "../../../hooks/useApi.js";
// Import LayoutGuard
import { LayoutGuard } from "../../../components/layout/LayoutGuard.jsx";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export function GuardViewRequestDetail() {
    const { notification } = App.useApp();
    const { requestId } = useParams();
    const navigate = useNavigate();

    // Không cần useCollapsed hay Layout thủ công nữa

    const [requestData, setRequestData] = useState(null);
    const [residentInfo, setResidentInfo] = useState(null);
    const [form] = Form.useForm();
    const [showAcceptanceForm, setShowAcceptanceForm] = useState(false);

    // State for acceptance form
    const [acceptanceForm, setAcceptanceForm] = useState({
        giuong: { tot: false, hong: false },
        ghe: { tot: false, hong: false },
        ban: { tot: false, hong: false },
        tu: { tot: false, hong: false },
        ghichu: ""
    });

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

                // Parse acceptance form if exists in responseMessage for CHECKOUT type
                if (requestData.requestType === "CHECKOUT" && requestData.responseMessageByEmployee) {
                    parseAcceptanceFormFromText(requestData.responseMessageByEmployee);
                    setShowAcceptanceForm(true);
                }
            }
        }
    }, [isRequestSuccess, requestResponse, form]);

    // Parse acceptance form from text
    const parseAcceptanceFormFromText = (text) => {
        const parsed = {
            giuong: { tot: false, hong: false },
            ghe: { tot: false, hong: false },
            ban: { tot: false, hong: false },
            tu: { tot: false, hong: false },
            ghichu: ""
        };

        // Parse the structured text
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

        setAcceptanceForm(parsed);
    };

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

    // --- ĐÃ CHỈNH SỬA: Tự động thêm Ngày giờ và Tên phòng vào biên bản ---
    const convertAcceptanceFormToText = () => {
        let text = "=== BIÊN BẢN NGHIỆM THU TÌNH TRẠNG PHÒNG ===\n";

        // Tự động thêm thời gian hiện tại
        text += `Ngày giờ: ${new Date().toLocaleString('vi-VN')}\n`;

        // Tự động thêm tên phòng từ requestData
        text += `Phòng: ${requestData?.roomName || "Không xác định"}\n\n`;

        text += `Giường: ${acceptanceForm.giuong.tot ? '☑ Tốt' : '☐ Tốt'} | ${acceptanceForm.giuong.hong ? '☑ Hỏng' : '☐ Hỏng'}\n`;
        text += `Ghế: ${acceptanceForm.ghe.tot ? '☑ Tốt' : '☐ Tốt'} | ${acceptanceForm.ghe.hong ? '☑ Hỏng' : '☐ Hỏng'}\n`;
        text += `Bàn: ${acceptanceForm.ban.tot ? '☑ Tốt' : '☐ Tốt'} | ${acceptanceForm.ban.hong ? '☑ Hỏng' : '☐ Hỏng'}\n`;
        text += `Tủ: ${acceptanceForm.tu.tot ? '☑ Tốt' : '☐ Tốt'} | ${acceptanceForm.tu.hong ? '☑ Hỏng' : '☐ Hỏng'}\n`;

        if (acceptanceForm.ghichu) {
            text += `\nGhi chú: ${acceptanceForm.ghichu}`;
        }

        return text;
    };
    // -------------------------------------------------------------------

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
            CHECKOUT: "Yêu cầu trả phòng",
            METER_READING_DISCREPANCY: "Kiểm tra sai số điện/nước",
            SECURITY_INCIDENT: "Sự cố an ninh",
            TECHNICAL_ISSUE: "Sự cố kỹ thuật",
            POLICY_VIOLATION_REPORT: "Báo cáo vi phạm quy định",
            CHANGEROOM: "Yêu cầu đổi phòng",
            ANONYMOUS: "Yêu cầu ẩn danh",
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

        let responseMessage = values.responseMessage;

        // Nếu là CHECKOUT và đang hiện form, dùng hàm convert mới có chứa ngày giờ/phòng
        if (requestData.requestType === "CHECKOUT" && showAcceptanceForm) {
            responseMessage = convertAcceptanceFormToText();
        }

        const updatePayload = {
            requestStatus: values.requestStatus || "CHECKED",
            responseMessage: responseMessage
        };

        updateRequest(`/requests/${requestId}`, updatePayload);
    };

    // Handle radio change for each item
    const handleRadioChange = (item, value) => {
        setAcceptanceForm(prev => ({
            ...prev,
            [item]: {
                tot: value === 'tot',
                hong: value === 'hong'
            }
        }));
    };

    // Get current radio value
    const getRadioValue = (item) => {
        if (acceptanceForm[item].tot) return 'tot';
        if (acceptanceForm[item].hong) return 'hong';
        return null;
    };

    // Render acceptance form for CHECKOUT type
    const renderAcceptanceForm = () => {
        if (requestData?.requestType !== "CHECKOUT") return null;

        return (
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Biên bản nghiệm thu tình trạng</span>
                        <Button
                            type={showAcceptanceForm ? "default" : "primary"}
                            icon={showAcceptanceForm ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            onClick={() => setShowAcceptanceForm(!showAcceptanceForm)}
                            size="small"
                        >
                            {showAcceptanceForm ? 'Ẩn form' : 'Hiện form'}
                        </Button>
                    </div>
                }
                className="mb-6"
            >
                {showAcceptanceForm && (
                    <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
                        {['giuong', 'ghe', 'ban', 'tu'].map((item) => (
                            <Row key={item} style={{ marginBottom: 16 }} align="middle">
                                <Col span={6}>
                                    <strong style={{ textTransform: 'capitalize' }}>
                                        {item === 'giuong' ? 'Giường' : item === 'ghe' ? 'Ghế' : item === 'ban' ? 'Bàn' : 'Tủ'}:
                                    </strong>
                                </Col>
                                <Col span={18}>
                                    <Radio.Group
                                        value={getRadioValue(item)}
                                        onChange={(e) => handleRadioChange(item, e.target.value)}
                                    >
                                        <Radio value="tot">Tốt</Radio>
                                        <Radio value="hong">Hỏng</Radio>
                                    </Radio.Group>
                                </Col>
                            </Row>
                        ))}

                        <div style={{ marginTop: 24 }}>
                            <strong>Ghi chú:</strong>
                            <Input
                                style={{ marginTop: 8 }}
                                placeholder="Nhập ghi chú (nếu có)"
                                value={acceptanceForm.ghichu}
                                onChange={(e) => setAcceptanceForm(prev => ({
                                    ...prev,
                                    ghichu: e.target.value
                                }))}
                            />
                        </div>
                    </div>
                )}

                {!showAcceptanceForm && (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#8c8c8c' }}>
                        <p>Nhấn nút "Hiện form" để điền biên bản nghiệm thu</p>
                    </div>
                )}
            </Card>
        );
    };

    return (
        <LayoutGuard active="guard-requests" header="Chi tiết yêu cầu">
            {/* Wrapper cho toàn bộ nội dung */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                {/* Header tùy chỉnh bên trong nội dung */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/guard/requests")}
                    >
                        Quay lại
                    </Button>
                    <Title level={3} style={{ margin: 0 }}>
                        {requestData ? `Chi tiết Request #${requestData.requestId?.substring(0, 8)}` : "Chi tiết yêu cầu"}
                    </Title>
                </div>

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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

                                    {requestData.requestType !== "CHECKOUT" && (
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
                                    )}

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

                        {/* Acceptance Form for CHECKOUT type */}
                        {renderAcceptanceForm()}

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
            </div>
        </LayoutGuard>
    );
}