import axiosClient from "../../api/axiosClient/axiosClient.js";
import {Alert} from "antd";
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {useQuery} from "@tanstack/react-query";
import {PageHeader} from "../../components/PageHeader.jsx";
import {CurrentSlot} from "../../components/booking/CurrentSlot.jsx";
import {CreateBooking} from "../../components/booking/CreateBooking.jsx";
import {RequireRole} from "../../components/authorize/RequireRole.jsx";

export default function BookingPage() {
    const {data, isError, error, isSuccess} = useQuery({
        queryKey: ["current-slot"],
        queryFn: () => axiosClient.get("/slots/current").then(res => res.data),
        retry: false,
    })

    return <RequireRole role={"RESIDENT"}><AppLayout activeSidebar={"booking"}>
        <div className={"flex-grow flex gap-3 flex-col"}>
            {isError && (
                <>
                    <PageHeader title={"Đặt phòng"}/>
                    <div className={"section"}>
                        <Alert showIcon closable type={"error"} message={"Lỗi"} description={error.message}/>
                    </div>
                </>
            )}
            {isSuccess && !data && <CreateBooking/>}
            {isSuccess && data && <CurrentSlot/>}
        </div>
    </AppLayout></RequireRole>
}