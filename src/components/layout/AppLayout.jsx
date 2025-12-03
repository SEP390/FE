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
        <SideBar active={activeSidebar} collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* LOẠI BỎ marginLeft ở đây, và truyền collapsed */}
        <Layout>
            <AppHeader toggleSideBar={toggleSideBar} collapsed={collapsed} />
            {/* THÊM marginLeft và marginTop vào Content */}
            <Content
                className={"!overflow-auto h-full p-5 flex flex-col"}
                style={{
                    marginTop: 64, // Bù đắp chiều cao Header cố định
                    marginLeft: collapsed ? 80 : 260, // Bù đắp chiều rộng Sidebar cố định
                    transition: 'margin-left 0.3s ease',
                }}
            >
                {children}
            </Content>
        </Layout>
    </Layout>
}