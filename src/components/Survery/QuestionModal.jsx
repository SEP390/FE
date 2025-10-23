import { useEffect, useState } from "react";
import { Modal, Input, Table, Button, message, Space } from "antd";

export function QuestionModal({ open, onCancel, questionId }) {
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState([{ id: Date.now(), content: "", isNew: true }]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    // Nếu có questionId => fetch dữ liệu để update
    useEffect(() => {
        if (questionId) {
            setLoading(true);
            fetch(`http://localhost:8080/api/surveys/${questionId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 200 && data.data) {
                        const q = data.data;
                        setQuestion(q.questionContent);
                        setAnswers(
                            q.options?.length
                                ? q.options.map(o => ({
                                    id: o.id,
                                    content: o.optionContent || "",
                                    isExisting: true,
                                }))
                                : [{ id: Date.now(), content: "", isNew: true }]
                        );
                    } else {
                        message.error("Không tải được dữ liệu câu hỏi");
                    }
                })
                .catch(() => message.error("Lỗi server"))
                .finally(() => setLoading(false));
        } else {
            // reset khi tạo mới
            setQuestion("");
            setAnswers([{ id: Date.now(), content: "", isNew: true }]);
        }
    }, [questionId]);

    // Thêm hàng mới
    const handleAddRow = () => {
        setAnswers([...answers, { id: Date.now(), content: "", isNew: true }]);
    };

    // Cập nhật nội dung câu trả lời
    const handleAnswerChange = (id, value) => {
        setAnswers(prev =>
            prev.map(a => (a.id === id ? { ...a, content: value } : a))
        );
    };

    // Xoá hàng khỏi bảng
    const handleDeleteRow = (id) => {
        setAnswers(prev => prev.filter(a => a.id !== id));
    };

    // Đóng modal
    const handleClose = () => {
        setQuestion("");
        setAnswers([{ id: Date.now(), content: "", isNew: true }]);
        onCancel();
    };

    // Lưu dữ liệu
    const handleSave = async () => {
        if (!question.trim()) {
            message.warning("Vui lòng nhập nội dung câu hỏi");
            return;
        }

        setLoading(true);

        try {
            if (!questionId) {
                // POST: thêm mới câu hỏi + câu trả lời
                const res = await fetch("http://localhost:8080/api/surveys", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        questionContent: question,
                        surveyOptions: answers
                            .filter(a => a.content.trim() !== "")
                            .map(a => ({ content: a.content })),
                    }),
                });
                if (res.ok) {
                    message.success("Thêm câu hỏi thành công");
                    handleClose();
                } else message.error("Không thể thêm câu hỏi");
            } else {
                // PUT: cập nhật câu hỏi
                const resQ = await fetch(`http://localhost:8080/api/surveys/${questionId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ questionContent: question }),
                });
                if (!resQ.ok) throw new Error("Cập nhật câu hỏi thất bại");

                // PUT hoặc POST câu trả lời
                for (const a of answers) {
                    if (!a.content.trim()) continue;

                    if (a.isExisting) {
                        await fetch(`http://localhost:8080/api/survey-options/${a.id}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ content: a.content }),
                        });
                    } else if (a.isNew) {
                        await fetch("http://localhost:8080/api/survey-select", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                surveyId: questionId,
                                content: a.content,
                            }),
                        });
                    }
                }

                message.success("Cập nhật câu hỏi thành công");
                handleClose();
            }
        } catch (err) {
            console.error(err);
            message.error("Lỗi khi lưu dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Nội dung câu trả lời",
            dataIndex: "content",
            render: (_, record) => (
                <Input
                    value={record.content}
                    onChange={(e) => handleAnswerChange(record.id, e.target.value)}
                    placeholder="Nhập nội dung câu trả lời"
                />
            ),
        },
        {
            title: "",
            key: "action",
            width: 80,
            render: (_, record) => (
                <Button danger type="link" onClick={() => handleDeleteRow(record.id)}>
                    Xóa
                </Button>
            ),
        },
    ];

    return (
        <Modal
            open={open}
            title={questionId ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
            onCancel={handleClose}
            onOk={handleSave}
            okText="Lưu"
            cancelText="Hủy"
            confirmLoading={loading}
            maskClosable={false}
        >
            <Space direction="vertical" style={{ width: "100%" }}>
                <Input
                    placeholder="Nhập nội dung câu hỏi"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
                <Table
                    dataSource={answers}
                    columns={columns}
                    pagination={false}
                    rowKey="id"
                    size="small"
                />
                <Button type="dashed" onClick={handleAddRow} style={{ width: "100%" }}>
                    + Thêm câu trả lời
                </Button>
            </Space>
        </Modal>
    );
}
