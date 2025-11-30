import { Modal, Form, Input, Select, Divider, App } from "antd";
import { useEffect, useState } from "react";

const { TextArea } = Input;

export function UpdateNewsModal({ open, onCancel, news, onUpdated }) {
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");
    const [htmlPreview, setHtmlPreview] = useState("");
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

    return (
        <Modal
            title="Chỉnh sửa tin tức"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            width={800}
        >
            <Form
                form={form}
                layout="vertical"
                onValuesChange={(changed) => {
                    if (changed.content) setHtmlPreview(changed.content);
                }}
            >
                <Form.Item
                    label="Tiêu đề"
                    name="title"
                    rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Nội dung (HTML)"
                    name="content"
                    rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                >
                    <TextArea rows={6} placeholder="Nhập hoặc dán nội dung HTML..." />
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

            <Divider orientation="left">Xem trước nội dung</Divider>
            <div
                style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: 8,
                    padding: 12,
                    minHeight: 120,
                    background: "#fff",
                    overflowY: "auto",
                    maxHeight: 400,
                }}
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
            />
        </Modal>
    );
}

