import { CalendarOutlined, ToolOutlined } from "@ant-design/icons";
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
                <Bed size={32} />
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


