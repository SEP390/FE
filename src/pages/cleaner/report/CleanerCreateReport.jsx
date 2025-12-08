import { Layout, Form, App } from "antd";
import { AppHeader } from "../../../components/layout/AppHeader.jsx";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCollapsed } from "../../../hooks/useCollapsed.js";
import { ReportForm } from "../../../components/Report/ReportForm.jsx";
import {SideBarCleaner} from "../../../components/layout/SideBarCleaner.jsx";

export function CleanerCreateReport() {
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { message } = App.useApp();

    const toggleSideBar = () => setCollapsed(prev => !prev);

    const onFinish = async (values) => {
        console.log("Form values:", values);
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const payload = {
                content: values.content,
                residentId: values.residentId,
                roomId: values.roomId,
                createAt: new Date().toISOString(),
                reportType: values.reportType
            };

            console.log("Sending payload:", payload);

            const response = await axios.post(
                "http://localhost:8080/api/reports",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            console.log("Response:", response.data);
            message.success("Tạo báo cáo thành công!");
            form.resetFields();
            navigate("/cleaner/reports");
        } catch (err) {
            console.error("Error creating report:", err);
            console.error("Error response:", err.response?.data);
            message.error(err.response?.data?.message || "Tạo báo cáo thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <SideBarCleaner collapsed={collapsed} active="cleaner-reports" />
            <Layout
                style={{
                    marginLeft: collapsed ? 80 : 260,
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <AppHeader
                    toggleSideBar={toggleSideBar}
                    collapsed={collapsed}
                    header="Tạo báo cáo (Nhân viên vệ sinh)"
                />
                <Layout.Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        background: "#fff",
                        marginTop: 64
                    }}
                >
                    <ReportForm
                        onSubmit={onFinish}
                        loading={loading}
                        form={form}
                    />
                </Layout.Content>
            </Layout>
        </Layout>
    );
}