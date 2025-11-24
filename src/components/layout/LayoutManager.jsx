import {Layout} from "antd";
import {SideBarManager} from "./SideBarManger.jsx";
import {AppHeader} from "./AppHeader.jsx";
import {useCollapsed} from "../../hooks/useCollapsed.js";

const {Content, Header} = Layout;

export function LayoutManager({active, children, header}) {
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed)

    return <Layout className={"!h-screen"}>
        <SideBarManager active={active} collapsed={collapsed} setCollapsed={setCollapsed}/>
        <Layout>
            <AppHeader header={header} toggleSideBar={() => setCollapsed(!collapsed)}/>
            <Content className={"!overflow-auto h-full p-5 flex flex-col *:flex-grow"}>
                {children}
            </Content>
        </Layout>
    </Layout>
}
