import { useEffect, useState } from "react";
import { Table, Button, Tag, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { ReportDetailModal } from "../../../components/Report/ReportDetailModal.jsx";
// Import LayoutGuard
import { LayoutGuard } from "../../../components/layout/LayoutGuard.jsx";

export function GuardViewReport() {
    // Không cần quản lý state collapsed thủ công nữa
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8080/api/reports", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.status === 200) {
                setReports(res.data.data);
            } else {
                message.error("Không thể tải báo cáo");
            }
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi tải báo cáo");
        } finally {
            setLoading(false);
        }
    };

    const renderStatusTag = (status) => {
        switch (status) {
            case "PENDING":
                return <Tag color="orange">PENDING</Tag>;
            case "CONFIRMED":
                return <Tag color="green">CONFIRMED</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        {
            title: "STT",
            key: "index",
            width: 70,
            render: (_, __, index) => index + 1,
        },
        {
            title: "Nội dung",
            dataIndex: "content",
            key: "content",
        },
        {
            title: "Loại báo cáo",
            dataIndex: "reportType",
            key: "reportType",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdDate",
            key: "createdDate",
            render: (date) => new Date(date).toLocaleString("vi-VN"),
        },
        {
            title: "Trạng thái",
            dataIndex: "reportStatus",
            key: "reportStatus",
            render: renderStatusTag,
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => setSelectedReport(record)}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    return (
        <LayoutGuard active="guard-reports" header="Báo cáo (Bảo vệ)">
            {/* Container màu trắng bao bọc nội dung */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <Button
                    style={{ marginBottom: "16px" }}
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => (window.location.href = "/guard/reports/create")}
                >
                    Tạo báo cáo
                </Button>

                <Table
                    rowKey="reportId"
                    columns={columns}
                    dataSource={reports}
                    loading={loading}
                    pagination={{ pageSize: 6 }}
                />
            </div>

            {selectedReport && (
                <ReportDetailModal
                    open={!!selectedReport}
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                />
            )}
        </LayoutGuard>
    );
}