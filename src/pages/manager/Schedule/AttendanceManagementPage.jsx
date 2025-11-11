import React, { useMemo, useState, useEffect } from "react";
import { Card, DatePicker, Select, Table, Tag, Typography, Space, Button, Input, message, Spin } from "antd";
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Option } = Select;

export function AttendanceManagementPage() {
    // --- STATE CHO BỘ LỌC ---
    // (Khởi tạo mặc định là ngày hôm nay)
    const [filters, setFilters] = useState({
        dateRange: [dayjs(), dayjs()],
        shiftId: undefined,
        keyword: ""
    });

    // --- STATE DỮ LIỆU ---
    const [attendanceData, setAttendanceData] = useState([]);
    const [shifts, setShifts] = useState([]); // Để điền vào bộ lọc ca
    const [loading, setLoading] = useState(false);

    // --- HÀM TẢI DỮ LIỆU ---

    // 1. Tải danh sách ca (chỉ 1 lần)
    const fetchShifts = async () => {
        try {
            const response = await axiosClient.get('/shifts');
            const formattedShifts = (response.data || []).map(s => ({
                ...s,
                id: s.id || s.key,
                name: `${s.name} (${s.startTime} - ${s.endTime})`
            }));
            setShifts(formattedShifts);
        } catch (error) {
            message.error("Không thể tải danh sách ca làm việc.");
        }
    };

    // 2. Tải dữ liệu chấm công (dựa trên bộ lọc)
    const fetchAttendance = async (currentFilters) => {
        setLoading(true);

        const params = {
            startDate: currentFilters.dateRange[0].format('YYYY-MM-DD'),
            endDate: currentFilters.dateRange[1].format('YYYY-MM-DD'),
            shiftId: currentFilters.shiftId,
            keyword: currentFilters.keyword
        };

        try {
            // API Giả định: GET /attendances
            const response = await axiosClient.get('/attendances', { params });
            // (Giả sử data trả về khớp với các cột)
            setAttendanceData(response.data.map(item => ({ ...item, key: item.id })) || []);
        } catch (error) {
            message.error("Không thể tải dữ liệu chấm công!");
        } finally {
            setLoading(false);
        }
    };

    // 3. useEffect ban đầu
    useEffect(() => {
        fetchShifts();
        fetchAttendance(filters); // Tải dữ liệu cho ngày hôm nay
    }, []); // Chỉ chạy 1 lần lúc mở trang

    // --- HÀM XỬ LÝ EVENT ---

    // Cập nhật state filter
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Khi nhấn nút "Lọc"
    const handleFilterSubmit = () => {
        fetchAttendance(filters);
    };

    // === CỘT BẢNG (Giữ nguyên) ===
    const columns = useMemo(
        () => [
            // (Bạn có thể thêm/bớt cột tùy theo DTO /attendances của BE)
            { title: "Mã NV", dataIndex: "staffCode", key: "staffCode", width: 120 },
            { title: "Họ tên", dataIndex: "fullName", key: "fullName", width: 200 },
            { title: "Ngày", dataIndex: "date", key: "date", width: 140 },
            { title: "Ca", dataIndex: "shiftName", key: "shiftName", width: 100 },
            {
                title: "Trạng thái",
                dataIndex: "status",
                key: "status",
                width: 140,
                render: (status) => {
                    let color;
                    if (status === "PRESENT" || status === "Đúng giờ") color = "green";
                    else if (status === "LATE" || status === "Đi muộn") color = "orange";
                    else if (status === "ABSENT" || status === "Vắng") color = "red";
                    else color = "default";
                    return <Tag color={color}>{status}</Tag>;
                },
            },
            { title: "Giờ Check-in", dataIndex: "checkInTime", key: "checkInTime", width: 140 },
            { title: "Giờ Check-out", dataIndex: "checkOutTime", key: "checkOutTime", width: 140 },
            { title: "Ghi chú", dataIndex: "note", key: "note" },
        ],
        []
    );

    // === RENDER ===
    return (
        // (Tôi giả sử trang này là 1 component con, không phải layout chính)
        <div className="p-4">
            <Title level={3} style={{ marginBottom: 16 }}>Quản lý chấm công</Title>

            <Card className="mb-4" bodyStyle={{ paddingBottom: 8 }}>
                <Space wrap>
                    <RangePicker
                        value={filters.dateRange}
                        onChange={(dates) => handleFilterChange('dateRange', dates)}
                        placeholder={["Từ ngày", "Đến ngày"]}
                    />
                    <Select
                        allowClear
                        placeholder="Chọn ca"
                        style={{ width: 160 }}
                        value={filters.shiftId}
                        onChange={(value) => handleFilterChange('shiftId', value)}
                    >
                        {shifts.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                    </Select>
                    <Input.Search
                        placeholder="Tìm theo tên/mã NV"
                        value={filters.keyword}
                        onChange={(e) => handleFilterChange('keyword', e.target.value)}
                        onSearch={handleFilterSubmit} // Cho phép tìm bằng Enter
                        style={{ width: 240 }}
                        allowClear
                    />
                    <Button type="primary" onClick={handleFilterSubmit} loading={loading}>
                        Lọc
                    </Button>
                    <Button>Xuất Excel</Button>
                </Space>
            </Card>

            <Card>
                <Spin spinning={loading}>
                    <Table
                        rowKey="key"
                        columns={columns}
                        dataSource={attendanceData}
                        pagination={{ pageSize: 10 }}
                    />
                </Spin>
            </Card>
        </div>
    );
}
