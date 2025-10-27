import {Layout, Menu} from "antd";
import {Bed} from "lucide-react";
import {HomeOutlined, ThunderboltOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";

/**
 * @typedef {import("antd").GetProp} GetProp
 * @typedef {import("antd").MenuProps} MenuProps
 * @typedef {GetProp<MenuProps, 'items'>} MenuItems
 */

/**
 * @type {MenuItems}
 */
const items = [
    {
        key: "home",
        icon: <HomeOutlined />,
        label: <Link to={"/"}>Home</Link>,
    },
    {
        key: "electric-water",
        icon: <ThunderboltOutlined />,
        label: <Link to={"/guard/electric-water"}>Điện nước</Link>,
    }
]

export function SideBarGuard({active, collapsed}) {
    return <Layout.Sider trigger={null}
                         collapsible
                         collapsed={collapsed}
                         theme="light"
                         className={"bg-white border-r border-gray-200"}>
        <div className="flex items-center justify-center py-4">
            <Bed />
        </div>
        <Menu
            mode="inline"
            defaultSelectedKeys={[active]}
            className={"!border-0"}
            items={items}
        />
    </Layout.Sider>
}