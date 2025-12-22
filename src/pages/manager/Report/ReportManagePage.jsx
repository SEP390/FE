import {useEffect, useState} from "react";
import {Typography, Table, Button, Space, message, Tag, Dropdown, Modal, Input, Card, Select, Row, Col} from "antd";
import {EllipsisOutlined} from "@ant-design/icons";
import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import axios from "axios";
import { ReportDetailModal } from "../../../components/report/ReportDetailModal.jsx";

const {Title} = Typography;
const {TextArea} = Input;
const {Option} = Select;

export function ReportManagePage() {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [responseMessage, setResponseMessage] = useState("");
    const [detailVisible, setDetailVisible] = useState(false);
    const [detailReport, setDetailReport] = useState(null);

    // Filter states
    const [residents, setResidents] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loadingResidents, setLoadingResidents] = useState(false);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedReportType, setSelectedReportType] = useState(null);

    useEffect(() => {
        fetchReports();
        fetchResidents();
        fetchRooms();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [reports, selectedResident, selectedRoom, selectedReportType]);

    const token = localStorage.getItem("token");

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8080/api/reports", {
                headers: {Authorization: `Bearer ${token}`},
            });
            if (res.data.status === 200) {
                setReports(res.data.data || []);
            } else {
                message.error("Không thể tải dữ liệu báo cáo");
            }
        } catch (e) {
            console.error(e);
            message.error("Lỗi khi tải dữ liệu báo cáo");
        } finally {
            setLoading(false);
        }
    };

    const fetchResidents = async () => {
        try {
            setLoadingResidents(true);
            const response = await axios.get(
                "http://localhost:8080/api/users/residents",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
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
            const response = await axios.get(
                "http://localhost:8080/api/rooms?page=0&size=1000",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const validRooms = (response.data.data?.content || []).filter(r => r.id != null);
            setRooms(validRooms);
        } catch (err) {
            console.error("Lỗi khi tải danh sách phòng:", err);
        } finally {
            setLoadingRooms(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...reports];
        if (selectedResident) {
            filtered = filtered.filter(
                (r) => r.residentId === selectedResident
            );
        }
        if (selectedRoom) {
            filtered = filtered.filter(
                (r) => r.roomId === selectedRoom
            );
        }
        if (selectedReportType) {
            filtered = filtered.filter(
                (r) => r.reportType === selectedReportType
            );
        }
        setFilteredReports(filtered);
    };


    const clearFilters = () => {
        setSelectedResident(null);
        setSelectedRoom(null);
        setSelectedReportType(null);
    };

    const updateReportStatus = async (reportId, status, responseMsg = "") => {
        try {
            const res = await axios.put(
                `http://localhost:8080/api/reports/${reportId}`,
                {
                    reportId,
                    reportStatus: status,
                    responseMessage: responseMsg,
                },
                {
                    headers: {Authorization: `Bearer ${token}`},
                }
            );

            if (res.data.status === 200) {
                message.success("Cập nhật báo cáo thành công");
                fetchReports();
            } else {
                message.error("Không thể cập nhật báo cáo");
            }
        } catch (e) {
            console.error(e);
            message.error("Lỗi khi cập nhật báo cáo");
        }
    };

    const renderStatusTag = (status) => {
        switch (status) {
            case "PENDING":
                return <Tag color="orange">PENDING</Tag>;
            case "CONFIRMED":
                return <Tag color="green">CONFIRMED</Tag>;
            default:
                return <Tag>{status}</Tag>;
        }
    };

    const renderReportTypeTag = (type) => {
        switch (type) {
            case "MAINTENANCE_REQUEST":
                return <Tag color="blue">Yêu cầu bảo trì</Tag>;
            case "VIOLATION":
                return <Tag color="red">Vi phạm</Tag>;
            case "OTHER":
                return <Tag color="default">Khác</Tag>;
            default:
                return <Tag>{type}</Tag>;
        }
    };

    const getResidentName = (residentId) => {
        if (!residentId) return "-";
        const resident = residents.find(r => r.residentId === residentId);
        return resident ? `${resident.fullName} (${resident.email})` : "-";
    };

    const getRoomName = (roomId) => {
        if (!roomId) return "-";
        const room = rooms.find(r => r.id === roomId);
        return room ? room.roomNumber : "-";
    };

    const getMenuItems = (record) => [
        {
            key: "view",
            label: "Xem chi tiết",
            onClick: () => {
                setDetailReport(record);
                setDetailVisible(true);
            },
        },
        {
            key: "confirm",
            label: "Xác nhận báo cáo",
            onClick: () => updateReportStatus(record.reportId, "CONFIRMED"),
            disabled: record.reportStatus === "CONFIRMED",
        },
        {
            key: "reply",
            label: "Trả lời báo cáo",
            onClick: () => {
                setSelectedReport(record);
                setResponseMessage("");
                setModalVisible(true);
            },
        },
    ];

    // Determine if we should hide userCode and room columns
    const shouldHideUserAndRoom = selectedReportType === "MAINTENANCE_REQUEST" || selectedReportType === "OTHER";

    const columns = [
        {
            title: "STT",
            key: "index",
            render: (_, __, index) => index + 1,
            width: 70,
        },
        {
            title: "Tên nhân viên",
            dataIndex: "employeeName",
            key: "employeeName",
            render: (text, record) => `${text} (${record.userCode})`,
        },
        ...(!shouldHideUserAndRoom ? [{
            title: "Sinh viên",
            dataIndex: "residentId",
            key: "residentId",
            render: (residentId) => getResidentName(residentId),
        }] : []),
        ...(!shouldHideUserAndRoom ? [{
            title: "Phòng",
            dataIndex: "roomId",
            key: "roomId",
            render: (roomId) => getRoomName(roomId),
        }] : []),
        {
            title: "Nội dung",
            dataIndex: "content",
            key: "content",
            ellipsis: true,
        },
        {
            title: "Loại báo cáo",
            dataIndex: "reportType",
            key: "reportType",
            render: renderReportTypeTag,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdDate",
            key: "createdDate",
            render: (date) => new Date(date).toLocaleString("vi-VN"),
        },
        {
            title: "Trạng thái",
            dataIndex: "reportStatus",
            key: "reportStatus",
            render: renderStatusTag,
        },
        {
            title: "Hành động",
            key: "action",
            align: "center",
            width: 100,
            render: (_, record) => (
                <Space>
                    <Dropdown
                        menu={{items: getMenuItems(record)}}
                        trigger={["click"]}
                        placement="bottomRight"
                    >
                        <Button type="text" icon={<EllipsisOutlined/>}/>
                    </Dropdown>
                </Space>
            ),
        },
    ];

    const handleReplySubmit = async () => {
        if (!responseMessage.trim()) {
            message.warning("Vui lòng nhập nội dung phản hồi");
            return;
        }
        await updateReportStatus(selectedReport.reportId, "CONFIRMED", responseMessage);
        setModalVisible(false);
    };

    return (
        <LayoutManager active="manager-reports" header="Quản lý báo cáo">
            <Card className="h-full">
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={24} md={8} lg={6}>
                        <Select
                            style={{ width: "100%" }}
                            placeholder="Lọc theo loại báo cáo"
                            allowClear
                            value={selectedReportType}
                            onChange={setSelectedReportType}
                        >
                            <Option value="VIOLATION">Vi phạm</Option>
                            <Option value="MAINTENANCE_REQUEST">Yêu cầu bảo trì</Option>
                            <Option value="OTHER">Khác</Option>
                        </Select>
                    </Col>

                    {!shouldHideUserAndRoom && (
                        <>
                            <Col xs={24} sm={24} md={8} lg={9}>
                                <Select
                                    style={{ width: "100%" }}
                                    placeholder="Lọc theo sinh viên"
                                    allowClear
                                    showSearch
                                    loading={loadingResidents}
                                    value={selectedResident}
                                    onChange={setSelectedResident}
                                    filterOption={(input, option) =>
                                        option.children
                                            .toString()
                                            .toLowerCase()
                                            .includes(input.toLowerCase())
                                    }
                                >
                                    {residents.map(resident => (
                                        <Option key={resident.residentId} value={resident.residentId}>
                                            {resident.fullName} ({resident.email})
                                        </Option>
                                    ))}
                                </Select>
                            </Col>

                            <Col xs={24} sm={24} md={8} lg={5}>
                                <Select
                                    style={{ width: "100%" }}
                                    placeholder="Lọc theo phòng"
                                    allowClear
                                    showSearch
                                    loading={loadingRooms}
                                    value={selectedRoom}
                                    onChange={setSelectedRoom}
                                >
                                    {rooms.map(room => (
                                        <Option key={room.id} value={room.id}>
                                            {room.roomNumber}
                                        </Option>
                                    ))}
                                </Select>
                            </Col>
                        </>
                    )}

                    <Col xs={24} sm={24} md={24} lg={4}>
                        <Button block onClick={clearFilters}>
                            Xóa bộ lọc
                        </Button>
                    </Col>
                </Row>
                <Table
                    rowKey="reportId"
                    columns={columns}
                    dataSource={filteredReports}
                    loading={loading}
                    pagination={{ pageSize: 6 }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            <ReportDetailModal
                open={detailVisible}
                onClose={() => setDetailVisible(false)}
                report={detailReport}
                residents={residents}
                rooms={rooms}
            />

            <Modal
                title="Trả lời báo cáo"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleReplySubmit}
                okText="Gửi phản hồi"
                cancelText="Hủy"
            >
                <Space direction="vertical" style={{width: "100%"}}>
                    <div>
                        <strong>Báo cáo từ:</strong> {selectedReport?.employeeName} ({selectedReport?.userCode})
                    </div>
                    <div>
                        <strong>Loại:</strong> {selectedReport && renderReportTypeTag(selectedReport.reportType)}
                    </div>
                    <div>
                        <strong>Nội dung:</strong> {selectedReport?.content}
                    </div>
                    <TextArea
                        rows={4}
                        placeholder="Nhập nội dung phản hồi..."
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                    />
                </Space>
            </Modal>
        </LayoutManager>
    );
}