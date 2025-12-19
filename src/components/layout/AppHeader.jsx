import {LogoutOutlined, MenuOutlined} from "@ant-design/icons";
import {Button, Popconfirm, Layout, Space} from "antd";
import React from "react";
import {useNavigate} from "react-router-dom";
import {useToken} from "../../hooks/useToken.js";
import {Bed} from "lucide-react";

const {Header} = Layout;

export function AppHeader({ toggleSideBar, header, collapsed = false }) {
    const navigate = useNavigate();
    const {setToken} = useToken();

    const onLogout = () => {
        setToken(null);
        navigate("/");
    }

    return (
        <Header
            className="!bg-gradient-to-r from-blue-600 to-blue-500 shadow-md px-4 flex items-center justify-between fixed top-0 z-[1000] h-16"
            style={{
                // Header spans full viewport width and anchors to left
                width: '100%',
                left: 0,
                transition: 'all 0.3s ease',
            }}
        >
            <div className="flex items-center gap-4">
                <MenuOutlined
                    onClick={toggleSideBar}
                    className="text-xl cursor-pointer text-white hover:text-blue-100 transition-colors"
                />
                <div className="flex items-center gap-3">
                    <Bed size={28} className="text-white" />
                    <span className="text-white font-semibold text-lg hidden sm:inline">
                        {header || "Hệ thống quản lý KTX"}
                    </span>
                </div>
            </div>

            <Space size="middle">
                <Popconfirm
                    onConfirm={onLogout}
                    title="Bạn có chắc muốn đăng xuất?"
                    icon={<LogoutOutlined className="text-red-500" />}
                    okText="Đăng xuất"
                    cancelText="Hủy"
                >
                    <Button
                        type="primary"
                        danger
                        icon={<LogoutOutlined />}
                        className="shadow-sm hover:shadow-md transition-shadow"
                    >
                        <span className="hidden sm:inline">Đăng xuất</span>
                    </Button>
                </Popconfirm>
            </Space>
        </Header>
    );
}