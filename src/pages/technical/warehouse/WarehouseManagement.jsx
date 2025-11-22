import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Table, Typography, Layout, message, Input, Modal, Form, Select, InputNumber } from "antd";
import { SideBarTechnical } from "../../../components/layout/SideBarTechnical.jsx";
import { AppHeader } from "../../../components/layout/AppHeader.jsx";
import { warehouseItemApi } from "../../../api/Warehouse/warehouseApi.js";

const { Title } = Typography;
const { Content } = Layout;

export function WarehouseManagement() {
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [warehouseItems, setWarehouseItems] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);
    const [creatingItem, setCreatingItem] = useState(false);
    const [importForm] = Form.useForm();
    const [isStockModalVisible, setIsStockModalVisible] = useState(false);
    const [importingStock, setImportingStock] = useState(false);
    const [exportingStock, setExportingStock] = useState(false);
    const [stockForm] = Form.useForm();
    const [exportForm] = Form.useForm();
    const [isExportModalVisible, setIsExportModalVisible] = useState(false);
    const activeKey = 'technical-inventory';

    const columns = [
        { title: "Mã SP", dataIndex: "code", key: "code", width: 120 },
        { title: "Tên hàng", dataIndex: "name", key: "name" },
        { title: "Số lượng", dataIndex: "quantity", key: "quantity", width: 120 },
    ];

    useEffect(() => {
        fetchWarehouseItems();
    }, []);

    const fetchWarehouseItems = async () => {
        try {
            setLoading(true);
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
            message.error('Không thể tải dữ liệu kho hàng');
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = useMemo(() => {
        const normalized = searchText.trim().toLowerCase();
        if (!normalized) return warehouseItems;
        return warehouseItems.filter(item => (
            item.code?.toLowerCase().includes(normalized) ||
            item.name?.toLowerCase().includes(normalized)
        ));
    }, [warehouseItems, searchText]);

    const handleOpenImportModal = () => {
        setIsImportModalVisible(true);
    };

    const handleCloseImportModal = () => {
        setIsImportModalVisible(false);
        importForm.resetFields();
    };

    const handleCreateWarehouseItem = async () => {
        try {
            const values = await importForm.validateFields();
            setCreatingItem(true);
            await warehouseItemApi.createWarehouseItem({
                itemName: values.itemName,
                itemUnit: values.itemUnit
            });
            message.success('Thêm sản phẩm thành công');
            handleCloseImportModal();
            fetchWarehouseItems();
        } catch (error) {
            if (error?.response?.data?.message) {
                message.error(error.response.data.message);
            } else if (error?.errorFields) {
                // Validation errors handled by form
            } else {
                message.error('Không thể tạo sản phẩm mới');
            }
        } finally {
            setCreatingItem(false);
        }
    };

    const handleOpenStockModal = () => {
        setIsStockModalVisible(true);
    };

    const handleCloseStockModal = () => {
        setIsStockModalVisible(false);
        stockForm.resetFields();
    };

    const handleOpenExportModal = () => {
        setIsExportModalVisible(true);
    };

    const handleCloseExportModal = () => {
        setIsExportModalVisible(false);
        exportForm.resetFields();
    };

    const handleExportStock = async () => {
        try {
            const values = await exportForm.validateFields();
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
                itemId: values.warehouseItemId,  // ✅ Đổi từ warehouseItemId thành itemId
                transactionQuantity: values.quantity,  // ✅ Đổi từ quantity thành transactionQuantity
                transactionType: 'EXPORT',  // ✅ Đổi từ type thành transactionType
                note: values.reason,  // ✅ Đổi từ reason thành note
                reportId: null,  // ✅ Thêm nếu cần
                requestId: null  // ✅ Thêm nếu cần
            });

            message.success("Xuất kho thành công");
            handleCloseExportModal();
            fetchWarehouseItems();
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


    const handleImportStock = async () => {
        try {
            const values = await stockForm.validateFields();
            const selectedItem = warehouseItems.find(
                (item) => item.warehouseItemId === values.warehouseItemId
            );
            if (!selectedItem) {
                message.error("Sản phẩm không tồn tại");
                return;
            }
            setImportingStock(true);

            await warehouseItemApi.createWarehouseTransaction({
                itemId: values.warehouseItemId,  // ✅ Đổi từ warehouseItemId thành itemId
                transactionQuantity: values.quantity,  // ✅ Đổi từ quantity thành transactionQuantity
                transactionType: 'IMPORT',  // ✅ Đổi từ type thành transactionType
                note: values.reason || 'Nhập kho',  // ✅ Đổi từ reason thành note
                reportId: null,  // ✅ Thêm nếu cần
                requestId: null  // ✅ Thêm nếu cần
            });

            message.success("Nhập kho thành công");
            handleCloseStockModal();
            fetchWarehouseItems();
        } catch (error) {
            console.error('Full error:', error);

            if (error?.response?.status === 401) {
                message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
            } else if (error?.response?.data?.message) {
                message.error(error.response.data.message);
            } else if (error?.response?.data) {
                message.error(error.response.data);
            } else if (!error?.errorFields) {
                message.error("Không thể nhập kho");
            }
        } finally {
            setImportingStock(false);
        }
    };

    return (
        <Layout className={"!h-screen"}>
            <SideBarTechnical active={activeKey} collapsed={collapsed} />
            <Layout>
                <AppHeader toggleSideBar={() => setCollapsed(!collapsed)} />
                <Content className={"!overflow-auto h-full p-5 flex flex-col"}>
                    <div className="p-0">
                        <Title level={3} style={{ marginBottom: 16 }}>Quản lý kho kỹ thuật</Title>
                        <Card className="mb-4 flex flex-wrap items-center gap-3">
                            <Input.Search
                                placeholder="Tìm kiếm sản phẩm theo mã hoặc tên"
                                allowClear
                                enterButton="Tìm kiếm"
                                style={{ maxWidth: 320 }}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onSearch={(value) => setSearchText(value)}
                            />
                            <Button type="primary" onClick={handleOpenImportModal}>Tạo mới</Button>
                            <Button type="primary" className="ml-2" onClick={handleOpenStockModal}>Nhập kho</Button>
                            <Button type="primary" className="ml-2" onClick={handleOpenExportModal}>Xuất kho</Button>
                        </Card>
                        <Card>
                            <Table
                                columns={columns}
                                dataSource={filteredItems}
                                pagination={{ pageSize: 10 }}
                                loading={loading}
                            />
                        </Card>
                        <Modal
                            title="Nhập kho - Thêm sản phẩm"
                            open={isImportModalVisible}
                            onCancel={handleCloseImportModal}
                            onOk={handleCreateWarehouseItem}
                            okText="Tạo"
                            cancelText="Hủy"
                            confirmLoading={creatingItem}
                            destroyOnHidden
                        >
                            <Form layout="vertical" form={importForm}>
                                <Form.Item
                                    label="Tên sản phẩm"
                                    name="itemName"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                                >
                                    <Input placeholder="Nhập tên sản phẩm" />
                                </Form.Item>
                                <Form.Item
                                    label="Đơn vị tính"
                                    name="itemUnit"
                                    rules={[{ required: true, message: 'Vui lòng nhập đơn vị tính' }]}
                                >
                                    <Input placeholder="Ví dụ: cái, bộ, chai..." />
                                </Form.Item>
                            </Form>
                        </Modal>
                        <Modal
                            title="Nhập kho"
                            open={isStockModalVisible}
                            onCancel={handleCloseStockModal}
                            onOk={handleImportStock}
                            okText="Nhập"
                            cancelText="Hủy"
                            confirmLoading={importingStock}
                            destroyOnHidden
                        >
                            <Form layout="vertical" form={stockForm}>
                                <Form.Item
                                    label="Sản phẩm"
                                    name="warehouseItemId"
                                    rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
                                >
                                    <Select
                                        placeholder="Chọn sản phẩm"
                                        showSearch
                                        optionFilterProp="label"
                                        options={warehouseItems.map((item) => ({
                                            value: item.warehouseItemId,
                                            label: item.itemName,
                                        }))}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Số lượng nhập"
                                    name="quantity"
                                    rules={[
                                        { required: true, message: "Vui lòng nhập số lượng" },
                                        { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
                                    ]}
                                >
                                    <InputNumber min={1} style={{ width: "100%" }} />
                                </Form.Item>
                            </Form>
                        </Modal>
                        <Modal
                            title="Xuất kho"
                            open={isExportModalVisible}
                            onCancel={handleCloseExportModal}
                            onOk={handleExportStock}
                            okText="Xuất"
                            cancelText="Hủy"
                            confirmLoading={exportingStock}
                            destroyOnHidden
                        >
                            <Form layout="vertical" form={exportForm}>
                                <Form.Item
                                    label="Sản phẩm"
                                    name="warehouseItemId"
                                    rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
                                >
                                    <Select
                                        placeholder="Chọn sản phẩm"
                                        showSearch
                                        optionFilterProp="label"
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
                                                const selectedItemId = exportForm.getFieldValue('warehouseItemId');
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
                                    rules={[{ required: true, message: 'Vui lòng nhập lý do xuất kho' }]}
                                >
                                    <Input.TextArea rows={3} placeholder="Nhập lý do xuất kho" />
                                </Form.Item>
                            </Form>
                        </Modal>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default WarehouseManagement;


