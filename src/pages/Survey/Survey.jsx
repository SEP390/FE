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
import { AppLayout } from "../../components/layout/AppLayout.jsx";
import { surveyApi } from "../../api/surveyApi/surveyApi.js";
import { useToken } from "../../hooks/useToken.js";

const { Title, Text } = Typography;

const Survey = () => {
  const { token } = useToken();
  const [loading, setLoading] = useState(true);
  const [surveys, setSurveys] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
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
  }, [token]);

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

  const handleSubmit = () => {
    console.log("User answers:", answers);
    message.success("Cảm ơn bạn đã hoàn thành khảo sát!");
  };

  return (
    <AppLayout activeSidebar="survey">
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #F7F9FC 0%, #FFFFFF 60%)",
          padding: "40px 24px",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
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
                    <Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: 8 }}>
                      Vui lòng trả lời tất cả câu hỏi trước khi gửi.
                    </Text>
                  )}
                </>
              )}
            </Space>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};
export default Survey;