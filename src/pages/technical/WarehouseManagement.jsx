import React, {useState} from "react";
import { Button, Card, Table, Typography, Layout } from "antd";
import { SideBarTechnical } from "../../components/layout/SideBarTechnical.jsx";
import { AppHeader } from "../../components/layout/AppHeader.jsx";

const { Title } = Typography;
const { Content } = Layout;

export function WarehouseManagement() {
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'technical-inventory';
    const columns = [
        { title: "Mã SP", dataIndex: "code", key: "code", width: 120 },
        { title: "Tên hàng", dataIndex: "name", key: "name" },
        { title: "Số lượng", dataIndex: "qty", key: "qty", width: 120 },
    ];
    const data = [
        { key: 1, code: "IT-001", name: "Bóng đèn LED", qty: 50 },
        { key: 2, code: "IT-002", name: "Ống nước PPR", qty: 30 },
    ];
    return (
        <Layout className={"!h-screen"}>
            <SideBarTechnical active={activeKey} collapsed={collapsed} />
            <Layout>
                <AppHeader toggleSideBar={() => setCollapsed(!collapsed)} />
                <Content className={"!overflow-auto h-full p-5 flex flex-col"}>
                    <div className="p-0">
                        <Title level={3} style={{ marginBottom: 16 }}>Quản lý kho kỹ thuật</Title>
                        <Card className="mb-4">
                            <Button type="primary">Nhập kho</Button>
                            <Button className="ml-2">Xuất kho</Button>
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

export default WarehouseManagement;


