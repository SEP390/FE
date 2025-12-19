import { useEffect, useState, useRef } from "react";
import { Card, List, Skeleton, Typography, Input, Modal } from "antd";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { NewsDetailModal } from "../../components/news/NewsDetailModal.jsx";
import DOMPurify from "dompurify";

const { Title, Text } = Typography;
const { Search } = Input;

function truncateWords(text, wordLimit) {
    const words = (text || "").split(" ");
    return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : text;
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

export function NewsList() {
    const [allNews, setAllNews] = useState([]); // full visible list
    const [news, setNews] = useState([]); // filtered view
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedNews, setSelectedNews] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const debounceRef = useRef(null);

    const token = localStorage.getItem("token");

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
            const visibleItems = Array.isArray(items)
                ? items.filter((i) => i && i.status === "VISIBLE")
                : [];
            setAllNews(visibleItems);
            setNews(visibleItems);
            // eslint-disable-next-line no-unused-vars
        } catch (e) {
            setAllNews([]);
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearchChange = (value) => {
        const cleaned = normalizeSpaces(value);
        setSearch(cleaned);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (!cleaned) {
                setNews(allNews);
                return;
            }
            const q = removeVietnameseTones(cleaned);
            const filtered = allNews.filter((item) => {
                const title = removeVietnameseTones(item.title || "");
                const content = removeVietnameseTones(item.content || "");
                const user = removeVietnameseTones(item.userNames || "");
                return title.includes(q) || content.includes(q) || user.includes(q);
            });
            setNews(filtered);
        }, 300);
    };

    const handleItemClick = (item) => {
        setSelectedNews(item);
        setModalVisible(true);
    };

    return (
        <AppLayout activeSidebar="news">
            <Card title="News List" className="h-full overflow-auto">
                <Search
                    placeholder="Search news"
                    allowClear
                    enterButton
                    onSearch={(val) => handleSearchChange(val)}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    value={search}
                    style={{ marginBottom: 20, maxWidth: 600 }}
                />
                {loading ? (
                    <Skeleton active />
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={news}
                        pagination={{ pageSize: 5 }}
                        renderItem={(item) => {
                            const dateTime = item?.date
                                ? new Date(item.time ? `${item.date}T${item.time}` : item.date)
                                : null;
                            return (
                                <List.Item
                                    style={{
                                        border: "1px solid #ffa940",
                                        borderRadius: 8,
                                        marginBottom: 16,
                                        marginLeft: 5,
                                        boxShadow: "0 2px 8px rgba(255, 165, 64, 0.08)",
                                        cursor: "pointer",
                                        padding: 12,
                                    }}
                                    onClick={() => handleItemClick(item)}
                                >
                                    <List.Item.Meta
                                        style={{ marginLeft: 6 }}
                                        title={
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <Title level={4} style={{ color: "#fa8c16", margin: 0 }}>
                                                    {item.title}
                                                </Title>
                                            </div>
                                        }
                                        description={
                                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                                <Text type="secondary" style={{ fontSize: 11 }}>
                                                    {item.userNames}
                                                </Text>
                                                {dateTime && (
                                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                                        {dateTime.toLocaleString()}
                                                    </Text>
                                                )}
                                            </div>
                                        }
                                    />
                                    <div style={{ marginLeft: 10, borderTop: "1px solid #f0f0f0", paddingTop: 10 }}
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(truncateWords(item.content, 20)) }}
                                    >
                                    </div>
                                </List.Item>
                            );
                        }}
                    />
                )}
                <Modal
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                    width={900}
                >
                    <NewsDetailModal news={selectedNews} />
                </Modal>
            </Card>
        </AppLayout>
    );
}
