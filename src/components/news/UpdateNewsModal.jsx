import { Modal, Form, Input, Select, message } from "antd";
import { useEffect } from "react";

const { TextArea } = Input;

export function UpdateNewsModal({ open, onCancel, news, onUpdated }) {
    const [form] = Form.useForm();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (news) form.setFieldsValue(news);
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
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Tiêu đề"
                    name="title"
                    rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label="Nội dung"
                    name="content"
                    rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                >
                    <TextArea rows={5} />
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
