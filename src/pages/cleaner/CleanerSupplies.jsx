import React, {useState} from "react";
import { Button, Card, Table, Typography, Layout } from "antd";
import { SideBarCleaner } from "../../components/layout/SideBarCleaner.jsx";
import { AppHeader } from "../../components/layout/AppHeader.jsx";

const { Title } = Typography;
const { Content } = Layout;

export function CleanerSupplies() {
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'cleaner-supplies';
    const columns = [
        { title: "Mã VT", dataIndex: "code", key: "code", width: 120 },
        { title: "Tên vật tư", dataIndex: "name", key: "name" },
        { title: "Tồn kho", dataIndex: "stock", key: "stock", width: 120 },
    ];
    const data = [
        { key: 1, code: "CL-001", name: "Nước lau sàn", stock: 20 },
        { key: 2, code: "CL-002", name: "Nước rửa kính", stock: 12 },
    ];
    return (
        <Layout className={"!h-screen"}>
            <SideBarCleaner active={activeKey} collapsed={collapsed} />
            <Layout>
                <AppHeader toggleSideBar={() => setCollapsed(!collapsed)} />
                <Content className={"!overflow-auto h-full p-5 flex flex-col"}>
                    <div className="p-0">
                        <Title level={3} style={{ marginBottom: 16 }}>Quản lý vật tư vệ sinh</Title>
                        <Card className="mb-4">
                            <Button type="primary">Tạo phiếu xuất</Button>
                        </Card>
                        <Card>
                            <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
                        </Card>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default CleanerSupplies;


