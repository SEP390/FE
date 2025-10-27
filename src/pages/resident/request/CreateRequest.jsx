import React, { useEffect, useState } from "react";
import { AppLayout } from "../../../components/layout/AppLayout.jsx";
import { Card, Form, Input, Select, Button, message, Spin, Alert, DatePicker } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../hooks/useApi.js";
import { useSemester } from "../../../hooks/useSemester.js";
import { PerformanceMonitor } from "../../../components/debug/PerformanceMonitor.jsx";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

export function CreateRequest() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [requestType, setRequestType] = useState(null);

    const { post, data, isSuccess, isError, error } = useApi();
    const { currentSemester, loading: semesterLoading, error: semesterError } = useSemester();

    const handleSubmit = (values) => {
        if (!currentSemester) {
            message.error("Không tìm thấy học kỳ hiện tại");
            return;
        }

        const payload = {
            requestType: values.type,
            content: values.description,
            semesterId: currentSemester.id,
        };

        // 🔥 FIX: Nếu là checkout request và có ngày checkout
        if (values.type === "CHECKOUT" && values.checkoutDate) {
            // Format ngày checkout
            const checkoutTimeStr = values.checkoutDate.format("DD/MM/YYYY");
            // Tạo content mới với format: thời gian checkout, dòng trống, content user nhập
            payload.content = `Ngày muốn check out: ${checkoutTimeStr}\n\n${values.description}`;
        }

        console.log("Đang gửi payload:", payload);

        setLoading(true);
        post("/requests", payload);
    };

    useEffect(() => {
        if (isSuccess && data) {
            setLoading(false);
            message.success("Yêu cầu đã được gửi thành công!");
            navigate("/my-requests");
        }
    }, [isSuccess, data, navigate]);

    useEffect(() => {
        if (isError) {
            setLoading(false);
            message.error(error || "Gửi yêu cầu thất bại.");
        }
    }, [isError, error]);

    // 🔥 Khi thay đổi loại request, reset checkoutDate nếu không phải CHECKOUT
    const handleRequestTypeChange = (value) => {
        setRequestType(value);
        if (value !== "CHECKOUT") {
            form.setFieldsValue({ checkoutDate: null });
        }
    };

    return (
        <>
            <PerformanceMonitor componentName="CreateRequest" />
            <AppLayout>
                <div className="p-4 flex justify-center">
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <Button
                                    type="link"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate("/my-requests")}
                                    className="text-white hover:text-gray-200"
                                >
                                    Quay lại
                                </Button>
                                <span className="text-white">Gửi yêu cầu mới</span>
                            </div>
                        }
                        headStyle={{ background: "#004aad" }}
                        className="w-full lg:w-2/3"
                    >
                        {semesterLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Spin size="large" tip="Đang tải thông tin học kỳ..." />
                            </div>
                        ) : semesterError ? (
                            <Alert
                                message="Lỗi"
                                description={semesterError}
                                type="error"
                                showIcon
                                className="mb-4"
                            />
                        ) : (
                            <>
                                {currentSemester && (
                                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="text-sm text-gray-600">Học kỳ hiện tại:</div>
                                        <div className="font-semibold text-blue-700">{currentSemester.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {new Date(currentSemester.startDate).toLocaleDateString('vi-VN')} - {new Date(currentSemester.endDate).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                )}

                                <Spin spinning={loading}>
                                    <Form
                                        layout="vertical"
                                        form={form}
                                        onFinish={handleSubmit}
                                        autoComplete="off"
                                    >
                                        <Form.Item
                                            label="Loại yêu cầu"
                                            name="type"
                                            rules={[{ required: true, message: "Vui lòng chọn loại yêu cầu" }]}
                                        >
                                            <Select
                                                placeholder="Chọn loại yêu cầu"
                                                onChange={handleRequestTypeChange}
                                            >
                                                <Option value="CHECKOUT">Checkout khỏi phòng</Option>
                                                <Option value="METER_READING_DISCREPANCY">Kiểm tra sai số điện/nước</Option>
                                                <Option value="SECURITY_INCIDENT">Sự cố an ninh</Option>
                                                <Option value="TECHNICAL_ISSUE">Sự cố kỹ thuật</Option>
                                                <Option value="POLICY_VIOLATION_REPORT">Báo cáo vi phạm quy định</Option>
                                                <Option value="OTHER">Khác</Option>
                                            </Select>
                                        </Form.Item>

                                        {/* Trường nhập ngày checkout - chỉ hiển thị khi chọn CHECKOUT */}
                                        {requestType === "CHECKOUT" && (
                                            <Form.Item
                                                label="Ngày checkout dự kiến"
                                                name="checkoutDate"
                                                rules={[
                                                    { required: true, message: "Vui lòng chọn ngày checkout dự kiến" }
                                                ]}
                                                extra="Chọn ngày bạn muốn checkout khỏi phòng"
                                            >
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    placeholder="Chọn ngày checkout"
                                                    format="DD/MM/YYYY"
                                                    disabledDate={(current) => {
                                                        // Không cho chọn ngày trong quá khứ
                                                        return current && current < dayjs().startOf('day');
                                                    }}
                                                />
                                            </Form.Item>
                                        )}

                                        <Form.Item
                                            label="Mô tả chi tiết"
                                            name="description"
                                            rules={[{ required: true, message: "Vui lòng nhập nội dung yêu cầu" }]}
                                        >
                                            <TextArea rows={5} placeholder="Nhập mô tả chi tiết yêu cầu của bạn..." />
                                        </Form.Item>

                                        <Form.Item>
                                            <div className="flex justify-end mt-4">
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    disabled={loading || !currentSemester}
                                                    style={{ backgroundColor: "#004aad" }}
                                                >
                                                    Gửi yêu cầu
                                                </Button>
                                            </div>
                                        </Form.Item>
                                    </Form>
                                </Spin>
                            </>
                        )}
                    </Card>
                </div>
            </AppLayout>
        </>
    );
}