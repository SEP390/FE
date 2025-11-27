import {useQuery} from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import {Alert, Tabs} from "antd";
import CreateBookingY2 from "../../pages/pages/booking/y2.jsx";
import {CreateBookingY1} from "./CreateBookingY1.jsx";

export function CreateBooking() {
    const {data, error} = useQuery({
        queryKey: ["user-slot-history"],
        queryFn: () => axiosClient.get("/user/slot-history").then(res => res.data),
        retry: false
    })

    if (error) {
        return (
            <>
                <Alert showIcon type={"error"} message={"Lỗi"} description={error.message}/>
            </>
        )
    }

    if (data && data.content.length > 0) {
        return <Tabs defaultActiveKey={"y1"} items={[
            {
                key: "y2",
                label: "Đặt chọn phòng",
                children: <div className={"flex flex-col gap-3"}><CreateBookingY2/></div>
            },
            {
                key: "y1",
                label: "Đặt theo phù hợp",
                children: <div className={"flex flex-col gap-3"}><CreateBookingY1/></div>
            },
        ]} />
    }
    if (data && data.content.length === 0) {
        return <CreateBookingY1/>
    }
}
