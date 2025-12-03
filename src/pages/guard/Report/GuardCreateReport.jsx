import {Layout, Form, Input, Button, message, Select, App} from "antd";
import {GuardSidebar} from "../../../components/layout/GuardSidebar.jsx";
import {AppHeader} from "../../../components/layout/AppHeader.jsx";
import React, {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import { useCollapsed } from "../../../hooks/useCollapsed.js";

export function GuardCreateReport() {
    // use shared collapsed
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { message } = App.useApp();

    const toggleSideBar = () => setCollapsed(prev => !prev);

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
            navigate("/guard/reports");
        } catch (err) {
            console.error(err);
            message.error("Tạo báo cáo thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{minHeight: "100vh"}}>
            <GuardSidebar collapsed={collapsed} active="guard-reports"/>
            <Layout
                style={{
                    marginLeft: collapsed ? 80 : 260,
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <AppHeader toggleSideBar={toggleSideBar} collapsed={collapsed} header={"Tạo báo cáo (Bảo vệ)"} />
                <Layout.Content style={{margin: "24px 16px", padding: 24, background: "#fff", marginTop: 64}}>
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
