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
import Sider from "antd/es/layout/Sider.js";
import {Menu} from "antd";
import {Link} from "react-router-dom";
import {Bed} from "lucide-react"; // Giữ lại nếu bạn muốn dùng icon logo này

// Định nghĩa các mục menu cho Quản lý (Manager)
const managerItems = [
    {
        label: <Link to={"/manager/home"}>Home</Link>,
        icon: <HomeOutlined/>,
        key: "manager-home",
    },
    {
        label: <Link to={"/manager/students"}>Quản lí sinh viên</Link>,
        icon: <UserOutlined/>, // Icon người dùng
        key: "manager-students",
    },
    {
        label: <Link to={"/manager/electric-water"}>Hóa đơn điện nước</Link>,
        icon: <ThunderboltOutlined/>, // Icon sét (như hóa đơn điện)
        key: "manager-electric-water",
    },
    {
        label: <Link to={"/manager/requests"}>Quản lí yêu cầu</Link>,
        icon: <ContainerOutlined/>, // Icon container/tài liệu
        key: "manager-requests",
    },
    {
        label: <Link to={"/manager/rooms"}>Thông tin phòng</Link>,
        icon: <InfoCircleOutlined/>, // Icon thông tin
        key: "manager-rooms",
    },
    {
        label: <Link to={"/manager/news"}>Quản lí tin tức</Link>,
        icon: <ReadOutlined/>, // Icon sách/tin tức
        key: "manager-news",
    },
    {
        label: <Link to={"/manager/schedule"}>Quản lí lịch làm việc</Link>,
        icon: <ScheduleOutlined/>, // Icon lịch trình
        key: "manager-schedule",
    },
    {
        label: <Link to={"/manager/staff"}>Quản lí nhân viên</Link>,
        icon: <TeamOutlined/>, // Icon nhóm người/team
        key: "manager-staff",
    },
    {
        label: <Link to={"/manager/violations"}>Quản lí báo cáo vi phạm</Link>,
        icon: <WarningOutlined/>, // Icon cảnh báo
        key: "manager-violations",
    },
    {
        label: <Link to={"/manager/surveys"}>Quản lí khảo sát</Link>,
        icon: <FileSearchOutlined/>, // Icon tìm kiếm file/khảo sát
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
            // Thay đổi width nếu cần cho manager dashboard
        >
            {/* Logo/Brand Area */}
            <div className="flex items-center justify-center py-4">
                <Bed size={32} /> {/* Tăng size Bed icon cho logo */}
            </div>

            <Menu
                mode="inline"
                // Sử dụng active để làm nổi bật item hiện tại
                defaultSelectedKeys={[active]}
                className={"!border-0"}
                items={managerItems}
            />
        </Sider>
    );
}