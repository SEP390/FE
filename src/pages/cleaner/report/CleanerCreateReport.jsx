import {Layout, Form, Input, Button, message, Select} from "antd";
import {SideBarCleaner} from "../../../components/layout/SideBarCleaner.jsx";
import {AppHeader} from "../../../components/layout/AppHeader.jsx";
import React, {useState} from "react";
import axios from "axios";

export function CleanerCreateReport() {
    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const toggleSideBar = () => setCollapsed(!collapsed);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:8080/api/reports",
                {
                    content: values.content,
                    createAt: new Date().toISOString(),
                    reportType: values.reportType
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            message.success("Tạo báo cáo thành công!");
            form.resetFields();
        } catch (err) {
            console.error(err);
            message.error("Tạo báo cáo thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{minHeight: "100vh"}}>
            <SideBarCleaner collapsed={collapsed} active="cleaner-reports"/>
            <Layout>
                <AppHeader toggleSideBar={toggleSideBar}/>
                <Layout.Content style={{margin: "24px 16px", padding: 24, background: "#fff"}}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        style={{maxWidth: 600, margin: "0 auto"}}
                    >
                        <Form.Item
                            label="Loại báo cáo"
                            name="reportType"
                            rules={[{required: true, message: "Vui lòng chọn loại báo cáo"}]}
                        >
                            <Select placeholder="Chọn loại báo cáo">
                                <Select.Option value="VIOLATION">Vi phạm nội quy</Select.Option>
                                <Select.Option value="MAINTENANCE_REQUEST">Yêu cầu bảo trì</Select.Option>
                                <Select.Option value="SECURITY_ISSUE">Vấn đề an ninh</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Nội dung báo cáo"
                            name="content"
                            rules={[{required: true, message: "Vui lòng nhập nội dung báo cáo"}]}
                        >
                            <Input.TextArea rows={6} placeholder="Nhập nội dung báo cáo..." />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Gửi báo cáo
                            </Button>
                        </Form.Item>
                    </Form>
                </Layout.Content>
            </Layout>
        </Layout>
    );
}
