import { SideBarManager } from "../../../components/layout/SideBarManger.jsx";
import { useEffect, useState } from "react";
import { Layout, Typography, Table, Button, Tag, Dropdown, Space, message } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title } = Typography;

export function NewsManagePage() {
    const [collapsed] = useState(false);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    const fetchNews = async () => {
        setLoading(true);
        try {
            const base = "http://localhost:8080/api/users";
            const res = await fetch(`${base}/news`, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const resp = await res.json();
            const items = resp && resp.data ? resp.data : [];
            setNews(Array.isArray(items) ? items : []);
        } catch (e) {
            message.error("Không thể tải danh sách tin tức");
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleView = (record) => {
        message.info(`Xem chi tiết: ${record.title}`);
    };

    const handleEdit = (record) => {
        message.info(`Chỉnh sửa: ${record.title}`);
    };

    const handleToggleStatus = (record) => {
        const newStatus = record.status === "VISIBLE" ? "HIDDEN" : "VISIBLE";
        setNews(prev =>
            prev.map(n =>
                n.newsid === record.newsid ? { ...n, status: newStatus } : n
            )
        );
        message.success(newStatus === "VISIBLE" ? "Tin đã hiển thị" : "Tin đã ẩn");
    };

    const getMenuItems = (record) => [
        {
            key: "view",
            label: "Xem chi tiết",
            onClick: () => handleView(record),
        },
        {
            key: "edit",
            label: "Chỉnh sửa",
            onClick: () => handleEdit(record),
        },
        {
            key: "toggle",
            label: record.status === "VISIBLE" ? "Ẩn" : "Hiện",
            onClick: () => handleToggleStatus(record),
        },
    ];

    const columns = [
        { title: "Tiêu đề", dataIndex: "title", key: "title" },
        { title: "Nội dung", dataIndex: "content", key: "content" },
        { title: "Ngày đăng", dataIndex: "date", key: "date" },
        { title: "Giờ đăng", dataIndex: "time", key: "time" },
        { title: "Người đăng", dataIndex: "userNames", key: "userNames" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "VISIBLE" ? "green" : "red"}>{status}</Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Dropdown
                    menu={{ items: getMenuItems(record) }}
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <Button shape="circle" icon={<EllipsisOutlined />} />
                </Dropdown>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <SideBarManager collapsed={collapsed} active="manager-news" />
            <Layout>
                <Header style={{ background: "#fff", padding: "0 24px", borderBottom: "1px solid #f0f0f0", height: 80 }}>
                    <Title level={2} style={{ margin: 0, lineHeight: "80px" }}>
                        Quản lý tin tức
                    </Title>
                </Header>

                <Content style={{ margin: "24px", background: "#fff", padding: 24 }}>
                    <Table
                        rowKey="newsid"
                        columns={columns}
                        dataSource={news}
                        loading={loading}
                        bordered
                    />
                </Content>
            </Layout>
        </Layout>
    );
}

