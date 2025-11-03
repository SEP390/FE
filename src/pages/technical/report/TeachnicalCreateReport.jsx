import React, {useState} from "react";
import { Button, Card, Form, Input, Typography, Layout } from "antd";
import { SideBarTechnical } from "../../../components/layout/SideBarTechnical.jsx";
import { AppHeader } from "../../../components/layout/AppHeader.jsx";

const { Title } = Typography;
const { Content } = Layout;



export function TeachnicalCreateReport() {
    const [form] = Form.useForm();
    const onSubmit = () => {};
    return (
        <Layout style={{ minHeight: "100vh" }}>
            <SideBarTechnical active="technical-create-report" />
            <Layout>
                <AppHeader />
                <Content>
                    <div className="p-4">
                        <Title level={3} style={{ marginBottom: 16 }}>Tạo báo cáo kỹ thuật</Title>
                        <Card>
                            <Form layout="vertical" form={form} onFinish={onSubmit}>
                                <Form.Item label="Tiêu đề" name="title" rules={[{ required: true, message: "Nhập tiêu đề" }]}>
                                    <Input placeholder="Nhập tiêu đề báo cáo" />
                                </Form.Item>
                                <Form.Item label="Nội dung" name="content" rules={[{ required: true, message: "Nhập nội dung" }]}>
                                    <Input.TextArea rows={6} placeholder="Mô tả sự cố, phương án xử lý..." />
                                </Form.Item>
                                <Button type="primary" htmlType="submit">Lưu báo cáo</Button>
                            </Form>
                        </Card>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default TeachnicalCreateReport;


