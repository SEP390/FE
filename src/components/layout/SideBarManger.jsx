import {
    HomeOutlined,
    UserOutlined,
    ThunderboltOutlined,
    ContainerOutlined,
    InfoCircleOutlined,
    ReadOutlined,
    ScheduleOutlined,
    TeamOutlined,
    WarningOutlined,
    FileSearchOutlined,
} from "@ant-design/icons";
// CHUẨN HÓA IMPORTS: Import Layout và Menu từ 'antd'
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import { Bed } from "lucide-react";

// Lấy Sider từ Layout đã import
const { Sider } = Layout;

// Định nghĩa các mục menu cho Quản lý (Manager) - KHÔNG CẦN SỬA ĐỔI
const managerItems = [
    {
        label: <Link to={"/manager/home"}>Home</Link>,
        icon: <HomeOutlined/>,
        key: "manager-home",
    },
    {
        label: <Link to={"/manager/students"}>Quản lí sinh viên</Link>,
        icon: <UserOutlined/>,
        key: "manager-students",
    },
    {
        label: <Link to={"/manager/electric-water"}>Hóa đơn điện nước</Link>,
        icon: <ThunderboltOutlined/>,
        key: "manager-electric-water",
    },
    {
        label: <Link to={"/manager/requests"}>Quản lí yêu cầu</Link>,
        icon: <ContainerOutlined/>,
        key: "manager-requests",
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
        label: <Link to={"/manager/violations"}>Quản lí báo cáo vi phạm</Link>,
        icon: <WarningOutlined/>,
        key: "manager-violations",
    },
    {
        label: <Link to={"/manager/surveys"}>Quản lí khảo sát</Link>,
        icon: <FileSearchOutlined/>,
        key: "manager-surveys",
    }
];

export function SideBarManager({ collapsed, active }) {
    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            theme="light"
            className={"bg-white border-r border-gray-200"}
            // Có thể thêm breakpoint và width cố định cho Sider nếu cần
        >
            {/* Logo/Brand Area */}
            <div className="flex items-center justify-center py-4">
                <Bed size={32} />
            </div>

            <Menu
                mode="inline"
                // THAY ĐỔI: Sử dụng selectedKeys thay vì defaultSelectedKeys
                selectedKeys={[active]}
                className={"!border-0"}
                items={managerItems}
                // Thêm tính năng tắt menu khi click vào item (chỉ cần nếu Menu đang ở chế độ Overlay)
                // onClick={({ key }) => { /* ... navigate or close menu logic */ }}
            />
        </Sider>
    );
}