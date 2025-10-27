import {Layout} from "antd";
import {useState} from "react";
import {SideBarManager} from "./SideBarManger.jsx";
import {AppHeader} from "./AppHeader.jsx";

const {Content, Header} = Layout;

export function LayoutManager({active, children}) {
    const [collapsed, setCollapsed] = useState(false);

    return <Layout className={"!h-screen"}>
        <SideBarManager active={active} collapsed={collapsed}/>
        <Layout>
            <AppHeader toggleSideBar={() => setCollapsed(!collapsed)}/>
            <Content className={"!overflow-auto h-full p-5 flex flex-col"}>
                {children}
            </Content>
        </Layout>
    </Layout>
}
