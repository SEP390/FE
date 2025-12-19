import { Form, App } from "antd";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ReportForm } from "../../../components/Report/ReportForm.jsx";
// Import LayoutGuard
import { LayoutGuard } from "../../../components/layout/LayoutGuard.jsx";

export function GuardCreateReport() {
    // Không cần useCollapsed hay Layout thủ công
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { message } = App.useApp();

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
            navigate("/guard/reports");
        } catch (err) {
            console.error("Error creating report:", err);
            console.error("Error response:", err.response?.data);
            message.error(err.response?.data?.message || "Tạo báo cáo thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LayoutGuard active="guard-reports" header="Tạo báo cáo (Bảo vệ)">
            {/* Container màu trắng bao bọc Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <ReportForm
                    onSubmit={onFinish}
                    loading={loading}
                    form={form}
                />
            </div>
        </LayoutGuard>
    );
}