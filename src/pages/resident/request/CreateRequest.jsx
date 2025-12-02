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
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const { post, data, isSuccess, isError, error, errorData, isLoading } = useApi();
    const { currentSemester, loading: semesterLoading, error: semesterError } = useSemester();

    // 🔥 Tính toán ngày checkout tối đa (trước khi hết kỳ 3 ngày)
    const getMaxCheckoutDate = () => {
        if (!currentSemester || !currentSemester.endDate) return null;
        return dayjs(currentSemester.endDate).subtract(3, 'day');
    };

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
            const checkoutTimeStr = values.checkoutDate.format("DD/MM/YYYY");
            payload.content = `Ngày muốn check out: ${checkoutTimeStr}\n\n${values.description}`;
        }

        console.log("Đang gửi payload:", payload);

        setHasSubmitted(true);
        setLoading(true);
        post("/requests", payload);
    };

    // 🔥 FIX: Xử lý response - vì axiosClient đã strip status, chỉ cần check có data là success
    useEffect(() => {
        console.log("🔍 Effect triggered:", { hasSubmitted, isLoading, data, errorData, isError, error });

        if (!hasSubmitted || isLoading) return;

        // Nếu có data hoặc errorData => request đã hoàn thành
        const responseData = data || errorData;

        if (responseData && !isError) {
            console.log("✅ Data received after submit:", responseData);

            // Navigate với state để hiện message ở trang đích
            navigate("/my-requests", {
                state: { showSuccessMessage: true }
            });

            // Reset state sau khi navigate
            setLoading(false);
            setHasSubmitted(false);
        } else if (isError) {
            // Error - có thể có hoặc không có errorData
            console.log("❌ Error:", error, errorData);
            setLoading(false);
            setHasSubmitted(false);
            message.error(error || "Gửi yêu cầu thất bại.");
        }
    }, [hasSubmitted, isLoading, data, errorData, isError, error, navigate]);

    // 🔥 Khi thay đổi loại request, reset checkoutDate nếu không phải CHECKOUT
    const handleRequestTypeChange = (value) => {
        setRequestType(value);
        if (value !== "CHECKOUT") {
            form.setFieldsValue({ checkoutDate: null });
        }
    };

    // 🔥 Kiểm tra ngày có hợp lệ không (không quá khứ và không quá ngày kết thúc kỳ - 3 ngày)
    const disabledCheckoutDate = (current) => {
        if (!current) return false;

        const today = dayjs().startOf('day');
        const maxDate = getMaxCheckoutDate();

        // Không cho chọn ngày trong quá khứ
        if (current < today) {
            return true;
        }

        // Không cho chọn ngày sau (endDate - 3 ngày)
        if (maxDate && current > maxDate) {
            return true;
        }

        return false;
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
                        styles={{ header: { background: "#004aad" } }}
                        className="w-full lg:w-2/3"
                    >
                        {semesterLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Spin size="large" />
                                <span className="ml-2">Đang tải thông tin học kỳ...</span>
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
                                                <Option value="CHANGEROOM">Đổi phòng</Option>
                                                <Option value="ANONYMOUS">Báo cáo ẩn danh</Option>
                                                <Option value="OTHER">Khác</Option>
                                            </Select>
                                        </Form.Item>

                                        {/* 🔥 Trường nhập ngày checkout - chỉ hiển thị khi chọn CHECKOUT */}
                                        {requestType === "CHECKOUT" && (
                                            <>
                                                <Form.Item
                                                    label="Ngày checkout dự kiến"
                                                    name="checkoutDate"
                                                    rules={[
                                                        { required: true, message: "Vui lòng chọn ngày checkout dự kiến" }
                                                    ]}
                                                    extra={
                                                        <div className="text-xs mt-1">
                                                            <div>Bạn chỉ được checkout từ hôm nay đến trước khi kết thúc kỳ 3 ngày</div>
                                                            {currentSemester && currentSemester.endDate && (
                                                                <div className="text-orange-600 font-medium mt-1">
                                                                    📅 Ngày checkout muộn nhất: {getMaxCheckoutDate()?.format('DD/MM/YYYY')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    }
                                                >
                                                    <DatePicker
                                                        style={{ width: '100%' }}
                                                        placeholder="Chọn ngày checkout"
                                                        format="DD/MM/YYYY"
                                                        disabledDate={disabledCheckoutDate}
                                                    />
                                                </Form.Item>

                                                {/* 🔥 Cảnh báo nếu học kỳ sắp kết thúc */}
                                                {currentSemester && currentSemester.endDate &&
                                                    dayjs(currentSemester.endDate).diff(dayjs(), 'day') <= 10 && (
                                                        <Alert
                                                            message="Lưu ý"
                                                            description={`Học kỳ sẽ kết thúc vào ${dayjs(currentSemester.endDate).format('DD/MM/YYYY')}. Vui lòng đảm bảo chọn ngày checkout trước ${getMaxCheckoutDate()?.format('DD/MM/YYYY')}`}
                                                            type="warning"
                                                            showIcon
                                                            className="mb-4"
                                                        />
                                                    )}
                                            </>
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