import React, { useEffect } from "react";
import { AppLayout } from "../../../components/layout/AppLayout.jsx";
import { Card, Form, Input, Select, Button, message, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../hooks/useApi.js";

const { Option } = Select;
const { TextArea } = Input;

export function CreateRequest() {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const { post, data, isComplete, isSuccess, isError, error } = useApi();

    const handleSubmit = (values) => {
        const payload = {
            requestType: values.type,
            content: values.description,
        };

        console.log("Đang gửi payload:", payload);
        post("/request/create", payload);
    };

    useEffect(() => {
        if (isSuccess && data) {
            message.success("Yêu cầu đã được gửi thành công!");
            navigate("/my-requests");
        }
    }, [isSuccess, data, navigate]);

    useEffect(() => {
        if (isError) {
            message.error(error || "Gửi yêu cầu thất bại.");
        }
    }, [isError, error]);

    return (
        <Spin spinning={!isComplete}>
            <AppLayout>
                <div className="p-4 flex justify-center">
                    <Card
                        title={
                            <div className="flex items-center gap-2">
                                <Button
                                    type="link"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => navigate("/my-requests")}
                                >
                                    Quay lại
                                </Button>
                                <span style={{ color: "white" }}>Gửi yêu cầu mới</span>
                            </div>
                        }
                        headStyle={{ background: "#004aad" }}
                        className="w-full lg:w-2/3"
                    >
                        <Form
                            layout="vertical"
                            form={form}
                            onFinish={handleSubmit}
                            autoComplete="off"
                        >
                            {/* Loại yêu cầu */}
                            <Form.Item
                                label="Loại yêu cầu"
                                name="type"
                                rules={[{ required: true, message: "Vui lòng chọn loại yêu cầu" }]}
                            >
                                <Select placeholder="Chọn loại yêu cầu">
                                    <Option value="SuaChua">Sửa chữa</Option>
                                    <Option value="ChuyenPhong">Chuyển phòng</Option>
                                    <Option value="HoTro">Hỗ trợ</Option>
                                    <Option value="Khac">Khác</Option>
                                </Select>
                            </Form.Item>

                            {/* Nội dung chi tiết */}
                            <Form.Item
                                label="Mô tả chi tiết"
                                name="description"
                                rules={[{ required: true, message: "Vui lòng nhập nội dung yêu cầu" }]}
                            >
                                <TextArea rows={5} placeholder="Nhập mô tả chi tiết yêu cầu của bạn..." />
                            </Form.Item>

                            {/* Nút gửi */}
                            <Form.Item>
                                <div className="flex justify-end mt-4">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        disabled={!isComplete}
                                        style={{ backgroundColor: "#004aad" }}
                                    >
                                        Gửi yêu cầu
                                    </Button>
                                </div>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </AppLayout>
        </Spin>
    );
}