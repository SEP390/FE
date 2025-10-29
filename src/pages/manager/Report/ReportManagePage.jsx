import { useEffect, useState } from "react";
import {Layout, Typography, Table, Button, Space, message, Tag, Dropdown,} from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { SideBarManager } from "../../../components/layout/SideBarManger.jsx";
import axios from "axios";

const { Header, Content } = Layout;
const { Title } = Typography;

export function ReportManagePage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:8080/api/reports", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.status === 200) {
                setReports(res.data.data);
            } else {
                message.error("Không thể tải dữ liệu báo cáo");
            }
        } catch (e) {
            console.error(e);
            message.error("Lỗi khi tải dữ liệu báo cáo");
        } finally {
            setLoading(false);
        }
    };

    // Hàm đổi màu trạng thái
    const renderStatusTag = (status) => {
        switch (status) {
            case "PENDING":
                return <Tag color="orange">PENDING</Tag>;
            case "CHECKED":
                return <Tag color="blue">CHECKED</Tag>;
            case "ACCEPTED":
                return <Tag color="green">ACCEPTED</Tag>;
            case "REJECT":
                return <Tag color="red">REJECT</Tag>;
            default:
                return <Tag color="default">{status}</Tag>;
        }
    };

    // Menu hành động
    const getMenuItems = (record) => [
        {
            key: "view",
            label: "Xem chi tiết",
            onClick: () => message.info(`Xem báo cáo: ${record.reportId}`),
        },
        {
            key: "accept",
            label: "Chấp nhận",
            onClick: () => message.success(`Đã chấp nhận báo cáo: ${record.reportId}`),
        },
        {
            key: "reject",
            label: "Từ chối",
            onClick: () => message.warning(`Đã từ chối báo cáo: ${record.reportId}`),
        },
        {
            key: "check",
            label: "Đánh dấu đã kiểm tra",
            onClick: () => message.info(`Đã kiểm tra: ${record.reportId}`),
        },
    ];

    const columns = [
        {
            title: "STT",
            key: "index",
            render: (_, __, index) => index + 1,
            width: 70,
        },
        {
            title: "Tên nhân viên",
            dataIndex: "employeeName",
            key: "employeeName",
        },
        {
            title: "Nội dung",
            dataIndex: "content",
            key: "content",
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
                <Space>
                    <Dropdown
                        menu={{ items: getMenuItems(record) }}
                        trigger={["click"]}
                        placement="bottomRight"
                    >
                        <Button type="text" icon={<EllipsisOutlined />} />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    return (
        <Layout className="!h-screen">
            <SideBarManager active="manager-reports" collapsed={false} />
            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 24px",
                        borderBottom: "1px solid #f0f0f0",
                        height: 80,
                    }}
                >
                    <Title level={2} style={{ margin: 0, lineHeight: "80px" }}>
                        Quản lý báo cáo
                    </Title>
                </Header>
                <Content className="!overflow-auto h-full p-5 flex flex-col bg-white">
                    <Table
                        rowKey="reportId"
                        columns={columns}
                        dataSource={reports}
                        loading={loading}
                        pagination={{ pageSize: 6 }}
                    />
                </Content>
            </Layout>
        </Layout>
    );
}

