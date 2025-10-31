import React, {useState} from "react";
import { Card, Table, Tag, Typography, Layout } from "antd";
import { SideBarTechnical } from "../../components/layout/SideBarTechnical.jsx";
import { AppHeader } from "../../components/layout/AppHeader.jsx";

const { Title } = Typography;
const { Content } = Layout;

export function TechnicalRequests() {
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'technical-requests';
    const columns = [
        { title: "Mã YC", dataIndex: "code", key: "code", width: 120 },
        { title: "Tiêu đề", dataIndex: "title", key: "title" },
        { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", width: 160 },
        { title: "Phòng", dataIndex: "room", key: "room", width: 100 },
        { title: "Trạng thái", dataIndex: "status", key: "status", width: 140, render: (s) => <Tag color={s === "Mới" ? "blue" : s === "Đang xử lý" ? "orange" : "green"}>{s}</Tag> },
    ];
    const data = [
        { key: 1, code: "RQ-1001", title: "Sửa bóng đèn", createdAt: "2025-10-01", room: "A101", status: "Mới" },
        { key: 2, code: "RQ-1002", title: "Sửa vòi nước", createdAt: "2025-10-02", room: "B202", status: "Đang xử lý" },
    ];
    return (
        <Layout className={"!h-screen"}>
            <SideBarTechnical active={activeKey} collapsed={collapsed} />
            <Layout>
                <AppHeader toggleSideBar={() => setCollapsed(!collapsed)} />
                <Content className={"!overflow-auto h-full p-5 flex flex-col"}>
                    <div className="p-0">
                        <Title level={3} style={{ marginBottom: 16 }}>Yêu cầu kỹ thuật</Title>
                        <Card>
                            <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
                        </Card>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default TechnicalRequests;


