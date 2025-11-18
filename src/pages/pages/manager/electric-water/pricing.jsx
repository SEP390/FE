import {Button, Card, Form, Input, Pagination, Select, Table, Typography} from "antd";
import {LayoutManager} from "../../../../components/layout/LayoutManager.jsx";

const actionButtons = [
    {label: "Tạo bản ghi mới"},
    {label: "Tính lại điện nước mỗi sinh viên"},
];

const monthOptions = [{label: "All", value: "all"}, ...Array.from({length: 12}, (_, i) => ({
    label: `Tháng ${i + 1}`,
    value: `${i + 1}`
}))];

const yearOptions = [
    {label: "All", value: "all"},
    {label: "2025", value: "2025"},
    {label: "2024", value: "2024"},
    {label: "2023", value: "2023"},
];

const usageOptions = [
    {label: "Electric (Điện)", value: "electric"},
    {label: "Water (Nước)", value: "water"},
    {label: "All", value: "all"},
];

const semesterOptions = [
    {label: "All", value: "all"},
    {label: "Spring - 2025", value: "spring-2025"},
    {label: "Summer - 2025", value: "summer-2025"},
    {label: "Fall - 2025", value: "fall-2025"},
];

const mockData = [
    {key: "192037", id: "192037", block: "A104", usage: "Nước", createdAt: "2025-10-24", semester: "Fall - 2025", meter: "440 - 809", consumption: "-43", unit: "m3", reset: "Chỉnh"},
    {key: "192036", id: "192036", block: "A104", usage: "Điện", createdAt: "2025-10-24", semester: "Fall - 2025", meter: "26042 - 19463", consumption: "234", unit: "kW", reset: "Chỉnh"},
    {key: "191229", id: "191229", block: "A101", usage: "Điện", createdAt: "2025-09-30", semester: "Fall - 2025", meter: "27255 - 20805", consumption: "390", unit: "kW", reset: "Chỉnh"},
    {key: "191231", id: "191231", block: "A103", usage: "Điện", createdAt: "2025-09-30", semester: "Fall - 2025", meter: "19664 - 25118", consumption: "398", unit: "kW", reset: "Chỉnh"},
    {key: "191230", id: "191230", block: "A102", usage: "Điện", createdAt: "2025-09-30", semester: "Fall - 2025", meter: "29028 - 0", consumption: "435", unit: "kW", reset: "Chỉnh"},
    {key: "191232", id: "191232", block: "A104", usage: "Điện", createdAt: "2025-09-30", semester: "Fall - 2025", meter: "25915 - 19356", consumption: "385", unit: "kW", reset: "Chỉnh"},
    {key: "191233", id: "191233", block: "A105", usage: "Điện", createdAt: "2025-09-30", semester: "Fall - 2025", meter: "31877 - 26935", consumption: "593", unit: "kW", reset: "Chỉnh"},
    {key: "191235", id: "191235", block: "A107", usage: "Điện", createdAt: "2025-09-30", semester: "Fall - 2025", meter: "21581 - 22713", consumption: "443", unit: "kW", reset: "Chỉnh"},
    {key: "191234", id: "191234", block: "A106", usage: "Điện", createdAt: "2025-09-30", semester: "Fall - 2025", meter: "28338 - 19573", consumption: "493", unit: "kW", reset: "Chỉnh"},
    {key: "191236", id: "191236", block: "A108", usage: "Điện", createdAt: "2025-09-30", semester: "Fall - 2025", meter: "20072 - 20287", consumption: "510", unit: "kW", reset: "Chỉnh"},
];

const columns = [
    {title: "Id", dataIndex: "id", key: "id", width: 80},
    {title: "Tên block", dataIndex: "block", key: "block"},
    {title: "Loại sử dụng", dataIndex: "usage", key: "usage"},
    {title: "Ngày Tạo", dataIndex: "createdAt", key: "createdAt"},
    {title: "Học Kỳ", dataIndex: "semester", key: "semester"},
    {title: "Số công tơ (L - R)", dataIndex: "meter", key: "meter"},
    {title: "Tiêu thụ", dataIndex: "consumption", key: "consumption"},
    {title: "Đơn vị", dataIndex: "unit", key: "unit"},
    {
        title: "Reset",
        dataIndex: "reset",
        key: "reset",
        render: () => <Button type={"link"} className={"text-[#0076d6] p-0"}>Chỉnh</Button>
    },
];

function ActionButtons() {
    return <div className={"flex flex-wrap gap-3 mb-6"}>
        {actionButtons.map((btn) => (
            <Button key={btn.label} className={"border-orange-400 text-orange-500"}>{btn.label}</Button>
        ))}
    </div>
}

function FilterPanel() {
    return <Card className={"mb-4 bg-[#f0f8ff]"} bordered={false}>
        <div className={"font-semibold mb-3"}>Bộ lọc</div>
        <Form layout={"inline"} className={"flex flex-wrap gap-4"}>
            <Form.Item label={"Tên Block"} className={"mb-0"}>
                <Input placeholder={"Nhập tên block"} style={{width: 200}} />
            </Form.Item>
            <Form.Item label={"Loại"} className={"mb-0"}>
                <Select defaultValue={"electric"} options={usageOptions} style={{width: 200}} />
            </Form.Item>
            <Form.Item label={"Tháng"} className={"mb-0"}>
                <Select defaultValue={"all"} options={monthOptions} style={{width: 140}} />
            </Form.Item>
            <Form.Item label={"Năm"} className={"mb-0"}>
                <Select defaultValue={"all"} options={yearOptions} style={{width: 140}} />
            </Form.Item>
            <Form.Item label={"Học kỳ"} className={"mb-0"}>
                <Select defaultValue={"all"} options={semesterOptions} style={{width: 200}} />
            </Form.Item>
            <Button type={"primary"}>Search</Button>
        </Form>
    </Card>
}

function ResultSummary() {
    return <div className={"flex items-center justify-between mb-2"}>
        <Typography.Text className={"text-lg font-semibold"}>
            Kết quả: <span className={"text-[#0076d6]"}>70061</span>
        </Typography.Text>
    </div>
}

export default function ManageElectricWaterPricing() {
    return (
        <LayoutManager active={"electric-water-pricing"}>
            <Card title={"Quản lý điện nước"} className={"shadow"}>
                <ActionButtons />
                <FilterPanel />
                <ResultSummary />
                <Table
                    columns={columns}
                    dataSource={mockData}
                    pagination={false}
                    rowClassName={() => "bg-[#ffeaea]"}
                    className={"rounded border"}
                    scroll={{x: true}}
                />
                <div className={"flex justify-end mt-4"}>
                    <Pagination current={1} total={110} pageSize={10} showSizeChanger={false} />
                </div>
            </Card>
        </LayoutManager>
    );
}