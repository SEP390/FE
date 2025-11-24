import { Modal, Descriptions, Typography, Divider, Card } from "antd";

const { Text, Paragraph } = Typography;

export function ReportDetailModal({ open, onClose, report }) {
    if (!report) return null;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={650}
            title="Chi tiết báo cáo"
        >
            <Descriptions
                column={1}
                bordered
                size="middle"
                labelStyle={{ fontWeight: "600", width: "30%" }}
            >
                <Descriptions.Item label="Người báo cáo">
                    {report.employeeName}
                </Descriptions.Item>

                <Descriptions.Item label="Mã người dùng">
                    {report.userCode}
                </Descriptions.Item>

                <Descriptions.Item label="Loại báo cáo">
                    {report.reportType}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                    {report.reportStatus}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày tạo">
                    {new Date(report.createdDate).toLocaleString("vi-VN")}
                </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Card size="small" title="Nội dung báo cáo" style={{ marginBottom: 16 }}>
                <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>
                    {report.content}
                </Paragraph>
            </Card>

            <Card size="small" title="Phản hồi từ quản lý">
                <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>
                    {report.responseMessage ? report.responseMessage : "Chưa có phản hồi"}
                </Paragraph>
            </Card>
        </Modal>
    );
}

