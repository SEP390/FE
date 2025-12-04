import {Layout} from "antd";
import {SideBarManager} from "./SideBarManger.jsx";
import {AppHeader} from "./AppHeader.jsx";
import {useCollapsed} from "../../hooks/useCollapsed.js";
import {useMobile} from "../../hooks/useMobile.js";

const {Content} = Layout;

export function LayoutManager({active, children, header}) {
    const collapsed = useCollapsed(state => state.collapsed);
    const setCollapsed = useCollapsed(state => state.setCollapsed)
    const {isMobile} = useMobile();

    // Calculate content left margin: when on mobile the sidebar is drawn over content (Drawer),
    // so we keep margin-left at 0. On desktop we offset by collapsed width (80) or full width (260).
    const contentMarginLeft = isMobile ? 0 : (collapsed ? 80 : 260);

    return <Layout className={"!h-screen"}>
        <SideBarManager active={active} collapsed={collapsed} setCollapsed={setCollapsed}/>

        <Layout>
            {/* Header với collapsed prop */}
            <AppHeader
                header={header}
                toggleSideBar={() => setCollapsed(!collapsed)}
                collapsed={collapsed}
            />

            {/* Content với margin để tránh bị che bởi Header và Sidebar cố định */}
            <Content
                className={"!overflow-auto h-full p-5 flex flex-col *:flex-grow"}
                style={{
                    marginTop: 64, // Bù đắp chiều cao Header
                    marginLeft: contentMarginLeft, // Bù đắp chiều rộng Sidebar (0 on mobile)
                    transition: 'margin-left 0.3s ease',
                }}
            >
                {children}
            </Content>
        </Layout>
    </Layout>
}