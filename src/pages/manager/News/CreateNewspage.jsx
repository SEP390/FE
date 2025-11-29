import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Layout, Typography, Form, Input, Button, Card, Upload, App} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as mammoth from "mammoth";
import { SideBarManager } from "../../../components/layout/SideBarManger.jsx";

const { Header, Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;

export function CreateNewsPage() {
    const [collapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [htmlContent, setHtmlContent] = useState("");
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const {message} = App.useApp();

    // Xử lý upload file Word
    const handleWordUpload = async (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = result.value;
            setHtmlContent(html);
            form.setFieldValue("content", html); // Lưu vào form luôn
        };
        reader.readAsArrayBuffer(file);
        return false; // Ngăn antd tự upload
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/news", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    title: values.title,
                    content: values.content, // HTML string
                    userId: "",
                    status: "VISIBLE",
                }),
            });

            if (!res.ok) throw new Error("Tạo tin thất bại");
            message.success("Tạo tin thành công!");
            form.resetFields();
            setHtmlContent("");
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
                            maxWidth: 800,
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

                            <Form.Item label="Nhập nội dung hoặc import từ Word" name="content" rules={[{ required: true }]}>
                                <TextArea
                                    rows={6}
                                    placeholder="Nhập nội dung..."
                                    onChange={(e) => setHtmlContent(e.target.value)}
                                />
                            </Form.Item>

                            <Upload beforeUpload={handleWordUpload} showUploadList={false}>
                                <Button icon={<UploadOutlined />}>Import file Word (.docx)</Button>
                            </Upload>

                            {htmlContent && (
                                <div
                                    style={{
                                        marginTop: 20,
                                        padding: 16,
                                        border: "1px solid #d9d9d9",
                                        borderRadius: 8,
                                    }}
                                >
                                    <div
                                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                                    />
                                </div>
                            )}

                            <Form.Item style={{ marginTop: 20 }}>
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
