import { Form, Input, Button, Select } from "antd";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export function ReportForm({ onSubmit, loading, form }) {
    const [residents, setResidents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loadingResidents, setLoadingResidents] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const navigate = useNavigate();


    const reportType = Form.useWatch("reportType", form);

    useEffect(() => {
        fetchResidents();
        fetchRooms();
    }, []);

    const fetchResidents = async () => {
        try {
            setLoadingResidents(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(
                "http://localhost:8080/api/users/residents",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const validResidents = (res.data.data || []).filter(
                (r) => r.residentId != null
            );
            setResidents(validResidents);
        } catch (e) {
            console.error("Lỗi tải cư dân", e);
        } finally {
            setLoadingResidents(false);
        }
    };

    const fetchRooms = async () => {
        try {
            setLoadingRooms(true);
            const token = localStorage.getItem("token");
            const res = await axios.get(
                "http://localhost:8080/api/rooms?page=0&size=1000",
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const validRooms = (res.data.data?.content || []).filter(
                (r) => r.id != null
            );
            setRooms(validRooms);
        } catch (e) {
            console.error("Lỗi tải phòng", e);
        } finally {
            setLoadingRooms(false);
        }
    };

    const filterResidentOption = (input, option) =>
        option.children
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase());

    const filterRoomOption = (input, option) =>
        option.children
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase());

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            style={{ maxWidth: 600, margin: "0 auto" }}
        >
            <Form.Item
                label="Loại báo cáo"
                name="reportType"
                rules={[{ required: true, message: "Vui lòng chọn loại báo cáo" }]}
            >
                <Select placeholder="Chọn loại báo cáo">
                    <Select.Option value="VIOLATION">Báo cáo vi phạm</Select.Option>
                    <Select.Option value="MAINTENANCE_REQUEST">Yêu cầu bảo trì</Select.Option>
                    <Select.Option value="OTHER">Khác</Select.Option>
                </Select>
            </Form.Item>

            {reportType === "VIOLATION" && (
                <>
                    <Form.Item
                        label="Cư dân"
                        name="residentId"
                        rules={[{ required: true, message: "Vui lòng chọn cư dân" }]}
                    >
                        <Select
                            placeholder="Chọn cư dân"
                            showSearch
                            loading={loadingResidents}
                            filterOption={filterResidentOption}
                        >
                            {residents.map((r) => (
                                <Select.Option
                                    key={r.residentId}
                                    value={r.residentId}
                                >
                                    {r.fullName || r.userName} ({r.email})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Phòng"
                        name="roomId"
                        rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
                    >
                        <Select
                            placeholder="Chọn phòng"
                            showSearch
                            loading={loadingRooms}
                            filterOption={filterRoomOption}
                        >
                            {rooms.map((room) => (
                                <Select.Option
                                    key={room.id}
                                    value={room.id}
                                >
                                    Phòng {room.roomNumber} - Tầng {room.floor} (
                                    {room.dorm?.dormName})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </>
            )}

            <Form.Item
                label="Nội dung báo cáo"
                name="content"
                rules={[{ required: true, message: "Vui lòng nhập nội dung báo cáo" }]}
            >
                <Input.TextArea rows={6} placeholder="Nhập nội dung báo cáo..." />
            </Form.Item>

            <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                >

                    Gửi báo cáo
                </Button>
                <Button
                    type="default"
                    onClick={() => navigate(-1)}
                    style={{ marginTop: 8 }}
                    block
                >
                    Hủy
                </Button>

            </Form.Item>
        </Form>
    );
}
