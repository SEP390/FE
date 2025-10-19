import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Typography, Form, Input, Button, message, Card } from "antd";
import { SideBarManager } from "../../../components/layout/SideBarManger.jsx";

const { Header, Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

export function CreateNewsPage() {
    const [collapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/users/createNews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    title: values.title,
                    content: values.content,
                    status: "VISIBLE",
                }),
            });

            if (!res.ok) throw new Error("Tạo tin thất bại");
            message.success("Tạo tin thành công!");
            form.resetFields();

            setTimeout(() => navigate("/manager/news"), 1000);
        } catch (e) {
            message.error(e.message || "Không thể tạo tin tức");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <SideBarManager collapsed={collapsed} active="manager-news" />
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
                        Tạo tin tức mới
                    </Title>
                </Header>

                <Content style={{ margin: "24px", padding: 24 }}>
                    <Card
                        style={{
                            maxWidth: 600,
                            margin: "0 auto",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            autoComplete="off"
                        >
                            <Form.Item
                                label="Tiêu đề"
                                name="title"
                                rules={[{ required: true, message: "Nhập tiêu đề tin tức" }]}
                            >
                                <Input placeholder="Nhập tiêu đề..." />
                            </Form.Item>

                            <Form.Item
                                label="Nội dung"
                                name="content"
                                rules={[{ required: true, message: "Nhập nội dung tin tức" }]}
                            >
                                <TextArea rows={5} placeholder="Nhập nội dung..." />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                >
                                    Tạo tin
                                </Button>
                                <Button
                                    onClick={() => navigate("/manager/news")}
                                    style={{ marginTop: 10 }}
                                    block
                                >
                                    Hủy
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </Content>
            </Layout>
        </Layout>
    );
}
