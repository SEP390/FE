import {
    CalendarOutlined,
    CarOutlined,
    CoffeeOutlined,
    DollarOutlined,
    HistoryOutlined,
    HomeOutlined,
    ReadOutlined,
    ThunderboltOutlined
} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider.js";
import {Menu} from "antd";
import {Link} from "react-router";

export function SideBar({ collapsed, active }) {
    return <>
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            theme="light"
            style={{
                background: "#fff",
                borderRight: "1px solid #f0f0f0",
            }}
        >
            <div
                className="logo"
                style={{
                    height: 32,
                    margin: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                }}
            >
                Dorm
            </div>

            <Menu mode="inline" defaultSelectedKeys={[active]} style={{borderRight: 0}}>
                <Menu.Item key="home" icon={<HomeOutlined/>}>
                    <Link to={"/"}>Home</Link>
                </Menu.Item>
                <Menu.Item key="news" icon={<ReadOutlined/>}>
                    News
                </Menu.Item>
                <Menu.Item key="booking" icon={<CalendarOutlined/>}>
                    <Link to={"/booking"}>Booking</Link>
                </Menu.Item>
                <Menu.Item key="booking-history" icon={<HistoryOutlined/>}>
                    <Link to={"/booking-history"}>Booking History</Link>
                </Menu.Item>
                <Menu.Item key="survey" icon={<HistoryOutlined/>}>
                    <Link to={"/survey"}>Survey</Link>
                </Menu.Item>
                <Menu.Item key="5" icon={<ThunderboltOutlined/>}>
                    Electricity
                </Menu.Item>
                <Menu.Item key="6" icon={<DollarOutlined/>}>
                    Payment
                </Menu.Item>
                <Menu.Item key="7" icon={<CarOutlined/>}>
                    Parking Ticket
                </Menu.Item>
                <Menu.Item key="8" icon={<CoffeeOutlined/>}>
                    Food Ticket
                </Menu.Item>
            </Menu>
        </Sider>
    </>
}