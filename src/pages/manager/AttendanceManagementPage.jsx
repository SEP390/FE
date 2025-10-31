import React, { useMemo, useState } from "react";
import { Card, DatePicker, Select, Table, Tag, Typography, Space, Button, Input } from "antd";

const { RangePicker } = DatePicker;
const { Title } = Typography;

export function AttendanceManagementPage() {
    const [dateRange, setDateRange] = useState([]);
    const [shift, setShift] = useState(undefined);
    const [keyword, setKeyword] = useState("");

    const columns = useMemo(
        () => [
            { title: "Mã NV", dataIndex: "staffCode", key: "staffCode", width: 120 },
            { title: "Họ tên", dataIndex: "fullName", key: "fullName", width: 200 },
            { title: "Ngày", dataIndex: "date", key: "date", width: 140 },
            { title: "Ca", dataIndex: "shift", key: "shift", width: 100 },
            {
                title: "Trạng thái",
                dataIndex: "status",
                key: "status",
                width: 140,
                render: (status) => {
                    const color = status === "Đúng giờ" ? "green" : status === "Đi muộn" ? "orange" : "red";
                    return <Tag color={color}>{status}</Tag>;
                },
            },
            { title: "Ghi chú", dataIndex: "note", key: "note" },
        ],
        []
    );

    // Demo data; replace with API integration later
    const dataSource = useMemo(
        () => [
            { key: 1, staffCode: "ST001", fullName: "Nguyễn Văn A", date: "2025-10-01", shift: "Sáng", status: "Đúng giờ", note: "" },
            { key: 2, staffCode: "ST002", fullName: "Trần Thị B", date: "2025-10-01", shift: "Chiều", status: "Đi muộn", note: "Kẹt xe" },
            { key: 3, staffCode: "ST003", fullName: "Lê Văn C", date: "2025-10-01", shift: "Tối", status: "Vắng", note: "Xin nghỉ" },
        ],
        []
    );

    return (
        <div className="p-4">
            <Title level={3} style={{ marginBottom: 16 }}>Quản lý chấm công</Title>
            <Card className="mb-4" bodyStyle={{ paddingBottom: 8 }}>
                <Space wrap>
                    <RangePicker onChange={setDateRange} placeholder={["Từ ngày", "Đến ngày"]} />
                    <Select
                        allowClear
                        placeholder="Chọn ca"
                        style={{ width: 160 }}
                        value={shift}
                        onChange={setShift}
                        options={[
                            { value: "Sáng", label: "Sáng" },
                            { value: "Chiều", label: "Chiều" },
                            { value: "Tối", label: "Tối" },
                        ]}
                    />
                    <Input.Search
                        placeholder="Tìm theo tên/mã NV"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onSearch={() => {}}
                        style={{ width: 240 }}
                        allowClear
                    />
                    <Button type="primary">Lọc</Button>
                    <Button>Xuất Excel</Button>
                </Space>
            </Card>

            <Card>
                <Table
                    rowKey="key"
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
}

export default AttendanceManagementPage;


