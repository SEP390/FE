import React, { useState, useEffect } from "react";
import { Modal, Descriptions, Typography, Divider, Card, Button, Form, Input, InputNumber, Select, message as antMessage } from "antd";
import { warehouseItemApi } from "../../api/Warehouse/warehouseApi.js";
import { useApi } from "../../hooks/useApi"; // Import useApi hook

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

export function ReportDetailModal({ open, onClose, report }) {
    const [invoiceVisible, setInvoiceVisible] = useState(false);
    const [invoiceForm] = Form.useForm();
    const [warehouseItems, setWarehouseItems] = useState([]);
    const [loadingWarehouse, setLoadingWarehouse] = useState(false);
    const [exportingStock, setExportingStock] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Use useApi hook for fetching user info
    const userInfoApi = useApi();

    // Fetch user information when modal opens
    useEffect(() => {
        if (open) {
            userInfoApi.get('/users/profile');
        }
    }, [open]);

    // Set user role when data is loaded
    useEffect(() => {
        if (userInfoApi.isSuccess && userInfoApi.data) {
            console.log('User info API response:', userInfoApi.data);
            console.log('User role:', userInfoApi.data.role);
            setUserRole(userInfoApi.data.role);
        }
    }, [userInfoApi.isSuccess, userInfoApi.data]);

    // Handle API error
    useEffect(() => {
        if (userInfoApi.isError) {
            console.error('Error fetching user info:', userInfoApi.error);
            antMessage.error('Không thể tải thông tin người dùng');
        }
    }, [userInfoApi.isError]);

    // Fetch warehouse items when opening export modal
    useEffect(() => {
        if (invoiceVisible) {
            fetchWarehouseItems();
        }
    }, [invoiceVisible]);

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
            antMessage.error('Không thể tải danh sách kho hàng');
        } finally {
            setLoadingWarehouse(false);
        }
    };

    const handleOpenInvoice = () => {
        setInvoiceVisible(true);
        invoiceForm.resetFields();
    };

    const handleSubmitInvoice = async (values) => {
        try {
            const selectedItem = warehouseItems.find(
                (item) => item.warehouseItemId === values.warehouseItemId
            );

            if (!selectedItem) {
                antMessage.error("Sản phẩm không tồn tại");
                return;
            }

            if (values.quantity > selectedItem.quantity) {
                antMessage.error("Số lượng xuất vượt quá số lượng tồn kho");
                return;
            }

            setExportingStock(true);

            await warehouseItemApi.createWarehouseTransaction({
                itemId: values.warehouseItemId,
                transactionQuantity: values.quantity,
                transactionType: 'EXPORT',
                note: values.reason || `Xuất kho cho report ${report?.reportId}`,
                reportId: report?.reportId || null,
                requestId: null
            });

            antMessage.success("Xuất kho thành công!");
            setInvoiceVisible(false);
            invoiceForm.resetFields();
        } catch (error) {
            console.error('Full error:', error);

            if (error?.response?.status === 401) {
                antMessage.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
            } else if (error?.response?.data?.message) {
                antMessage.error(error.response.data.message);
            } else if (error?.response?.data) {
                antMessage.error(error.response.data);
            } else if (!error?.errorFields) {
                antMessage.error("Không thể xuất kho");
            }
        } finally {
            setExportingStock(false);
        }
    };

    if (!report) return null;

    // Determine if export button should be shown
    const showExportButton = userRole === 'TECHNICAL';

    console.log('Current user role:', userRole);
    console.log('Show export button:', showExportButton);
    console.log('Is TECHNICAL?:', userRole === 'TECHNICAL');

    return (
        <>
            <Modal
                open={open}
                onCancel={onClose}
                footer={[
                    showExportButton && (
                        <Button key="export" onClick={handleOpenInvoice}>
                            Tạo đơn xuất kho
                        </Button>
                    ),
                    <Button key="close" onClick={onClose}>
                        Đóng
                    </Button>
                ].filter(Boolean)}
                width={650}
                title="Chi tiết báo cáo"
            >
                <Descriptions
                    column={1}
                    bordered
                    size="middle"
                    labelStyle={{ fontWeight: "600", width: "30%" }}
                >
                    <Descriptions.Item label="Người báo cáo">
                        {report.employeeName}
                    </Descriptions.Item>

                    <Descriptions.Item label="Mã người dùng">
                        {report.userCode}
                    </Descriptions.Item>

                    <Descriptions.Item label="Loại báo cáo">
                        {report.reportType}
                    </Descriptions.Item>

                    <Descriptions.Item label="Trạng thái">
                        {report.reportStatus}
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày tạo">
                        {new Date(report.createdDate).toLocaleString("vi-VN")}
                    </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Card size="small" title="Nội dung báo cáo" style={{ marginBottom: 16 }}>
                    <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>
                        {report.content}
                    </Paragraph>
                </Card>

                <Card size="small" title="Phản hồi từ quản lý">
                    <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 , opacity: report.responseMessage ? 1 : 0.5 }} >
                        {report.responseMessage ? report.responseMessage : "Chưa có phản hồi"}
                    </Paragraph>
                </Card>
            </Modal>

            {/* Export Warehouse Modal - Only accessible if user is TECHNICAL */}
            {showExportButton && (
                <Modal
                    title="Tạo đơn xuất kho"
                    open={invoiceVisible}
                    onCancel={() => {
                        setInvoiceVisible(false);
                        invoiceForm.resetFields();
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
                            <InputNumber min={1} style={{ width: "100%" }} placeholder="Nhập số lượng" />
                        </Form.Item>

                        <Form.Item
                            label="Lý do xuất"
                            name="reason"
                        >
                            <TextArea
                                rows={3}
                                placeholder={`Xuất kho cho report ${report?.reportId || ''}`}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={exportingStock} block>
                                Xuất kho
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            )}
        </>
    );
}