import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    Radio,
    Typography,
    Spin,
    message,
    Space,
    Button,
    Divider,
    Progress,
    Empty,
} from "antd";
import { AppLayout } from "../layout/AppLayout.jsx";
import { surveyApi } from "../../api/surveyApi/surveyApi.js";
import { useToken } from "../../hooks/useToken.js";
import axios from "axios";

const { Title, Text } = Typography;
const BASE_URL = "http://localhost:8080/api";

const postsurveyApi = {
    submitAnswers: (ids, token) => {
        return axios.post(
            `${BASE_URL}/survey-select`,
            { ids },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    },
};

const Survey = () => {
    const { token } = useToken();
    const [loading, setLoading] = useState(true);
    const [surveys, setSurveys] = useState([]);
    const [answers, setAnswers] = useState({});
    const [started, setStarted] = useState(false); // trạng thái bắt đầu khảo sát

    useEffect(() => {
        if (!started) return; // chỉ fetch khi người dùng đã bấm bắt đầu

        const fetchSurveys = async () => {
            if (!token) {
                message.error("Bạn cần đăng nhập để xem survey!");
                setLoading(false);
                return;
            }

            try {
                const res = await surveyApi.getAll(token);
                if (res.status === 200 && Array.isArray(res.data)) {
                    const detailed = await Promise.all(
                        res.data.map(async (q) => {
                            const detail = await surveyApi.getById(q.id, token);
                            return detail.status === 200 ? detail.data : q;
                        })
                    );
                    setSurveys(detailed);
                } else {
                    message.error(res.message || "Không thể lấy survey!");
                }
            } catch (err) {
                message.error("Đã xảy ra lỗi khi tải survey!");
            }
            setLoading(false);
        };

        fetchSurveys();
    }, [token, started]);

    const handleSelectOption = (questionId, optionId) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: optionId,
        }));
    };

    const total = surveys.length;
    const answeredCount = useMemo(
        () => Object.keys(answers).filter((k) => answers[k] != null).length,
        [answers]
    );
    const progress = total ? Math.round((answeredCount / total) * 100) : 0;
    const canSubmit = total > 0 && answeredCount === total;

    const handleSubmit = async () => {
        if (!canSubmit) {
            message.warning("Vui lòng trả lời hết tất cả câu hỏi!");
            return;
        }

        try {
            setLoading(true);
            const selectedIds = Object.values(answers);
            const res = await postsurveyApi.submitAnswers(selectedIds, token);
            if (res.status === 200) {
                message.success("Cảm ơn bạn đã hoàn thành khảo sát!");
                setAnswers({});
                setStarted(false); // trở lại màn hình hướng dẫn
            } else {
                message.error("Gửi khảo sát thất bại!");
            }
        } catch (err) {
            message.error("Có lỗi xảy ra khi gửi khảo sát!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout activeSidebar="survey">
            <div>
                <div style={{ maxWidth: 960, margin: "0 auto" }}>
                    {!started ? (
                        // MÀN HÌNH HƯỚNG DẪN
                        <Card
                            bordered={false}
                            style={{
                                borderRadius: 16,
                                boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                                textAlign: "center",
                                padding: "60px 24px",
                            }}
                        >
                            <Title level={2}>Chào mừng bạn đến với khảo sát</Title>
                            <Text type="secondary">
                                Hãy bắt đầu làm khảo sát để hệ thống có thể hiểu rõ hơn nhu cầu và
                                cải thiện chất lượng dịch vụ cho bạn.
                            </Text>
                            <div style={{ marginTop: 40 }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    shape="round"
                                    onClick={() => setStarted(true)}
                                    style={{ height: 48, fontWeight: 600, minWidth: 200 }}
                                >
                                    Bắt đầu khảo sát
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        // MÀN HÌNH LÀM KHẢO SÁT
                        <Card
                            bordered={false}
                            style={{ borderRadius: 16, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}
                            bodyStyle={{ padding: 28 }}
                        >
                            <Space direction="vertical" size={16} style={{ width: "100%" }}>
                                <div>
                                    <Title level={2} style={{ marginBottom: 8 }}>
                                        Khảo sát
                                    </Title>
                                    <Text type="secondary">
                                        Hãy chọn một đáp án cho mỗi câu hỏi. Thời gian hoàn thành ~ 2–3 phút.
                                    </Text>
                                </div>

                                <Divider style={{ margin: "12px 0 8px" }} />

                                {loading ? (
                                    <div className="flex justify-center py-10">
                                        <Spin tip="Đang tải câu hỏi..." size="large" />
                                    </div>
                                ) : total === 0 ? (
                                    <Empty description="Hiện chưa có câu hỏi nào." />
                                ) : (
                                    <>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ flex: 1 }}>
                                                <Progress percent={progress} status="active" />
                                            </div>
                                            <Text strong>
                                                {answeredCount}/{total} đã trả lời
                                            </Text>
                                        </div>

                                        <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                            {surveys.map((q, index) => (
                                                <Card
                                                    key={q.id}
                                                    hoverable
                                                    size="small"
                                                    style={{ borderRadius: 12 }}
                                                    bodyStyle={{ padding: "16px 20px" }}
                                                >
                                                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                                        <Text strong style={{ fontSize: 16 }}>
                                                            Câu hỏi {index + 1}: {q.questionContent}
                                                        </Text>

                                                        <Radio.Group
                                                            onChange={(e) => handleSelectOption(q.id, e.target.value)}
                                                            value={answers[q.id]}
                                                            style={{ width: "100%" }}
                                                        >
                                                            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                                                {(q.options || []).map((opt) => (
                                                                    <Radio
                                                                        key={opt.id}
                                                                        value={opt.id}
                                                                        style={{ display: "block", lineHeight: 1.6 }}
                                                                    >
                                                                        {opt.optionContent}
                                                                    </Radio>
                                                                ))}
                                                            </Space>
                                                        </Radio.Group>
                                                    </Space>
                                                </Card>
                                            ))}
                                        </Space>

                                        <Divider />

                                        <Button
                                            type="primary"
                                            size="large"
                                            block
                                            shape="round"
                                            onClick={handleSubmit}
                                            disabled={!canSubmit}
                                            style={{ height: 48, fontWeight: 600 }}
                                        >
                                            Gửi khảo sát
                                        </Button>
                                        {!canSubmit && (
                                            <Text
                                                type="secondary"
                                                style={{ display: "block", textAlign: "center", marginTop: 8 }}
                                            >
                                                Vui lòng trả lời tất cả câu hỏi trước khi gửi.
                                            </Text>
                                        )}
                                    </>
                                )}
                            </Space>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default Survey;
