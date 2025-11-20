import {LogoutOutlined, MenuOutlined} from "@ant-design/icons";
import {Button, Popconfirm, Layout} from "antd";
import React from "react";
import {useNavigate} from "react-router-dom";
import {useToken} from "../../hooks/useToken.js";

const {Header} = Layout;

export function AppHeader({ toggleSideBar, header }) {
    const navigate = useNavigate();
    const {setToken} = useToken();

    const onLogout = () => {
        setToken(null);
        navigate("/");
    }

    return <>
        <Header className={"!bg-white p-2"}>
            <MenuOutlined onClick={toggleSideBar} className={"text-lg cursor-pointer pr-5"}/>
            {header}
            <div className={"float-right"}>
                <Popconfirm onConfirm={onLogout} title={"Do you want to logout?"} icon={<LogoutOutlined />}>
                    <Button>Logout</Button>
                </Popconfirm>
            </div>
        </Header>
    </>
}