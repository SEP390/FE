import { Modal, Form, Input, Select, Tabs, App } from "antd";
import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { RichTextEditor } from "../editor/RichTextEditor.jsx";
import { EditOutlined, CodeOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export function UpdateNewsModal({ open, onCancel, news, onUpdated }) {
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");
    const [htmlPreview, setHtmlPreview] = useState("");
    const [editorMode, setEditorMode] = useState("visual");
    const { message } = App.useApp();

    useEffect(() => {
        if (news) {
            form.setFieldsValue(news);
            setHtmlPreview(news.content || "");
        }
    }, [news, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const res = await fetch(`http://localhost:8080/api/news/${news.newsid}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error("Update failed");
            const data = await res.json();
            message.success("Cập nhật tin tức thành công");
            onUpdated(data.data);
            onCancel();
        } catch (err) {
            message.error("Không thể cập nhật tin tức");
        }
    };

    const handleEditorChange = (content) => {
        setHtmlPreview(content);
        form.setFieldValue("content", content);
    };

    const handleHtmlChange = (e) => {
        const content = e.target.value;
        setHtmlPreview(content);
        form.setFieldValue("content", content);
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
                <RichTextEditor
                    value={htmlPreview}
                    onChange={handleEditorChange}
                    placeholder="Nhập nội dung..."
                />
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
                    rows={10}
                    value={htmlPreview}
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
                        border: "1px solid #d9d9d9",
                        borderRadius: 8,
                        padding: 12,
                        minHeight: 300,
                        background: "#fff",
                        overflowY: "auto",
                        maxHeight: 400,
                    }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlPreview) }}
                />
            ),
        },
    ];

    return (
        <Modal
            title="Chỉnh sửa tin tức"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            width={1000}
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    label="Tiêu đề"
                    name="title"
                    rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                >
                    <Input size="large" />
                </Form.Item>

                <Form.Item
                    label="Nội dung"
                    name="content"
                    rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                >
                    <Tabs
                        activeKey={editorMode}
                        onChange={setEditorMode}
                        items={tabItems}
                    />
                </Form.Item>

                <Form.Item label="Trạng thái" name="status">
                    <Select
                        options={[
                            { label: "Hiển thị", value: "VISIBLE" },
                            { label: "Ẩn", value: "HIDDEN" },
                        ]}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

