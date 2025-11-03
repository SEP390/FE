import {
    CalendarOutlined,
    DollarOutlined,
    HistoryOutlined,
    HomeOutlined,
    ReadOutlined,
    SolutionOutlined,
    ThunderboltOutlined,
    UserOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import { Menu, Layout } from "antd";
import { Link } from "react-router-dom";
import {Bed, MapPin} from "lucide-react";

const {Sider} = Layout;

const items = [
    {
        label: <Link to={"/"}>Home</Link>,
        icon: <HomeOutlined />,
        key: "home",
    },
    {
        label: <Link to={"/news"}>Tin tức</Link>,
        icon: <ReadOutlined />,
        key: "news",
    },
    {
        label: <Link to={"/booking"}>Đặt phòng</Link>,
        icon: <CalendarOutlined />,
        key: "booking",
    },
    {
        label: <Link to={"/pages/map"}>Bản đồ</Link>,
        icon: <MapPin size={16} />,
        key: "map",
    },
    {
        label: <Link to={"/booking-history"}>Lịch sử đặt phòng</Link>,
        icon: <HistoryOutlined />,
        key: "booking-history",
    },
    {
        label: <Link to={"/survey"}>Survey</Link>,
        icon: <SolutionOutlined />,
        key: "survey",
    },
    {
        label: <Link to={"/payment"}>Lịch sử thanh toán</Link>,
        icon: <DollarOutlined />,
        key: "payment",
    },
    {
        label: <Link to={"/electric-water"}>Hóa đơn điện nước</Link>,
        icon: <ThunderboltOutlined />,
        key: "electric-water",
    },
    {
        label: <Link to={"/student-info"}>Thông tin sinh viên</Link>,
        icon: <UserOutlined />,
        key: "student-info",
    },
    {
        label: <Link to={"/my-requests"}>Yêu cầu của tôi</Link>,
        icon: <FileTextOutlined />,
        key: "my-requests",
    },
];

export function SideBar({ collapsed, active }) {
    return (
        <>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                theme="light"
                className={"bg-white border-r border-gray-200"}
            >
                <div className="flex items-center justify-center py-4">
                    <Bed />
                </div>

                <Menu
                    mode="inline"
                    defaultSelectedKeys={[active]}
                    className={"!border-0"}
                    items={items}
                />
            </Sider>
        </>
    );
}
