import React, { useState, useEffect, useMemo } from "react";
import {
    Button,
    Card,
    Table,
    Typography,
    Layout,
    message,
    Input,
    Modal,
    Form,
    Select,
    InputNumber,
    Space,
    Tag,
    Statistic,
    Row,
    Col
} from "antd";
import {
    PlusOutlined,
    ImportOutlined,
    ExportOutlined,
    SearchOutlined,
    InboxOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import { SideBarTechnical } from "../../../components/layout/SideBarTechnical.jsx";
import { AppHeader } from "../../../components/layout/AppHeader.jsx";
import { warehouseItemApi } from "../../../api/Warehouse/warehouseApi.js";

const { Title, Text } = Typography;
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
        {
            title: "Mã SP",
            dataIndex: "code",
            key: "code",
            width: 120,
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: "Tên hàng",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <div>
                    <div className="font-medium">{text}</div>
                    <Text type="secondary" className="text-xs">{record.itemUnit}</Text>
                </div>
            )
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 120,
            align: 'center',
            render: (quantity) => (
                <Tag color={quantity > 50 ? 'green' : quantity > 10 ? 'orange' : 'red'}>
                    {quantity}
                </Tag>
            )
        },
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

    // Statistics
    const statistics = useMemo(() => {
        const totalItems = warehouseItems.length;
        const totalQuantity = warehouseItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const lowStockItems = warehouseItems.filter(item => item.quantity <= 10).length;

        return { totalItems, totalQuantity, lowStockItems };
    }, [warehouseItems]);

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
            } else if (!error?.errorFields) {
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
                itemId: values.warehouseItemId,
                transactionQuantity: values.quantity,
                transactionType: 'EXPORT',
                note: values.reason,
                reportId: null,
                requestId: null
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
                itemId: values.warehouseItemId,
                transactionQuantity: values.quantity,
                transactionType: 'IMPORT',
                note: values.reason || 'Nhập kho',
                reportId: null,
                requestId: null
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
        <Layout className="!h-screen">
            <SideBarTechnical active={activeKey} collapsed={collapsed} />
            <Layout>
                <AppHeader toggleSideBar={() => setCollapsed(!collapsed)} />
                <Content className="!overflow-auto h-full p-6 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <Title level={2} className="!mb-2">
                                <InboxOutlined className="mr-2" />
                                Quản lý kho kỹ thuật
                            </Title>
                            <Text type="secondary">Quản lý tồn kho và giao dịch nhập xuất</Text>
                        </div>

                        {/* Statistics Cards */}
                        <Row gutter={[16, 16]} className="mb-6">
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="Tổng sản phẩm"
                                        value={statistics.totalItems}
                                        prefix={<AppstoreOutlined />}
                                        valueStyle={{ color: '#1890ff' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="Tổng số lượng"
                                        value={statistics.totalQuantity}
                                        prefix={<InboxOutlined />}
                                        valueStyle={{ color: '#52c41a' }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card>
                                    <Statistic
                                        title="Sắp hết hàng"
                                        value={statistics.lowStockItems}
                                        suffix={`/ ${statistics.totalItems}`}
                                        valueStyle={{ color: statistics.lowStockItems > 0 ? '#ff4d4f' : '#52c41a' }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Action Bar */}
                        <Card className="mb-4 shadow-sm">
                            <div className="flex flex-wrap items-center gap-3">
                                <Input.Search
                                    placeholder="Tìm kiếm sản phẩm theo mã hoặc tên"
                                    allowClear
                                    enterButton={<SearchOutlined />}
                                    style={{ maxWidth: 400 }}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onSearch={(value) => setSearchText(value)}
                                    size="large"
                                />
                                <div className="ml-auto">
                                    <Space>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={handleOpenImportModal}
                                            size="large"
                                        >
                                            Tạo mới
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<ImportOutlined />}
                                            onClick={handleOpenStockModal}
                                            size="large"
                                            style={{ backgroundColor: '#52c41a' }}
                                        >
                                            Nhập kho
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<ExportOutlined />}
                                            onClick={handleOpenExportModal}
                                            size="large"
                                            danger
                                        >
                                            Xuất kho
                                        </Button>
                                    </Space>
                                </div>
                            </div>
                        </Card>

                        {/* Table */}
                        <Card className="shadow-sm">
                            <Table
                                columns={columns}
                                dataSource={filteredItems}
                                pagination={{
                                    pageSize: 10,
                                    showTotal: (total) => `Tổng ${total} sản phẩm`,
                                    showSizeChanger: true
                                }}
                                loading={loading}
                                locale={{ emptyText: 'Không có dữ liệu' }}
                            />
                        </Card>

                        {/* Create Item Modal */}
                        <Modal
                            title={<span><PlusOutlined /> Tạo sản phẩm mới</span>}
                            open={isImportModalVisible}
                            onCancel={handleCloseImportModal}
                            onOk={handleCreateWarehouseItem}
                            okText="Tạo"
                            cancelText="Hủy"
                            confirmLoading={creatingItem}
                            width={500}
                        >
                            <Form layout="vertical" form={importForm}>
                                <Form.Item
                                    label="Tên sản phẩm"
                                    name="itemName"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                                >
                                    <Input
                                        placeholder="Nhập tên sản phẩm"
                                        size="large"
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Đơn vị tính"
                                    name="itemUnit"
                                    rules={[{ required: true, message: 'Vui lòng nhập đơn vị tính' }]}
                                >
                                    <Input
                                        placeholder="Ví dụ: cái, bộ, chai..."
                                        size="large"
                                    />
                                </Form.Item>
                            </Form>
                        </Modal>

                        {/* Import Stock Modal */}
                        <Modal
                            title={<span><ImportOutlined /> Nhập kho</span>}
                            open={isStockModalVisible}
                            onCancel={handleCloseStockModal}
                            onOk={handleImportStock}
                            okText="Nhập"
                            cancelText="Hủy"
                            confirmLoading={importingStock}
                            width={500}
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
                                        size="large"
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
                                    <InputNumber
                                        min={1}
                                        style={{ width: "100%" }}
                                        size="large"
                                        placeholder="Nhập số lượng"
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Ghi chú"
                                    name="reason"
                                >
                                    <Input.TextArea
                                        rows={3}
                                        placeholder="Nhập ghi chú (không bắt buộc)"
                                    />
                                </Form.Item>
                            </Form>
                        </Modal>

                        {/* Export Stock Modal */}
                        <Modal
                            title={<span><ExportOutlined /> Xuất kho</span>}
                            open={isExportModalVisible}
                            onCancel={handleCloseExportModal}
                            onOk={handleExportStock}
                            okText="Xuất"
                            cancelText="Hủy"
                            confirmLoading={exportingStock}
                            width={500}
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
                                        size="large"
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
                                    <InputNumber
                                        min={1}
                                        style={{ width: "100%" }}
                                        size="large"
                                        placeholder="Nhập số lượng"
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Lý do xuất"
                                    name="reason"
                                    rules={[{ required: true, message: 'Vui lòng nhập lý do xuất kho' }]}
                                >
                                    <Input.TextArea
                                        rows={3}
                                        placeholder="Nhập lý do xuất kho"
                                    />
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