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
import {MapPin} from "lucide-react";

const {Sider} = Layout;

const items = [
    {
        label: <Link to={"/"}>Trang chủ</Link>,
        icon: <HomeOutlined />,
        key: "home",
    },
    {
        label: <Link to={"/news"}>Tin tức</Link>,
        icon: <ReadOutlined />,
        key: "news",
    },
    {
        label: <Link to={"/pages/booking"}>Đặt phòng</Link>,
        icon: <CalendarOutlined />,
        key: "booking",
    },
    {
        label: <Link to={"/pages/map"}>Bản đồ</Link>,
        icon: <MapPin size={16} />,
        key: "map",
    },
    {
        label: <Link to={"/pages/booking/history"}>Lịch sử đặt phòng</Link>,
        icon: <HistoryOutlined />,
        key: "booking-history",
    },
    {
        label: <Link to={"/survey"}>Khảo sát</Link>,
        icon: <SolutionOutlined />,
        key: "survey",
    },
    {
        label: <Link to={"/pages/invoices"}>Hóa đơn</Link>,
        icon: <DollarOutlined />,
        key: "invoices",
    },
    {
        label: <Link to={"/pages/ew"}>Điện nước</Link>,
        icon: <ThunderboltOutlined />,
        key: "ew",
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

export function SideBar({ collapsed, active, setCollapsed }) {
    return (
        <Sider
            trigger={null}
            collapsible
            breakpoint={"md"}
            onBreakpoint={(broken) => {setCollapsed && setCollapsed(broken)}}
            collapsed={collapsed}
            width={260}
            theme="light"
            className="bg-white border-r border-gray-200 shadow-sm"
            // SideBar.jsx (Đã sửa)
            style={{
                height: 'calc(100vh - 64px)', // Vẫn giữ nguyên chiều cao này
                overflow: 'auto',
                position: 'fixed', // Quan trọng: Đặt vị trí cố định
                top: '64px', // Quan trọng: Bắt đầu 64px từ trên xuống
                left: 0, // Quan trọng: Bắt đầu 0px từ bên trái
                zIndex: 100 // Đảm bảo nó nằm dưới Header (Header là z-500)
            }}
        >
            <Menu
                mode="inline"
                selectedKeys={[active]}
                className="!border-0 pt-4"
                items={items}
                style={{
                    fontSize: '15px',
                }}
                theme="light"
                // Custom styles for selected item
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
    );
}