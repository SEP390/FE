import {
    HomeOutlined,
    UserOutlined,
    ThunderboltOutlined,
    ContainerOutlined,
    InfoCircleOutlined,
    ReadOutlined,
    ScheduleOutlined, // ICON cho Quản lí lịch làm việc
    TeamOutlined,
    WarningOutlined,
    FileSearchOutlined,
    CheckSquareOutlined, CoffeeOutlined,
} from "@ant-design/icons";
// CHUẨN HÓA IMPORTS: Import Layout và Menu từ 'antd'
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import { Bed } from "lucide-react";

// Lấy Sider từ Layout đã import
const { Sider } = Layout;


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
        label: <Link to={"/pages/manager/electric-water/pricing"}>Giá điện nước</Link>,
        icon: <ThunderboltOutlined/>,
        key: "electric-water-pricing",
    },
    {
        label: <Link to={"/manager/requests"}>Quản lí yêu cầu</Link>,
        icon: <ContainerOutlined/>,
        key: "manager-requests",
    },
    {
        label: <Link to={"/pages/manager/checkout"}>Quản lí checkout</Link>,
        icon: <ContainerOutlined/>,
        key: "manager-checkout",
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
    {
        label: <Link to={'/manager/invoices'}>Quản lí hóa đơn</Link>,
        icon: <ThunderboltOutlined/>,
        key: 'manager-invoices'
    }
];

export function SideBarManager({ collapsed, active }) {
    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            theme="light"
            className={"bg-white border-r border-gray-200 overflow-auto scrollbar-*"}
        >
            {/* Logo/Brand Area */}
            <div className="flex items-center justify-center py-4">
                <Bed size={32} />
            </div>

            <Menu
                mode="inline"
                selectedKeys={[active]}
                className={"!border-0"}
                items={managerItems}
            />
        </Sider>
    );
}