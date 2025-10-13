import { useEffect, useState } from "react";
import { Card, List, Skeleton, Typography, Input } from "antd";
import { AppLayout } from "../../components/layout/AppLayout.jsx";

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
        .normalize("NFD") // tách chữ và dấu
        .replace(/[\u0300-\u036f]/g, "") // xóa dấu
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
}


export function NewsList() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/news.json")
            .then(res => res.json())
            .then(data => {
                setNews(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredNews = news.filter(item =>
        removeVietnameseTones(item.title).includes(removeVietnameseTones(search)) ||
        removeVietnameseTones(item.content).includes(removeVietnameseTones(search))
    );


    // const filteredNews = news.filter(
    //     item =>
    //         item.title.toLowerCase().includes(search.toLowerCase()) ||
    //         item.content.toLowerCase().includes(search.toLowerCase())
    // );

    return (
        <AppLayout activeSidebar="news">
            <Card title="News List" className="h-full overflow-auto">
                <Search
                    placeholder="Search news"
                    allowClear
                    onChange={e => setSearch(e.target.value)}
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
                                }}
                            >
                                <List.Item.Meta
                                    style={{
                                        marginLeft: 10,
                                    }}
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
            </Card>
        </AppLayout>
    );
}
