import { SideBarManager } from "../../../components/layout/SideBarManger.jsx";
import { useEffect, useState } from "react";
import {Layout, Typography, Table, Button, Tag, Dropdown, message, Modal, Space, Input,} from "antd";
import {EllipsisOutlined, PlusOutlined, SearchOutlined,} from "@ant-design/icons";
import { NewsDetailModal } from "../../../components/news/NewsDetailModal.jsx";
import { useNavigate } from "react-router-dom";
import { UpdateNewsModal } from "../../../components/news/UpdateNewsModal.jsx";
import {AppHeader} from "../../../components/layout/AppHeader.jsx";
import {useCollapsed} from "../../../hooks/useCollapsed.js";


const { Header, Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

// Hàm xử lý chuỗi
function truncateWords(text, wordLimit) {
    const words = (text || "").split(" ");
    return words.length > wordLimit
        ? words.slice(0, wordLimit).join(" ") + "..."
        : text;
}

function removeVietnameseTones(str = "") {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
}

function normalizeSpaces(str = "") {
    return str.replace(/\s+/g, " ").trim();
}

export function NewsManagePage() {
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);
    const [news, setNews] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedNews, setSelectedNews] = useState(null);
    const navigate = useNavigate();
    const [editModalVisible, setEditModalVisible] = useState(false);


    // Fetch tin tức từ API có token auth
    const fetchNews = async () => {
        setLoading(true);
        try {
            const base = "http://localhost:8080/api";
            const res = await fetch(`${base}/news`, {
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const resp = await res.json();
            const items = resp && resp.data ? resp.data : [];
            setNews(Array.isArray(items) ? items : []);
            setFilteredNews(Array.isArray(items) ? items : []);
        } catch (e) {
            message.error("Không thể tải danh sách tin tức");
            setNews([]);
            setFilteredNews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Tìm kiếm tin tức
    const handleSearch = (value) => {
        const query = normalizeSpaces(removeVietnameseTones(value));
        if (!query) {
            setFilteredNews(news);
            return;
        }
        const filtered = news.filter((n) =>
            removeVietnameseTones(`${n.title} ${n.content}`).includes(query)
        );
        setFilteredNews(filtered);
    };


    const handleView = (record) => {
        setSelectedNews(record);
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setSelectedNews(record);
        setEditModalVisible(true);
    };
    const toggleSideBar = () => {
        setCollapsed(!collapsed);
    }

    const handleToggleStatus = async (record) => {
        const newStatus = record.status === "VISIBLE" ? "HIDDEN" : "VISIBLE";

        try {
            const res = await fetch(`http://localhost:8080/api/news/updatenews/${record.newsid}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    title: record.title,
                    content: record.content,
                    status: newStatus,
                    date: record.date,
                    time: record.time
                }),
            });

            if (!res.ok) throw new Error("Update failed");
            const data = await res.json();

            // Cập nhật trong state
            setNews((prev) =>
                prev.map((n) =>
                    n.newsid === record.newsid ? data.data : n
                )
            );
            setFilteredNews((prev) =>
                prev.map((n) =>
                    n.newsid === record.newsid ? data.data : n
                )
            );

            message.success(newStatus === "VISIBLE" ? "Tin đã hiển thị" : "Tin đã ẩn");
        } catch (err) {
            message.error("Không thể cập nhật trạng thái tin");
            console.error(err);
        }
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
            label: record.status === "VISIBLE" ? "Ẩn tin" : "Hiện tin",
            onClick: () => handleToggleStatus(record),
        },
    ];

    const columns = [
        { title: "Tiêu đề", dataIndex: "title", key: "title" },
        {
            title: "Nội dung",
            dataIndex: "content",
            key: "content",
            render: (text) => truncateWords(text, 12),
        },
        { title: "Ngày", dataIndex: "date", key: "date" },
        { title: "Giờ", dataIndex: "time", key: "time" },
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
            align: "center",
            render: (_, record) => (
                <Dropdown
                    menu={{ items: getMenuItems(record) }}
                    trigger={["click"]}
                    placement="bottomRight"
                >
                    <Button type="text" icon={<EllipsisOutlined />} />
                </Dropdown>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <SideBarManager  active="manager-news" />
            <Layout>
                <AppHeader header={"Quản lý tin tức"} toggleSideBar={toggleSideBar}/>

                <Content style={{ margin: "24px", background: "#fff", padding: 24 }}>
                    <Space
                        style={{
                            marginBottom: 16,
                            width: "100%",
                            justifyContent: "space-between",
                        }}
                    >
                        <Input
                            placeholder="Tìm kiếm tin tức..."
                            allowClear
                            prefix={<SearchOutlined />}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{ maxWidth: 400 }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/manager/news/create")}
                        >
                            Tạo tin mới
                        </Button>
                    </Space>

                    <Table
                        rowKey="newsid"
                        columns={columns}
                        dataSource={filteredNews}
                        loading={loading}
                        bordered
                        pagination={{ pageSize: 6 }}
                    />

                    <Modal
                        open={modalVisible}
                        onCancel={() => setModalVisible(false)}
                        footer={null}
                        width={900}
                    >
                        <NewsDetailModal news={selectedNews} />
                    </Modal>
                    <UpdateNewsModal
                        open={editModalVisible}
                        onCancel={() => setEditModalVisible(false)}
                        news={selectedNews}
                        onUpdated={(updated) => {
                            setNews(prev => prev.map(n => n.newsid === updated.newsid ? updated : n));
                            setFilteredNews(prev => prev.map(n => n.newsid === updated.newsid ? updated : n));
                        }}
                    />
                </Content>
            </Layout>
        </Layout>
    );
}


