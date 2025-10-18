import {Layout} from "antd";
import {useState} from "react";
import {SideBar} from "./SideBar.jsx";
import {AppHeader} from "./AppHeader.jsx";

const {Content} = Layout;

export function AppLayout({children, activeSidebar}) {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSideBar = () => {
        setCollapsed(!collapsed);
    }

    return <Layout className={"!h-screen"}>
        <SideBar active={activeSidebar} collapsed={collapsed} />
        <Layout>
            <AppHeader toggleSideBar={toggleSideBar} />
            <Content className={"!overflow-auto h-full p-5 flex flex-col"}>
                {children}
            </Content>
        </Layout>
    </Layout>
}