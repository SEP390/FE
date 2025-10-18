import React from "react";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import { Card, Typography, Table, Button, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;

export function MyRequest() {
    const navigate = useNavigate();

    // 🧩 Dữ liệu mẫu
    const dataSource = [
        {
            key: "1",
            requestType: "Đăng kí check out",
            content: "Em đã dọn sạch giường số 2 phòng H306R để check out rồi ạ",
            reply: "Hoàn thành. Em kiểm tra và hoàn thành hóa đơn phụ trội (nếu có).",
            semester: "Spring - 2025",
            createdDate: "29/04/2025 21:58",
            status: "Checkout thành công",
            timeRange: "29/04/2025 21:55 → 30/04/2025 10:10",
            managerComment: "Cảm ơn em đã dọn phòng sạch sẽ, quá trình check out suôn sẻ.",
        },
        {
            key: "2",
            requestType: "Yêu cầu sửa điện",
            content: "Bóng đèn phòng H205 bị cháy, cần thay mới.",
            reply: "Đã giao cho bộ phận kỹ thuật xử lý trong hôm nay.",
            semester: "Spring - 2025",
            createdDate: "02/05/2025 09:40",
            status: "Đang xử lý",
            timeRange: "02/05/2025 09:38 → 02/05/2025 10:00",
            managerComment: "Kỹ thuật viên đang tiến hành kiểm tra hệ thống điện khu H2.",
        },
    ];

    // 🎨 Màu cho trạng thái
    const statusColor = (status) => {
        if (status.includes("thành công")) return "green";
        if (status.includes("Đang xử lý")) return "blue";
        return "default";
    };

    // 🧾 Cấu hình bảng
    const columns = [
        {
            title: "Request Type",
            dataIndex: "requestType",
            key: "requestType",
            width: 150,
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: "Content",
            dataIndex: "content",
            key: "content",
            width: 250,
        },
        {
            title: "Reply",
            dataIndex: "reply",
            key: "reply",
            width: 250,
        },
        {
            title: "Semester",
            dataIndex: "semester",
            key: "semester",
            width: 130,
        },
        {
            title: "Created Date",
            dataIndex: "createdDate",
            key: "createdDate",
            width: 160,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 160,
            render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
        },
        {
            title: "Details",
            key: "details",
            width: 130,
            render: (_, record) => (
                <Button type="link" onClick={() => navigate(`/request-detail/${record.key}`)}>
                    View
                </Button>
            ),
        },
    ];

    return (
        <AppLayout>
            <div className="p-4">
                {/* Tiêu đề và nút tạo mới */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-[#004aad]">My Requests</h1>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/create-request")}
                        style={{ backgroundColor: "#004aad" }}
                    >
                        Create new request
                    </Button>
                </div>

                {/* Đếm số lượng yêu cầu đang xử lý */}
                <p className="text-green-600 mb-4">
                    Your processing CIM request:{" "}
                    {dataSource.filter((d) => d.status.includes("Đang xử lý")).length}
                </p>

                {/* Bảng danh sách */}
                <Card>
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        bordered
                        pagination={false}
                        scroll={{ x: true }}
                    />
                </Card>

                {/* Phần chi tiết thời gian & comment */}
                <div className="mt-6">
                    <Card
                        title="🕒 Thời gian & phản hồi của quản lý"
                        headStyle={{ background: "#004aad", color: "white" }}
                    >
                        {dataSource.map((req) => (
                            <div key={req.key} className="border-b border-gray-200 py-3">
                                <Text strong>{req.requestType}</Text>
                                <br />
                                <Text type="secondary">
                                    ⏰ Thời gian xử lý: {req.timeRange}
                                </Text>
                                <br />
                                <Text>
                                    💬 <strong>Comment của quản lý:</strong> {req.managerComment}
                                </Text>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
