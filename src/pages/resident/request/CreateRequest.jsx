import React, { useState, useEffect } from "react"; // Thêm useEffect
import { AppLayout } from "../../../components/layout/AppLayout.jsx";
import { Card, Typography, Form, Input, Select, Upload, Button, message } from "antd";
import { InboxOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../../hooks/useApi.js"; // Import useApi

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

export function CreateRequest() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    // Sử dụng hook useApi để gọi API
    const { post, isLoading, isSuccess, isError, error } = useApi();

    // Xử lý khi gửi form
    const handleSubmit = (values) => {
        // Chuẩn bị payload cho API
        // Ánh xạ tên trường từ form (type, description) sang DTO (requestType, content)
        const payload = {
            title: values.title, // Giả sử DTO cần cả title
            requestType: values.type,
            content: values.description,
            // semesterId: "UUID_CUA_HOC_KY" // Lưu ý: API có thể cần cả semesterId
        };

        // TODO: Xử lý logic upload file 'fileList' và đính kèm vào payload nếu cần
        console.log("Đang gửi payload:", payload);

        // Gọi API, endpoint lấy từ RequestController.java
        post("/request/create", payload);
    };

    // Theo dõi trạng thái gọi API
    useEffect(() => {
        if (isSuccess) {
            message.success("Yêu cầu đã được gửi thành công!");
            navigate("/my-requests");
        }
        if (isError) {
            message.error(error || "Gửi yêu cầu thất bại.");
        }
    }, [isSuccess, isError, error, navigate]);


    const uploadProps = {
        beforeUpload: (file) => {
            setFileList([...fileList, file]);
            return false; // Ngăn không cho upload tự động
        },
        onRemove: (file) => {
            setFileList(fileList.filter((f) => f.uid !== file.uid));
        },
        fileList,
        // Lưu ý: Logic upload file thực tế chưa được implement
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
                            name="type" // Sẽ được map sang 'requestType'
                            rules={[{ required: true, message: "Vui lòng chọn loại yêu cầu" }]}
                        >
                            <Select placeholder="Chọn loại yêu cầu">
                                <Option value="SuaChua">Sửa chữa</Option>
                                <Option value="ChuyenPhong">Chuyển phòng</Option>
                                <Option value="HoTro">Hỗ trợ</Option>
                                <Option value="Khac">Khác</Option>
                                {/* Lưu ý: value nên khớp với enum 'RequestTypeEnum' của backend */}
                            </Select>
                        </Form.Item>

                        {/* Nội dung chi tiết */}
                        <Form.Item
                            label="Mô tả chi tiết"
                            name="description" // Sẽ được map sang 'content'
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
                                    loading={isLoading} // Thêm trạng thái loading
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