import { Modal, Input, Button, Table, Space, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";

export function CreateQuestionModal({ open, onCancel, onSuccess }) {
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState([{ id: Date.now(), content: "" }]);
    const [loading, setLoading] = useState(false);

    const handleAddRow = () => {
        setAnswers([...answers, { id: Date.now(), content: "" }]);
    };

    const handleDeleteRow = (id) => {
        setAnswers(answers.filter(a => a.id !== id));
    };

    const handleAnswerChange = (id, value) => {
        setAnswers(answers.map(a => (a.id === id ? { ...a, content: value } : a)));
    };

    const handleSubmit = async () => {
        if (!question.trim()) {
            message.warning("Vui lòng nhập nội dung câu hỏi");
            return;
        }

        const nonEmptyAnswers = answers
            .filter(a => a.content.trim() !== "")
            .map(a => ({ selectContent: a.content.trim() }));

        if (nonEmptyAnswers.length === 0) {
            message.warning("Vui lòng nhập ít nhất 1 câu trả lời");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const res = await fetch("http://localhost:8080/api/surveys", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    questionContent: question.trim(),
                    surveyOptions: nonEmptyAnswers,
                }),
            });

            const data = await res.json();
            if (data.status !== 200) throw new Error("Tạo câu hỏi thất bại");

            message.success("Thêm câu hỏi thành công");
            onSuccess?.();
            onCancel();
        } catch (err) {
            message.error(err.message || "Lỗi khi thêm câu hỏi");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Câu trả lời",
            dataIndex: "content",
            key: "content",
            render: (text, record) => (
                <Input
                    value={record.content}
                    onChange={(e) => handleAnswerChange(record.id, e.target.value)}
                    placeholder="Nhập nội dung câu trả lời"
                />
            ),
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            render: (_, record) => (
                <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteRow(record.id)}
                />
            ),
            width: "10%",
        },
    ];

    return (
        <Modal
            title="Tạo câu hỏi khảo sát"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu"
            cancelText="Hủy"
            width={700}
        >
            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Nhập nội dung câu hỏi"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
            </div>

            <Table
                columns={columns}
                dataSource={answers}
                rowKey="id"
                pagination={false}
                footer={() => (
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={handleAddRow}
                        style={{ width: "100%" }}
                    >
                        Thêm câu trả lời
                    </Button>
                )}
            />
        </Modal>
    );
}

