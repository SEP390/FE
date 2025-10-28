import {
    ScheduleOutlined,
    InfoCircleOutlined,
    WarningOutlined,
    FileTextOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider.js";
import { Menu } from "antd";
import { Link } from "react-router-dom";
import { Bed } from "lucide-react";

const items = [
    {
        label: <Link to={"/guard/schedule"}>Lịch làm việc</Link>,
        icon: <ScheduleOutlined />,
        key: "guard-schedule",
    },
    {
        label: <Link to={"/guard/rooms"}>Thông tin phòng</Link>,
        icon: <InfoCircleOutlined />,
        key: "guard-rooms",
    },
    {
        label: <Link to={"/guard/violations"}>Báo cáo vi phạm</Link>,
        icon: <WarningOutlined />,
        key: "guard-violations",
    },
    {
        label: <Link to={"/guard/requests"}>Yêu cầu của sinh viên</Link>,
        icon: <FileTextOutlined />,
        key: "guard-requests",
    },
    {
        label: <Link to={"/guard/electric-water"}>Nhập liệu số điện</Link>,
        icon: <ThunderboltOutlined />,
        key: "guard-electric-water",
    },
];

export function GuardSidebar({ collapsed, active }) {
    return (
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
                selectedKeys={[active]}
                className={"!border-0"}
                items={items}
            />
        </Sider>
    );
}

