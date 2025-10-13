import { Typography } from "antd";

const { Title, Text, Paragraph } = Typography;

export function NewsDetailModal({ news }) {
    if (!news) return null;
    return (
        <div>
            <Title level={3} style={{ color: "#fa8c16" }}>{news.title}</Title>
            <Text type="secondary" style={{ fontSize: 10 }}>
                {new Date(news.date).toLocaleString()}
            </Text>
            <div
                style={{
                    border: "1px solid #ffa940",
                    borderRadius: 8,
                    padding: 16,
                    marginTop: 16
                    //background: "#fffbe6"
                }}
            >
                <Paragraph style={{ margin: 0 }}>{news.content}</Paragraph>
            </div>
        </div>
    );
}