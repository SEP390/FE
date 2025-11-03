import {Layout} from "antd";
import {GuardSidebar} from "../../../components/layout/GuardSidebar.jsx";
import React from "react";
import {AppHeader} from "../../../components/layout/AppHeader.jsx";

export function GuardCreateReport() {
    const [collapsed, setCollapsed] = React.useState(false);
    const toggleSideBar = () => {
        setCollapsed(!collapsed);
    };
    return (
        <Layout style={{minHeight: "100vh"}}>
            <GuardSidebar collapsed={collapsed} active="guard-reports"/>
            <Layout>
                <AppHeader toggleSideBar={toggleSideBar}/>
                <Layout.Content style={{margin: "24px 16px", padding: 24, background: "#fff"}}>
                    <h1>Tạo Báo Cáo Mới</h1>
                    {/* Form for creating a new report would go here */}
                </Layout.Content>
            </Layout>

        </Layout>
    );
}