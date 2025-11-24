import {CalendarOutlined, ToolOutlined, WarningOutlined} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import { Bed } from "lucide-react";

const { Sider } = Layout;

const cleanerItems = [
    {
        label: <Link to={"/cleaner/schedule"}>Lịch làm việc</Link>,
        icon: <CalendarOutlined/>,
        key: "cleaner-schedule",
    },
    {
        label: <Link to={"/cleaner/supplies"}>Quản lý vật tư vệ sinh</Link>,
        icon: <ToolOutlined/>,
        key: "cleaner-supplies",
    },
    {
        label: <Link to={"/cleaner/reports"}>Quản lý báo cáo</Link>,
        icon: <WarningOutlined/>,
        key: "cleaner-reports",
    },
];

export function SideBarCleaner({ collapsed, active }) {
    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            theme="light"
            className={"bg-white border-r border-gray-200"}
        >
            <div className="flex items-center justify-center py-4">
                {/* Sử dụng icon phù hợp hơn cho Quản lý KTX / Vệ sinh */}
                <Bed size={32} className="text-blue-500" />
            </div>

            <Menu
                mode="inline"
                selectedKeys={[active]}
                className={"!border-0"}
                items={cleanerItems}
            />
        </Sider>
    );
}