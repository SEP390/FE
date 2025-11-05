import { Modal, Form, Input, DatePicker, Select, message } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

export function HolidayModal({ open, onCancel, onSuccess, editingHoliday }) {
    const [form] = Form.useForm();
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(false);

    // Gọi API lấy danh sách semester
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/semesters?page=0&size=50", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const result = await res.json();
                if (result.status === 200 || result.content) {
                    const data = result.data?.content || result.data || [];
                    setSemesters(data);
                }
            } catch {
                message.error("Không thể tải danh sách học kỳ");
            }
        };
        fetchSemesters();
    }, []);

    useEffect(() => {
        if (editingHoliday) {
            form.setFieldsValue({
                holidayName: editingHoliday.holidayName,
                startDate: dayjs(editingHoliday.startDate),
                endDate: dayjs(editingHoliday.endDate),
                semesterId: editingHoliday.semesterId,
            });
        } else {
            form.resetFields();
        }
    }, [editingHoliday, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const body = {
                holidayName: values.holidayName,
                startDate: values.startDate.format("YYYY-MM-DD"),
                endDate: values.endDate.format("YYYY-MM-DD"),
                semesterId: values.semesterId,
            };

            setLoading(true);
            const url = editingHoliday
                ? `http://localhost:8080/api/holidays/${editingHoliday.holidayId}`
                : "http://localhost:8080/api/holidays";
            const method = editingHoliday ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            console.log("Holiday API result:", result);
            if (result.status === 200 || result.status === 201 || result.success) {
                message.success(editingHoliday ? "Cập nhật thành công" : "Thêm mới thành công");
                onSuccess();
            } else message.error(result.message || "Thao tác thất bại");
        } catch {
            message.error("Vui lòng kiểm tra dữ liệu nhập");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={editingHoliday ? "Chỉnh sửa kỳ nghỉ" : "Thêm kỳ nghỉ mới"}
            open={open}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Tên kỳ nghỉ"
                    name="holidayName"
                    rules={[{ required: true, message: "Vui lòng nhập tên kỳ nghỉ" }]}
                >
                    <Input placeholder="Nhập tên kỳ nghỉ" />
                </Form.Item>

                <Form.Item
                    label="Ngày bắt đầu"
                    name="startDate"
                    rules={[{ required: true, message: "Chọn ngày bắt đầu" }]}
                >
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    label="Ngày kết thúc"
                    name="endDate"
                    rules={[{ required: true, message: "Chọn ngày kết thúc" }]}
                >
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                    label="Học kỳ"
                    name="semesterId"
                    rules={[{ required: true, message: "Vui lòng chọn học kỳ" }]}
                >
                    <Select
                        placeholder="Chọn học kỳ"
                        options={semesters.map((s) => ({
                            label: s.semesterName || s.name || "Unnamed semester",
                            value: s.semesterId || s.id,
                        }))}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
