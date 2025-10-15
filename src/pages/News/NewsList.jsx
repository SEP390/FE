import { useEffect, useState } from "react";
import { Card, List, Skeleton, Typography, Input, Modal } from "antd";
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { NewsDetailModal } from "../../components/news/NewsDetailModal.jsx";

const { Title, Text } = Typography;
const { Search } = Input;

function truncateWords(text, wordLimit) {
    const words = text.split(" ");
    return words.length > wordLimit
        ? words.slice(0, wordLimit).join(" ") + "..."
        : text;
}

function removeVietnameseTones(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
}

function normalizeSpaces(str) {
    return str.replace(/\s+/g, " ").trim();
}

export function NewsList() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedNews, setSelectedNews] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetch("http://localhost:8080/api/users/news")
            .then((res) => res.json())
            .then((data) => {
                setNews(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi khi fetch news:", err);
                setLoading(false);
            });
    }, []);


    const filteredNews = news.filter(item =>
        removeVietnameseTones(normalizeSpaces(item.title)).includes(
            removeVietnameseTones(normalizeSpaces(search))
        ) ||
        removeVietnameseTones(normalizeSpaces(item.content)).includes(
            removeVietnameseTones(normalizeSpaces(search))
        )
    );
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
                    onChange={e => setSearch(normalizeSpaces(e.target.value))}
                    style={{ marginBottom: 20, maxWidth: 400 }}
                />
                {loading ? (
                    <Skeleton active />
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={filteredNews}
                        pagination={{
                            pageSize: 5,
                        }}
                        renderItem={item => (
                            <List.Item
                                style={{
                                    border: "1px solid #ffa940",
                                    borderRadius: 8,
                                    marginBottom: 16,
                                    marginLeft: 5,
                                    boxShadow: "0 2px 8px rgba(255, 165, 64, 0.1)",
                                    cursor: "pointer"
                                }}
                                onClick={() => handleItemClick(item)}
                            >
                                <List.Item.Meta
                                    style={{ marginLeft: 10 }}
                                    title={
                                        <Title level={4} style={{ color: "#fa8c16", margin: 0 }}>
                                            {item.title}
                                        </Title>
                                    }
                                    description={
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {new Date(item.date).toLocaleString()}
                                        </Text>
                                    }
                                />
                                <div style={{ marginLeft: 10 }}>
                                    {truncateWords(item.content, 30)}
                                </div>
                            </List.Item>
                        )}
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

