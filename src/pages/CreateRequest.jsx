import React, { useState } from "react";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import { Card, Typography, Form, Input, Select, Upload, Button, message } from "antd";
import { InboxOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

export function CreateRequest() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    const handleSubmit = (values) => {
        console.log("Dữ liệu yêu cầu:", values);
        message.success("Yêu cầu đã được gửi thành công!");
        navigate("/my-requests");
    };

    const uploadProps = {
        beforeUpload: (file) => {
            setFileList([...fileList, file]);
            return false; // Ngăn không cho upload tự động
        },
        onRemove: (file) => {
            setFileList(fileList.filter((f) => f.uid !== file.uid));
        },
        fileList,
    };

    return (
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
                        {/* Tiêu đề */}
                        <Form.Item
                            label="Tiêu đề yêu cầu"
                            name="title"
                            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                        >
                            <Input placeholder="Ví dụ: Sửa điều hòa phòng 203" />
                        </Form.Item>

                        {/* Loại yêu cầu */}
                        <Form.Item
                            label="Loại yêu cầu"
                            name="type"
                            rules={[{ required: true, message: "Vui lòng chọn loại yêu cầu" }]}
                        >
                            <Select placeholder="Chọn loại yêu cầu">
                                <Option value="Sửa chữa">Sửa chữa</Option>
                                <Option value="Chuyển phòng">Chuyển phòng</Option>
                                <Option value="Hỗ trợ">Hỗ trợ</Option>
                                <Option value="Khác">Khác</Option>
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

                        {/* Upload hình ảnh minh họa */}
                        <Form.Item label="Ảnh minh họa (tùy chọn)">
                            <Dragger {...uploadProps}>
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Kéo thả hoặc nhấn để tải ảnh lên</p>
                                <p className="ant-upload-hint">
                                    Hỗ trợ định dạng PNG, JPG (tối đa 5MB)
                                </p>
                            </Dragger>
                        </Form.Item>

                        {/* Nút gửi */}
                        <Form.Item>
                            <div className="flex justify-end mt-4">
                                <Button
                                    type="primary"
                                    htmlType="submit"
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
    );
}
