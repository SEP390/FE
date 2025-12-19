import React, { useState, useEffect } from "react";
import { SideBarTechnical } from "../../../components/layout/SideBarTechnical.jsx";
import { AppHeader } from "../../../components/layout/AppHeader.jsx";
import { Layout, Typography, Card, Button, Tag, Descriptions, Spin, Form, Select, Input, InputNumber, Modal, App } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useApi } from "../../../hooks/useApi.js";
import { warehouseItemApi } from "../../../api/Warehouse/warehouseApi.js";
import axios from "axios";

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export function TechnicalRequestDetail() {
    const { requestId } = useParams();
    const navigate = useNavigate();
    const { message } = App.useApp();
    const [collapsed, setCollapsed] = useState(false);
    const [requestData, setRequestData] = useState(null);
    const [residentInfo, setResidentInfo] = useState(null);
    const [form] = Form.useForm();
    const [reportVisible, setReportVisible] = useState(false);
    const [invoiceVisible, setInvoiceVisible] = useState(false);
    const [reportForm] = Form.useForm();
    const [invoiceForm] = Form.useForm();
    const [warehouseItems, setWarehouseItems] = useState([]);
    const [loadingWarehouse, setLoadingWarehouse] = useState(false);
    const [exportingStock, setExportingStock] = useState(false);
    const [creatingReport, setCreatingReport] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [currentReportId, setCurrentReportId] = useState(null);
    const activeKey = 'technical-requests';

    const isAcceptedStatus = (requestData?.responseStatus || requestData?.requestStatus) === "ACCEPTED";

    // API hooks
    const {
        get: getRequest,
        data: requestResponse,
        isSuccess: isRequestSuccess,
        isLoading: isRequestLoading
    } = useApi();

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

    // Fetch warehouse items
    const fetchWarehouseItems = async () => {
        try {
            setLoadingWarehouse(true);
            const response = await warehouseItemApi.getAllWarehouseItems();
            if (response.data) {
                const items = response.data.map(item => ({
                    ...item,
                    key: item.warehouseItemId,
                    code: item.warehouseItemId,
                    name: item.itemName,
                    quantity: item.quantity,
                }));
                setWarehouseItems(items);
            }
        } catch (error) {
            console.error('Error fetching warehouse items:', error);
            message.error('Không thể tải danh sách kho hàng');
        } finally {
            setLoadingWarehouse(false);
        }
    };

    // Fetch request details on mount and when refreshKey changes
    useEffect(() => {
        if (requestId) {
            console.log("Fetching request details for ID:", requestId);
            setRequestData(null);
            setResidentInfo(null);
            getRequest(`/requests/${requestId}`);
        }
    }, [requestId, refreshKey]);

    // Fetch warehouse items when opening export modal
    useEffect(() => {
        if (invoiceVisible) {
            fetchWarehouseItems();
        }
    }, [invoiceVisible]);

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
                    requestStatus: requestData.responseStatus || requestData.requestStatus || "PENDING",
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
    }, [requestData?.userId]);

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
            setRefreshKey(prev => prev + 1);
        }
    }, [isUpdateSuccess, updateResponse]);

    // Handle update error
    useEffect(() => {
        if (isUpdateComplete && !isUpdateSuccess && updateResponse) {
            message.error("Có lỗi xảy ra khi cập nhật request!");
        }
    }, [isUpdateComplete, isUpdateSuccess, updateResponse]);

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
            TECHNICAL_ISSUE: "Yêu cầu kỹ thuật",
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
            requestStatus: values.requestStatus,
            responseMessage: values.responseMessage
        };

        await updateRequest(`/requests/${requestId}`, updatePayload);
    };

    const toggleSideBar = () => {
        setCollapsed(!collapsed);
    };

    const handleOpenReport = () => {
        setReportVisible(true);
        reportForm.resetFields();
    };

    const handleOpenInvoice = (reportId = null) => {
        setCurrentReportId(reportId);
        setInvoiceVisible(true);
        invoiceForm.resetFields();
    };

    const handleSubmitInvoice = async (values) => {
        try {
            const selectedItem = warehouseItems.find(
                (item) => item.warehouseItemId === values.warehouseItemId
            );

            if (!selectedItem) {
                message.error("Sản phẩm không tồn tại");
                return;
            }

            if (values.quantity > selectedItem.quantity) {
                message.error("Số lượng xuất vượt quá số lượng tồn kho");
                return;
            }

            setExportingStock(true);

            await warehouseItemApi.createWarehouseTransaction({
                itemId: values.warehouseItemId,
                transactionQuantity: values.quantity,
                transactionType: 'EXPORT',
                note: values.reason || `Xuất kho cho ${currentReportId ? `report ${currentReportId}` : `request ${requestData?.requestId}`}`,
                reportId: currentReportId || null,
                requestId: currentReportId ? null : (requestData?.requestId || null)
            });

            message.success("Xuất kho thành công!");
            setInvoiceVisible(false);
            invoiceForm.resetFields();
            setCurrentReportId(null);
        } catch (error) {
            console.error('Full error:', error);

            if (error?.response?.status === 401) {
                message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
            } else if (error?.response?.data?.message) {
                message.error(error.response.data.message);
            } else if (error?.response?.data) {
                message.error(error.response.data);
            } else if (!error?.errorFields) {
                message.error("Không thể xuất kho");
            }
        } finally {
            setExportingStock(false);
        }
    };

    const handleSubmitReport = async (values) => {
        try {
            setCreatingReport(true);
            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:8080/api/reports",
                {
                    content: values.content,
                    createAt: new Date().toISOString(),
                    reportType: values.reportType
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            message.success("Tạo báo cáo thành công!");
            setReportVisible(false);
            reportForm.resetFields();

            // Lấy reportId từ response để có thể sử dụng
            const createdReportId = response.data?.reportId || response.data?.data?.reportId;
            console.log("Created report ID:", createdReportId);

            // Refresh để hiển thị report mới
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            console.error(err);
            message.error("Tạo báo cáo thất bại!");
        } finally {
            setCreatingReport(false);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <SideBarTechnical active={activeKey} collapsed={collapsed} />
            <Layout>
                <AppHeader toggleSideBar={toggleSideBar} />
                <Content style={{ margin: "24px", background: "#fff", padding: 24, paddingTop: 88 }}>
                    <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: "16px" }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/technical/requests")}
                        >
                            Quay lại
                        </Button>
                        <Title level={2} style={{ margin: 0 }}>
                            {requestData ? `Chi tiết Request #${requestData.requestId?.substring(0, 8)}` : "Chi tiết yêu cầu"}
                        </Title>
                        <div style={{ marginLeft: "auto" }}>
                            <Button type="primary" onClick={handleOpenReport}>
                                Tạo report
                            </Button>
                            {isAcceptedStatus && (
                                <Button style={{ marginLeft: 8 }} onClick={() => handleOpenInvoice()}>
                                    Tạo đơn xuất kho
                                </Button>
                            )}
                        </div>
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
                            <Button type="primary" onClick={() => navigate("/technical/requests")}>
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
                                            <Select placeholder="Chọn trạng thái">
                                                <Option value="ACCEPTED">Đã kiểm tra</Option>
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
                                                style={{ backgroundColor: "#1890ff", borderColor: "#1890ff" }}
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

                            {/* Response Message from Manager */}
                            {(requestData.responseMessage || requestData.ResponseMessage) && (
                                <Card title="Tin nhắn phản hồi từ Manager" className="mt-6">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="whitespace-pre-wrap">{requestData.responseMessage || requestData.ResponseMessage}</p>
                                    </div>
                                </Card>
                            )}

                            {/* Response Message from Employee */}
                            {requestData.responseMessageByEmployee && (
                                <Card title="Tin nhắn phản hồi từ Employee" className="mt-6">
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <p className="whitespace-pre-wrap">{requestData.responseMessageByEmployee}</p>
                                    </div>
                                </Card>
                            )}
                        </>
                    )}

                    {/* Create Report Modal */}
                    <Modal
                        title="Tạo báo cáo"
                        open={reportVisible}
                        onCancel={() => setReportVisible(false)}
                        footer={null}
                        destroyOnClose
                    >
                        <Form
                            form={reportForm}
                            layout="vertical"
                            onFinish={handleSubmitReport}
                        >
                            <Form.Item
                                label="Loại báo cáo"
                                name="reportType"
                                rules={[{ required: true, message: "Vui lòng chọn loại báo cáo" }]}
                            >
                                <Select placeholder="Chọn loại báo cáo">
                                    <Select.Option value="VIOLATION">Vi phạm nội quy</Select.Option>
                                    <Select.Option value="MAINTENANCE_REQUEST">Yêu cầu bảo trì</Select.Option>
                                    <Select.Option value="SECURITY_ISSUE">Vấn đề an ninh</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Nội dung báo cáo"
                                name="content"
                                rules={[{ required: true, message: "Vui lòng nhập nội dung báo cáo" }]}
                            >
                                <TextArea rows={6} placeholder="Nhập nội dung báo cáo..." />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={creatingReport} block>
                                    Gửi báo cáo
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>

                    {/* Export Warehouse Modal */}
                    <Modal
                        title="Tạo đơn xuất kho"
                        open={invoiceVisible}
                        onCancel={() => {
                            setInvoiceVisible(false);
                            setCurrentReportId(null);
                        }}
                        footer={null}
                        destroyOnClose
                    >
                        <Form
                            layout="vertical"
                            form={invoiceForm}
                            onFinish={handleSubmitInvoice}
                        >
                            <Form.Item
                                label="Sản phẩm"
                                name="warehouseItemId"
                                rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
                            >
                                <Select
                                    placeholder="Chọn sản phẩm"
                                    showSearch
                                    optionFilterProp="label"
                                    loading={loadingWarehouse}
                                    options={warehouseItems.map((item) => ({
                                        value: item.warehouseItemId,
                                        label: `${item.itemName} (Còn: ${item.quantity} ${item.itemUnit})`,
                                    }))}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Số lượng xuất"
                                name="quantity"
                                rules={[
                                    { required: true, message: "Vui lòng nhập số lượng" },
                                    { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
                                    {
                                        validator: (_, value) => {
                                            const selectedItemId = invoiceForm.getFieldValue('warehouseItemId');
                                            const selectedItem = warehouseItems.find(item => item.warehouseItemId === selectedItemId);
                                            if (selectedItem && value > selectedItem.quantity) {
                                                return Promise.reject(new Error('Số lượng xuất không được vượt quá số lượng tồn kho'));
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>

                            <Form.Item
                                label="Lý do xuất"
                                name="reason"
                            >
                                <TextArea
                                    rows={3}
                                    placeholder={currentReportId
                                        ? `Xuất kho cho report ${currentReportId}`
                                        : `Xuất kho cho request ${requestData?.requestId || ''}`
                                    }
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={exportingStock} block>
                                    Xuất kho
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                </Content>
            </Layout>
        </Layout>
    );
}

export default TechnicalRequestDetail;

