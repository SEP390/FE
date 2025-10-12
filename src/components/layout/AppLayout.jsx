import {Content} from "antd/es/layout/layout.js";
import {Layout} from "antd";
import React, {useState} from "react";
import {SideBar} from "./SideBar.jsx";
import {AppHeader} from "./AppHeader.jsx";

export function AppLayout({children, activeSidebar}) {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSideBar = () => {
        setCollapsed(!collapsed);
    }

    return <Layout>
        <SideBar active={activeSidebar} collapsed={collapsed} />
        <Layout>
            <AppHeader toggleSideBar={toggleSideBar} />
            <Content className={"!overflow-auto h-full p-5 flex flex-col"}>
                {children}
            </Content>
        </Layout>
    </Layout>
}