import React, { useEffect, useState, useMemo } from "react";
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

    getSelectedAnswers: (token) => {
        return axios.get(`${BASE_URL}/survey-select/answer-selected`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
};

const Survey = () => {
    const { token } = useToken();

    const [loading, setLoading] = useState(false);
    const [surveys, setSurveys] = useState([]);
    const [answers, setAnswers] = useState({});
    const [started, setStarted] = useState(false);

    const [hasDoneSurvey, setHasDoneSurvey] = useState(false);
    const [loadedInitialCheck, setLoadedInitialCheck] = useState(false);

    // ---------------------- CHECK STATUS (ĐÃ LÀM CHƯA) ----------------------
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await postsurveyApi.getSelectedAnswers(token);

                if (res.status === 200 && Array.isArray(res.data.data)) {
                    setHasDoneSurvey(true);
                }
            } catch (err) {
                setHasDoneSurvey(false);
            }

            setLoadedInitialCheck(true);
        };

        if (token) checkStatus();
    }, [token]);

    // ---------------------- LOAD SURVEY + ANSWERS WHEN STARTED ----------------------
    useEffect(() => {
        if (!started) return;

        const loadSurveyData = async () => {
            setLoading(true);

            try {
                const questionRes = await surveyApi.getAll(token);
                let surveyList = [];

                if (questionRes.status === 200 && Array.isArray(questionRes.data)) {
                    surveyList = await Promise.all(
                        questionRes.data.map(async (q) => {
                            const detail = await surveyApi.getById(q.id, token);
                            return detail.status === 200 ? detail.data : q;
                        })
                    );
                }

                setSurveys(surveyList);

                // Load selected answers to pre-fill
                try {
                    const selectedRes = await postsurveyApi.getSelectedAnswers(token);

                    if (selectedRes.status === 200 && Array.isArray(selectedRes.data.data)) {
                        const saved = {};
                        selectedRes.data.data.forEach((item) => {
                            saved[item.questionId] = item.optionSelectedId;
                        });

                        setAnswers(saved);
                    }
                } catch (err) {
                    // Chưa làm khảo sát → không có dữ liệu
                }
            } catch (err) {
                message.error("Lỗi khi tải khảo sát!");
            }

            setLoading(false);
        };

        loadSurveyData();
    }, [started, token]);

    // ---------------------- HANDLE SELECT ----------------------
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

    // ---------------------- SUBMIT SURVEY ----------------------
    const handleSubmit = async () => {
        if (!canSubmit) {
            message.warning("Vui lòng trả lời đầy đủ tất cả câu hỏi!");
            return;
        }

        try {
            setLoading(true);
            const selectedIds = Object.values(answers);
            const res = await postsurveyApi.submitAnswers(selectedIds, token);

            if (res.status === 200) {
                message.success("Khảo sát đã được lưu!");
                setAnswers({});
                setStarted(false);
            } else {
                message.error("Không thể gửi khảo sát!");
            }
        } catch (err) {
            message.error("Có lỗi khi gửi khảo sát!");
        } finally {
            setLoading(false);
        }
    };

    // ---------------------- UI ----------------------
    return (
        <AppLayout activeSidebar="survey">
            <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
                {!started ? (
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 16,
                            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                            width: "100%",
                        }}
                        bodyStyle={{ padding: "32px 40px" }}
                    >
                    <Title level={2}>Khảo sát của bạn</Title>

                        {!loadedInitialCheck ? (
                            <Text>Đang kiểm tra trạng thái khảo sát...</Text>
                        ) : hasDoneSurvey ? (
                            <>
                                <Text type="secondary">
                                    Bạn đã hoàn thành khảo sát.
                                    Bấm vào nút bên dưới để chỉnh sửa.
                                </Text>

                                <div style={{ marginTop: 40 }}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        shape="round"
                                        onClick={() => setStarted(true)}
                                        style={{ height: 48, fontWeight: 600, minWidth: 220 }}
                                    >
                                        Chỉnh sửa khảo sát
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Text type="secondary">
                                    Hãy bắt đầu khảo sát để hệ thống hiểu rõ hơn nhu cầu của bạn.
                                </Text>

                                <div style={{ marginTop: 40 }}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        shape="round"
                                        onClick={() => setStarted(true)}
                                        style={{ height: 48, fontWeight: 600, minWidth: 220 }}
                                    >
                                        Bắt đầu khảo sát
                                    </Button>
                                </div>
                            </>
                        )}
                    </Card>
                ) : (
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 16,
                            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                            width: "100%",
                        }}
                        bodyStyle={{ padding: "32px 40px" }}
                    >
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                            <Title level={2}>Khảo sát</Title>
                            <Text type="secondary">
                                Vui lòng chọn một đáp án cho mỗi câu hỏi.
                            </Text>

                            <Divider />

                            {loading ? (
                                <div style={{ textAlign: "center", padding: 20 }}>
                                    <Spin size="large" tip="Đang tải câu hỏi..." />
                                </div>
                            ) : total === 0 ? (
                                <Empty description="Không có câu hỏi" />
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

                                    <Space
                                        direction="vertical"
                                        size="large"
                                        style={{ width: "100%" }}
                                    >
                                        {surveys.map((q, index) => (
                                            <Card
                                                key={q.id}
                                                hoverable
                                                size="small"
                                                style={{
                                                    borderRadius: 12,
                                                    width: "100%",
                                                }}
                                                bodyStyle={{ padding: "22px 26px" }}
                                            >
                                            <Space
                                                    direction="vertical"
                                                    size="middle"
                                                    style={{ width: "100%" }}
                                                >
                                                    <Text strong style={{ fontSize: 16 }}>
                                                        Câu {index + 1}: {q.questionContent}
                                                    </Text>

                                                    <Radio.Group
                                                        onChange={(e) =>
                                                            handleSelectOption(q.id, e.target.value)
                                                        }
                                                        value={answers[q.id]}
                                                        style={{ width: "100%" }}
                                                    >
                                                        <Space
                                                            direction="vertical"
                                                            size="middle"
                                                            style={{ width: "100%" }}
                                                        >
                                                            {(q.options || []).map((opt) => (
                                                                <Radio
                                                                    key={opt.id}
                                                                    value={opt.id}
                                                                    style={{
                                                                        display: "block",
                                                                        lineHeight: 1.6,
                                                                    }}
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
                                        Lưu khảo sát
                                    </Button>

                                    {!canSubmit && (
                                        <Text
                                            type="secondary"
                                            style={{
                                                textAlign: "center",
                                                marginTop: 8,
                                                display: "block",
                                            }}
                                        >
                                            Vui lòng trả lời tất cả câu hỏi.
                                        </Text>
                                    )}
                                </>
                            )}
                        </Space>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
};

export default Survey;
