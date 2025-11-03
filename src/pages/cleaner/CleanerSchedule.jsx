import React, {useState} from "react";
import { Card, Calendar, Typography, Layout } from "antd";
import { SideBarCleaner } from "../../components/layout/SideBarCleaner.jsx";
import { AppHeader } from "../../components/layout/AppHeader.jsx";

const { Title } = Typography;
const { Content } = Layout;

export function CleanerSchedule() {
    const [collapsed, setCollapsed] = useState(false);
    const activeKey = 'cleaner-schedule';
    return (
        <Layout className={"!h-screen"}>
            <SideBarCleaner active={activeKey} collapsed={collapsed} />
            <Layout>
                <AppHeader toggleSideBar={() => setCollapsed(!collapsed)} />
                <Content className={"!overflow-auto h-full p-5 flex flex-col"}>
                    <div className="p-0">
                        <Title level={3} style={{ marginBottom: 16 }}>Lịch làm việc</Title>
                        <Card>
                            <Calendar fullscreen={false} />
                        </Card>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default CleanerSchedule;


