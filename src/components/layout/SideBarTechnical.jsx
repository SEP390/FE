import { FileTextOutlined, DatabaseOutlined, FormOutlined, HistoryOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Link } from "react-router-dom";
import { Bed } from "lucide-react";

const { Sider } = Layout;

const technicalItems = [
    {
        label: <Link to={"/technical/requests"}>Xem yêu cầu</Link>,
        icon: <FileTextOutlined/>,
        key: "technical-requests",
    },
    {
        label: <Link to={"/technical/reports"}>Tạo báo cáo</Link>,
        icon: <FormOutlined/>,
        key: "technical-create-report",
    },
    {
        label: <Link to={"/technical/inventory"}>Quản lý kho</Link>,
        icon: <DatabaseOutlined/>,
        key: "technical-inventory",
    },
    {
        label: <Link to={"/technical/inventory/history"}>Lịch sử kho</Link>,
        icon: <HistoryOutlined/>,
        key: "technical-inventory-history",
    },
];

export function SideBarTechnical({ collapsed, active }) {
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
                items={technicalItems}
            />
        </Sider>
    );
}


