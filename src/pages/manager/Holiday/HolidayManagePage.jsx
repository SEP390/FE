import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {Table, Typography, Button, Space, Card} from "antd";
import {useEffect, useState} from "react";
import {HolidayModal} from "../../../components/Holiday/HolidayModal.jsx";

export function HolidayManagePage() {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState(null);

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/holidays", {
                headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
            });
            const result = await res.json();
            if (result.status === 200 || result.status === 201) setHolidays(result.data);
        } catch {
            console.error("API error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    const columns = [
        {title: "STT", render: (_, __, index) => index + 1},
        {title: "Tên kỳ nghỉ", dataIndex: "holidayName"},
        {title: "Ngày bắt đầu", dataIndex: "startDate"},
        {title: "Ngày kết thúc", dataIndex: "endDate"},
        {
            title: "Thao tác",
            render: (_, record) => (
                <Button type="link" onClick={() => {
                    setEditingHoliday(record);
                    setModalOpen(true);
                }}>
                    Sửa
                </Button>
            ),
        },
    ];

    return (
        <LayoutManager active={"holiday"}>
            <Card>
                <Space style={{marginBottom: 16, justifyContent: "space-between", width: "100%"}}>
                    <Typography.Title level={3} style={{margin: 0}}>
                        Danh sách kỳ nghỉ
                    </Typography.Title>
                    <Button type="primary" onClick={() => {
                        setEditingHoliday(null);
                        setModalOpen(true);
                    }}>
                        + Thêm kỳ nghỉ
                    </Button>
                </Space>

                <Table
                    dataSource={holidays}
                    columns={columns}
                    rowKey="holidayId"
                    loading={loading}
                    pagination={{pageSize: 5}}
                />

                <HolidayModal
                    open={modalOpen}
                    onCancel={() => setModalOpen(false)}
                    onSuccess={() => {
                        fetchHolidays();
                        setModalOpen(false);
                    }}
                    editingHoliday={editingHoliday}
                />
            </Card>
        </LayoutManager>
    );
}
