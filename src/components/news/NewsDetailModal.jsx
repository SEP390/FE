import { Typography } from "antd";
import DOMPurify from "dompurify";

const { Title, Text } = Typography;

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
                    marginTop: 16,
                }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content) }}
            />
        </div>
    );
}
