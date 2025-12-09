import { Form, Input, Button, Select } from "antd";
import React, { useState, useEffect } from "react";
import axios from "axios";

export function ReportForm({ onSubmit, loading, form }) {
    const [residents, setResidents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const reportType = Form.useWatch("reportType", form);
    const [loadingResidents, setLoadingResidents] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);

    useEffect(() => {
        fetchResidents();
        fetchRooms();
    }, []);

    const fetchResidents = async () => {
        try {
            setLoadingResidents(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(
                "http://localhost:8080/api/users/residents",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            // Filter out residents with null residentId
            const validResidents = (response.data.data || []).filter(r => r.residentId != null);
            setResidents(validResidents);
        } catch (err) {
            console.error("Lỗi khi tải danh sách cư dân:", err);
        } finally {
            setLoadingResidents(false);
        }
    };

    const fetchRooms = async () => {
        try {
            setLoadingRooms(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(
                "http://localhost:8080/api/rooms?page=0&size=1000",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            // Filter out rooms with null id
            const validRooms = (response.data.data?.content || []).filter(r => r.id != null);
            setRooms(validRooms);
        } catch (err) {
            console.error("Lỗi khi tải danh sách phòng:", err);
        } finally {
            setLoadingRooms(false);
        }
    };

    const filterResidentOption = (input, option) => {
        const searchText = input.toLowerCase();
        const resident = residents.find(r => r.residentId === option.value);
        if (!resident) return false;

        const fullName = (resident.fullName || "").toLowerCase();
        const userName = (resident.userName || "").toLowerCase();
        const email = (resident.email || "").toLowerCase();

        return fullName.includes(searchText) ||
            userName.includes(searchText) ||
            email.includes(searchText);
    };

    const filterRoomOption = (input, option) => {
        const searchText = input.toLowerCase();
        const room = rooms.find(r => r.id === option.value);
        if (!room) return false;

        const roomNumber = String(room.roomNumber || "").toLowerCase();
        const floor = String(room.floor || "").toLowerCase();
        const dormName = (room.dormName || "").toLowerCase();

        return roomNumber.includes(searchText) ||
            floor.includes(searchText) ||
            dormName.includes(searchText);
    };

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

            {/* Chỉ hiển thị khi là VIOLATION */}
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
                        >
                            {residents.map((resident) => (
                                <Select.Option key={resident.residentId} value={resident.residentId}>
                                    {resident.fullName || resident.userName} - {resident.email}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Phòng"
                        name="roomId"
                        rules={[{ required: true, message: "Vui lòng chọn phòng" }]}
                    >
                        <Select placeholder="Chọn phòng" showSearch>
                            {rooms.map((room) => (
                                <Select.Option key={room.id} value={room.id}>
                                    Phòng {room.roomNumber} - Tầng {room.floor} ({room.dorm.dormName})
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
                <Button type="primary" htmlType="submit" loading={loading} block>
                    Gửi báo cáo
                </Button>
            </Form.Item>
        </Form>
    );
}