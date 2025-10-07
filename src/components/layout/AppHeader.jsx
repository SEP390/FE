import {LogoutOutlined, MenuOutlined} from "@ant-design/icons";
import {Button, Popconfirm} from "antd";
import React from "react";
import {Header} from "antd/es/layout/layout.js";
import {useNavigate} from "react-router";

export function AppHeader({ toggleSideBar }) {
    const navigate = useNavigate();
    const onLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    }

    return <>
        <Header className={"!bg-white p-2"}>
            <MenuOutlined onClick={toggleSideBar} className={"text-lg cursor-pointer mr-2"}/>
            <div className={"float-right"}>
                <Popconfirm onConfirm={onLogout} title={"Do you want to logout?"} icon={<LogoutOutlined />}>
                    <Button>Logout</Button>
                </Popconfirm>
            </div>
        </Header>
    </>
}