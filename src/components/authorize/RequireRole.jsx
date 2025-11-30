import axiosClient from "../../api/axiosClient/axiosClient.js";
import {useNavigate} from "react-router-dom";
import {App, Spin} from "antd";
import {useCallback, useEffect, useRef, useState} from "react";
import axios from "axios";

export function RequireRole({children, role}) {
    const navigate = useNavigate();
    const [allowView, setAllowView] = useState(false);
    const {notification} = App.useApp()

    const roleRef = useRef(role)

    const showNotification = useCallback((role) => {
        notification.error({message: "Bạn không có quyền vào trang này!"});
        if (!role) navigate("/login")
        else if (role === "MANAGER") navigate("/manager")
        else if (role === "GUARD") navigate("/guard/requests")
        else if (role === "TECHNICAL") navigate("/technical/requests")
        else navigate("/");
    }, [navigate, notification])

    useEffect(() => {
        const controller = new AbortController();
        axiosClient.get("/users/profile", {
            signal: controller.signal,
        }).then(res => res.data).then(data => {
            const role = roleRef.current;
            if (typeof role === "string") {
                if (data.role === role) {
                    setAllowView(true)
                } else {
                    showNotification(data.role)
                }
            } else if (role instanceof Array) {
                if (role.indexOf(data.role) !== -1) {
                    setAllowView(true)
                } else {
                    showNotification(data.role)
                }
            }
        }).catch(err => {
            if (!axios.isCancel(err)) {
                showNotification()
            }
        })
        return () => {
            controller.abort();
        }
    }, [navigate, notification, showNotification]);

    return (
        <>
            <Spin spinning={!allowView}>
                {children}
            </Spin>
        </>
    )
}