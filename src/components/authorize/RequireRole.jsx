import {useQuery} from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import {useNavigate} from "react-router-dom";
import {App, Spin} from "antd";

export function RequireRole({children, role}) {
    const navigate = useNavigate();
    const {data, isError, isLoading} = useQuery({
        queryKey: ["profile"],
        queryFn: () => axiosClient.get("/users/profile").then(res => res.data),
    })
    const {notification} = App.useApp()
    if (isLoading) return <Spin spinning={isLoading} fullscreen={true}></Spin>

    if (isError || (data && data.role !== role)) {
        notification.error({message: "Bạn không có quyền vào trang này!"});
        navigate("/");
    }

    return (
        <>
            {children}
        </>
    )
}