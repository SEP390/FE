import {
    ContainerOutlined,
    FileSearchOutlined,
    InfoCircleOutlined,
    ReadOutlined,
    ScheduleOutlined,
    TeamOutlined,
    ThunderboltOutlined,
    UserOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import {Drawer, Layout, Menu} from "antd";
import {Link} from "react-router-dom";
import {Clock} from "lucide-react";
import {useMobile} from "../../hooks/useMobile.js";
import {useEffect} from "react";
import {useCollapsed} from "../../hooks/useCollapsed.js";

const {Sider} = Layout;

const managerItems = [
    {
        label: <Link to={"/manager/residents"}>Quản lí sinh viên</Link>,
        icon: <UserOutlined/>,
        key: "manager-students",
    },
    {
        label: <Link to={"/pages/manager/ew"}>Quản lý điện nước</Link>,
        icon: <ThunderboltOutlined/>,
        key: "manager-ew",
    },
    {
        label: <Link to={"/pages/manager/time-config"}>Quản lý thời gian đặt phòng</Link>,
        icon: <Clock size={14}/>,
        key: "manager-time-config",
    },
    {
        label: <Link to={'/pages/manager/invoice'}>Quản lí hóa đơn</Link>,
        icon: <ReadOutlined/>,
        key: 'manager-invoice'
    },
    {
        label: <Link to={"/manager/requests"}>Quản lí yêu cầu</Link>,
        icon: <ContainerOutlined/>,
        key: "manager-requests",
    },
    {
        label: <Link to={"/pages/manager/slot-usage"}>Quản lí slot</Link>,
        icon: <ContainerOutlined/>,
        key: "manager-slot",
    },
    {
        label: <Link to={"/manager/rooms"}>Thông tin phòng</Link>,
        icon: <InfoCircleOutlined/>,
        key: "manager-rooms",
    },
    {
        label: <Link to={"/manager/news"}>Quản lí tin tức</Link>,
        icon: <ReadOutlined/>,
        key: "manager-news",
    },
    {
        label: <Link to={"/manager/schedule"}>Quản lí lịch làm việc</Link>,
        icon: <ScheduleOutlined/>,
        key: "manager-schedule",
    },
    {
        label: <Link to={"/manager/staff"}>Quản lí nhân viên</Link>,
        icon: <TeamOutlined/>,
        key: "manager-staff",
    },
    {
        label: <Link to={"/manager/reports"}>Quản lí báo cáo</Link>,
        icon: <WarningOutlined/>,
        key: "manager-reports",
    },
    {
        label: <Link to={"/manager/surveys"}>Quản lí khảo sát</Link>,
        icon: <FileSearchOutlined/>,
        key: "manager-surveys",
    },
    {
        label: <Link to={"/pages/manager/semester"}>Quản lí kỳ</Link>,
        icon: <FileSearchOutlined/>,
        key: "semester",
    },
];

export function SideBarManager({active, collapsed: collapsedProp, setCollapsed: setCollapsedProp}) {
    const {isMobile} = useMobile();
    const collapsedStore = useCollapsed(state => state.collapsed)
    const setCollapsedStore = useCollapsed(state => state.setCollapsed)

    // Prefer values passed from LayoutManager; otherwise fall back to the shared store
    const collapsed = typeof collapsedProp === 'boolean' ? collapsedProp : collapsedStore
    const setCollapsed = typeof setCollapsedProp === 'function' ? setCollapsedProp : setCollapsedStore

    useEffect(() => {
        if (!isMobile) {
            setCollapsed && setCollapsed(false)
        } else {
            // On mobile we want the drawer closed by default (collapsed = true)
            setCollapsed && setCollapsed(true)
        }
    }, [isMobile, setCollapsed]);

    return (
        <>
            <Sider
                trigger={null}
                collapsible
                collapsedWidth={isMobile ? 0 : 80}
                collapsed={isMobile ? true : collapsed}
                width={260}
                theme="light"
                className="bg-white border-r border-gray-200 shadow-sm"
                style={{
                    height: 'calc(100vh - 64px)', // Trừ đi chiều cao Header
                    overflow: 'auto',
                    position: 'fixed', // Cố định vị trí
                    top: '64px', // Bắt đầu sau Header
                    left: 0,
                    zIndex: 100 // Dưới Header (Header là z-1000)
                }}
            >
                {/* Logo/Brand area - không cần nữa vì Header đã có */}

                <Menu
                    mode="inline"
                    selectedKeys={[active]}
                    className="!border-0 pt-4"
                    items={managerItems}
                    style={{
                        fontSize: '15px',
                    }}
                    theme="light"
                    inlineIndent={24}
                />

                <style jsx global>{`
                    .ant-menu-item {
                        height: 48px !important;
                        line-height: 48px !important;
                        margin: 4px 8px !important;
                        border-radius: 8px !important;
                        transition: all 0.3s ease !important;
                    }

                    .ant-menu-item:hover {
                        background-color: #e6f4ff !important;
                    }

                    .ant-menu-item-selected {
                        background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
                        color: white !important;
                        font-weight: 600 !important;
                        box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3) !important;
                    }

                    .ant-menu-item-selected .anticon,
                    .ant-menu-item-selected a {
                        color: white !important;
                    }

                    .ant-menu-item .anticon {
                        font-size: 18px !important;
                    }
                `}</style>
            </Sider>

            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    width={300}
                    placement={"left"}
                    onClose={() => setCollapsed && setCollapsed(true)}
                    open={!collapsed}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={[active]}
                        className={"!border-0"}
                        items={managerItems}
                    />
                </Drawer>
            )}
        </>
    );
}