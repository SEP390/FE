import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Form, Input, Button, Card, Upload, App, Tabs } from "antd";
import { UploadOutlined, EditOutlined, CodeOutlined } from "@ant-design/icons";
import * as mammoth from "mammoth";
import { LayoutManager } from "../../../components/layout/LayoutManager.jsx";
import { RichTextEditor } from "../../../components/editor/RichTextEditor.jsx";
import DOMPurify from "dompurify";

const { Title } = Typography;
const { TextArea } = Input;

export function CreateNewsPage() {
    const [loading, setLoading] = useState(false);
    const [htmlContent, setHtmlContent] = useState("");
    const [editorMode, setEditorMode] = useState("visual");
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const { message } = App.useApp();

    // Xử lý upload file Word
    const handleWordUpload = async (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const html = result.value;
            setHtmlContent(html);
            form.setFieldValue("content", html);
        };
        reader.readAsArrayBuffer(file);
        return false;
    };

    // Xử lý thay đổi nội dung từ Rich Editor
    const handleEditorChange = (content) => {
        setHtmlContent(content);
        form.setFieldValue("content", content);
    };

    // Xử lý thay đổi HTML thủ công
    const handleHtmlChange = (e) => {
        const content = e.target.value;
        setHtmlContent(content);
        form.setFieldValue("content", content);
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
                    content: values.content,
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

    const tabItems = [
        {
            key: 'visual',
            label: (
                <span>
                    <EditOutlined /> Chế độ soạn thảo
                </span>
            ),
            children: (
                <div>
                    <RichTextEditor
                        value={htmlContent}
                        onChange={handleEditorChange}
                        placeholder="Nhập nội dung hoặc import từ Word..."
                    />
                </div>
            ),
        },
        {
            key: 'html',
            label: (
                <span>
                    <CodeOutlined /> Chế độ HTML
                </span>
            ),
            children: (
                <TextArea
                    rows={15}
                    value={htmlContent}
                    onChange={handleHtmlChange}
                    placeholder="Nhập hoặc chỉnh sửa mã HTML..."
                />
            ),
        },
        {
            key: 'preview',
            label: 'Xem trước',
            children: (
                <div
                    style={{
                        padding: 16,
                        border: "1px solid #d9d9d9",
                        borderRadius: 8,
                        minHeight: 400,
                        background: '#fff'
                    }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }}
                />
            ),
        },
    ];

    return (
        <LayoutManager active="manager-news" header="Tạo tin tức mới">
            <Card
                style={{
                    width: 1000,
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
                        <Input placeholder="Nhập tiêu đề..." size="large" />
                    </Form.Item>

                    <Form.Item
                        label={
                            <div style={{  justifyContent: 'space-between', width: '100%' }}>
                                <span>Nội dung</span>
                                <Upload beforeUpload={handleWordUpload} showUploadList={false}>
                                    <Button icon={<UploadOutlined />} size="small">
                                        Import file Word (.docx)
                                    </Button>
                                </Upload>
                            </div>
                        }
                        name="content"
                        rules={[{ required: true, message: "Nhập nội dung tin tức" }]}
                    >
                        <div className="news-editor-wrapper">
                            <Tabs
                                activeKey={editorMode}
                                onChange={setEditorMode}
                                items={tabItems}
                            />
                        </div>
                    </Form.Item>

                    <Form.Item style={{ marginTop: 20 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            block
                        >
                            Tạo tin
                        </Button>
                        <Button
                            onClick={() => navigate("/manager/news")}
                            style={{ marginTop: 10 }}
                            size="large"
                            block
                        >
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </LayoutManager>
    );
}