import { useEffect, useState } from "react";
import {Layout, Typography, Table, Button, Tag, message} from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { GuardSidebar } from "../../../components/layout/GuardSidebar.jsx";
import axios from "axios";
import {AppHeader} from "../../../components/layout/AppHeader.jsx";
import {ReportDetailModal} from "../../../components/Report/ReportDetailModal.jsx";

const { Header, Content } = Layout;
const { Title } = Typography;

export function GuardViewReport() {
    const [collapsed, setCollapsed] = useState(false);
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
        <Layout className="!h-screen">
            <GuardSidebar collapsed={collapsed} active="guard-reports" />
            <Layout>
                <AppHeader/>

                <Content style={{margin: "24px", background: "#fff", padding: 24}}>
                    <Button
                        style={{marginBottom:"10px"}}
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
                </Content>

            </Layout>
            {selectedReport && (
                <ReportDetailModal
                    open={!!selectedReport}
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                />
            )}
        </Layout>
    );
}
