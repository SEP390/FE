import {
    CheckSquareOutlined,
    CoffeeOutlined,
    ContainerOutlined,
    FileSearchOutlined,
    HomeOutlined,
    InfoCircleOutlined,
    ReadOutlined,
    ScheduleOutlined,
    TeamOutlined,
    ThunderboltOutlined,
    UserOutlined,
    WarningOutlined,
} from "@ant-design/icons";
// CHUẨN HÓA IMPORTS: Import Layout và Menu từ 'antd'
import {Drawer, Layout, Menu} from "antd";
import {Link} from "react-router-dom";
import {Bed} from "lucide-react";
import {useMobile} from "../../hooks/useMobile.js";
import {useEffect} from "react";
import {useCollapsed} from "../../hooks/useCollapsed.js";

// Lấy Sider từ Layout đã import
const {Sider} = Layout;


const managerItems = [
    {
        label: <Link to={"/manager"}>Home</Link>,
        icon: <HomeOutlined/>,
        key: "manager-home",
    },
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
        label: <Link to={"/manager/schedule"}>Quản lí lịch làm việc</Link>, // MỤC ĐÃ HOÀN CHỈNH
        icon: <ScheduleOutlined/>,
        key: "manager-schedule",
    },
    {
        label: <Link to={"/manager/staff"}>Quản lí nhân viên</Link>,
        icon: <TeamOutlined/>,
        key: "manager-staff",
    },
    {
        label: <Link to={"/manager/attendance"}>Quản lí chấm công</Link>,
        icon: <CheckSquareOutlined/>,
        key: "manager-attendance",
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
    {
        label: <Link to={"/manager/holidays"}>Quản lí kỳ nghỉ</Link>,
        icon: <CoffeeOutlined/>,
        key: "holiday"
    },
];


export function SideBarManager({active}) {
    const {isMobile} = useMobile();
    const collapsed = useCollapsed(state => state.collapsed)
    const setCollapsed = useCollapsed(state => state.setCollapsed)
    useEffect(() => {
        if (!isMobile) {
            setCollapsed && setCollapsed(false)
        } else {
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
                theme="light"
                className={"relative bg-white border-r border-gray-200 scrollbar-* flex flex-col overflow-auto"}
            >
                <div
                    className="sticky bg-white border-b border-r border-gray-100 top-0 py-4 z-99 flex items-center justify-center">
                    <Bed size={32}/>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[active]}
                    className={"border-0 !z-0"}
                    items={managerItems}
                />
            </Sider>
            {isMobile && (
                <>
                    <Drawer width={300} placement={"left"} onClose={() => {
                        setCollapsed && setCollapsed(true)
                    }} open={!collapsed}>
                        <Menu
                            mode="inline"
                            selectedKeys={[active]}
                            className={"!border-0"}
                            items={managerItems}
                        />
                    </Drawer>
                </>
            )}
        </>
    );
}