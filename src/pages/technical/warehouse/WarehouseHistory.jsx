import React, {useState} from "react";
import { Card, Table, Typography, Layout, Tag, Input, DatePicker, Select, Space, Button } from "antd";
import { SideBarTechnical } from "../../../components/layout/SideBarTechnical.jsx";
import { AppHeader } from "../../../components/layout/AppHeader.jsx";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;
const { Content } = Layout;
const { RangePicker } = DatePicker;

export function WarehouseHistory() {
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'technical-inventory-history';
    
    // Filter states
    const [filters, setFilters] = useState({
        action: null,
        searchText: '',
        dateRange: null
    });

    // Sample data - replace with API call later
    const [historyData] = useState([
        {
            key: 1,
            date: "2024-01-15 14:30:00",
            action: "NHẬP",
            productCode: "IT-001",
            productName: "Bóng đèn LED",
            quantity: 50,
            performedBy: "Nguyễn Văn A",
            note: "Nhập kho mới đầu tháng"
        },
        {
            key: 2,
            date: "2024-01-15 15:20:00",
            action: "XUẤT",
            productCode: "IT-001",
            productName: "Bóng đèn LED",
            quantity: 10,
            performedBy: "Trần Thị B",
            note: "Xuất cho phòng 101 - sửa chữa"
        },
        {
            key: 3,
            date: "2024-01-16 09:15:00",
            action: "NHẬP",
            productCode: "IT-002",
            productName: "Ống nước PPR",
            quantity: 30,
            performedBy: "Lê Văn C",
            note: "Nhập bổ sung vật tư"
        },
        {
            key: 4,
            date: "2024-01-16 10:45:00",
            action: "XUẤT",
            productCode: "IT-002",
            productName: "Ống nước PPR",
            quantity: 5,
            performedBy: "Phạm Thị D",
            note: "Xuất sửa đường ống tầng 2"
        },
        {
            key: 5,
            date: "2024-01-17 08:30:00",
            action: "XUẤT",
            productCode: "IT-001",
            productName: "Bóng đèn LED",
            quantity: 20,
            performedBy: "Nguyễn Văn A",
            note: "Xuất thay thế bóng đèn hỏng"
        },
    ]);

    const columns = [
        {
            title: "Thời gian",
            dataIndex: "date",
            key: "date",
            width: 180,
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
            render: (date) => {
                const dateObj = new Date(date);
                return dateObj.toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
        },
        {
            title: "Hành động",
            dataIndex: "action",
            key: "action",
            width: 120,
            filters: [
                { text: "Nhập kho", value: "NHẬP" },
                { text: "Xuất kho", value: "XUẤT" },
            ],
            onFilter: (value, record) => record.action === value,
            render: (action) => (
                <Tag color={action === "NHẬP" ? "green" : "red"}>
                    {action === "NHẬP" ? "Nhập kho" : "Xuất kho"}
                </Tag>
            )
        },
        {
            title: "Mã SP",
            dataIndex: "productCode",
            key: "productCode",
            width: 120
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "productName",
            key: "productName",
            ellipsis: true
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 120,
            align: "right",
            render: (quantity, record) => (
                <span style={{ 
                    color: record.action === "NHẬP" ? "#52c41a" : "#ff4d4f",
                    fontWeight: "bold"
                }}>
                    {record.action === "NHẬP" ? "+" : "-"}{quantity}
                </span>
            )
        },
        {
            title: "Người thực hiện",
            dataIndex: "performedBy",
            key: "performedBy",
            width: 150
        },
        {
            title: "Lý do/Ghi chú",
            dataIndex: "note",
            key: "note",
            ellipsis: true,
            render: (text) => text || "Không có ghi chú"
        }
    ];

    // Filter data based on filters state
    const filteredData = historyData.filter(item => {
        if (filters.action && item.action !== filters.action) return false;
        if (filters.searchText) {
            const searchLower = filters.searchText.toLowerCase();
            if (!item.productCode.toLowerCase().includes(searchLower) &&
                !item.productName.toLowerCase().includes(searchLower) &&
                !item.performedBy.toLowerCase().includes(searchLower) &&
                !item.note.toLowerCase().includes(searchLower)) {
                return false;
            }
        }
        if (filters.dateRange && filters.dateRange.length === 2) {
            const itemDate = dayjs(item.date);
            const startDate = filters.dateRange[0].startOf('day');
            const endDate = filters.dateRange[1].endOf('day');
            if (itemDate.isBefore(startDate) || itemDate.isAfter(endDate)) {
                return false;
            }
        }
        return true;
    });

    const handleResetFilters = () => {
        setFilters({
            action: null,
            searchText: '',
            dateRange: null
        });
    };

    return (
        <Layout className={"!h-screen"}>
            <SideBarTechnical active={activeKey} collapsed={collapsed} />
            <Layout>
                <AppHeader toggleSideBar={() => setCollapsed(!collapsed)} />
                <Content className={"!overflow-auto h-full p-5 flex flex-col"}>
                    <div className="p-0">
                        <Title level={3} style={{ marginBottom: 16 }}>Lịch sử kho kỹ thuật</Title>
                        
                        {/* Filter Section */}
                        <Card className="mb-4">
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Space wrap>
                                    <Input
                                        placeholder="Tìm kiếm theo mã SP, tên SP, người thực hiện, ghi chú..."
                                        prefix={<SearchOutlined />}
                                        style={{ width: 400 }}
                                        value={filters.searchText}
                                        onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                                        allowClear
                                    />
                                    <Select
                                        placeholder="Chọn hành động"
                                        style={{ width: 150 }}
                                        allowClear
                                        value={filters.action}
                                        onChange={(value) => setFilters({ ...filters, action: value })}
                                    >
                                        <Select.Option value="NHẬP">Nhập kho</Select.Option>
                                        <Select.Option value="XUẤT">Xuất kho</Select.Option>
                                    </Select>
                                    <RangePicker
                                        placeholder={["Từ ngày", "Đến ngày"]}
                                        format="DD/MM/YYYY"
                                        value={filters.dateRange}
                                        onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                                    />
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleResetFilters}
                                    >
                                        Đặt lại
                                    </Button>
                                </Space>
                            </Space>
                        </Card>

                        {/* History Table */}
                        <Card>
                            <div style={{ marginBottom: 16 }}>
                                <Typography.Text strong>
                                    Tổng số bản ghi: {filteredData.length}
                                </Typography.Text>
                            </div>
                            <Table
                                columns={columns}
                                dataSource={filteredData}
                                pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showTotal: (total) => `Tổng ${total} bản ghi`,
                                    pageSizeOptions: ['10', '20', '50', '100']
                                }}
                                scroll={{ x: 1200 }}
                            />
                        </Card>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default WarehouseHistory;
