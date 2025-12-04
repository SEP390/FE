import {useEffect, useState} from "react";
import {Typography, Table, Button, Space, message, Tag, Dropdown, Modal, Input, Card} from "antd";
import {EllipsisOutlined} from "@ant-design/icons";
import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import axios from "axios";
import { ReportDetailModal } from "../../../components/report/ReportDetailModal.jsx";

const {Title} = Typography;
const {TextArea} = Input;

export function ReportManagePage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [responseMessage, setResponseMessage] = useState("");
    const [detailVisible, setDetailVisible] = useState(false);
    const [detailReport, setDetailReport] = useState(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const token = localStorage.getItem("token");

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8080/api/reports", {
                headers: {Authorization: `Bearer ${token}`},
            });
            if (res.data.status === 200) setReports(res.data.data);
            else message.error("Không thể tải dữ liệu báo cáo");
        } catch (e) {
            console.error(e);
            message.error("Lỗi khi tải dữ liệu báo cáo");
        } finally {
            setLoading(false);
        }
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
        },
        {
            title: "Nội dung",
            dataIndex: "content",
            key: "content",
        },
        {
            title: "Loại báo cáo",
            dataIndex: "reportType",
            key: "reportType",
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
                <Table
                    rowKey="reportId"
                    columns={columns}
                    dataSource={reports}
                    loading={loading}
                    pagination={{pageSize: 6}}
                />
            </Card>

            <ReportDetailModal
                open={detailVisible}
                onClose={() => setDetailVisible(false)}
                report={detailReport}
            />

            <Modal
                title="Trả lời báo cáo"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleReplySubmit}
                okText="Gửi phản hồi"
            >
                <p>Báo cáo từ: {selectedReport?.employeeName}</p>
                <p>Nội dung: {selectedReport?.content}</p>
                <TextArea
                    rows={4}
                    placeholder="Nhập nội dung phản hồi..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                />
            </Modal>
        </LayoutManager>
    );
}