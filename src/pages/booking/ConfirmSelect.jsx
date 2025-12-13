import {useQuery} from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import {SlotPaymentButton} from "../../components/booking/SlotPaymentButton.jsx";
import {formatPrice} from "../../util/formatPrice.js";
import {Descriptions, Tag} from "antd";
import {formatDate} from "../../util/formatTime.js";

export function ConfirmSelect({room, slot}) {
    const {data: nextSemester} = useQuery({
        queryKey: ["next-semester"],
        queryFn: () => axiosClient.get("/semesters/next").then(res => res.data)
    })
    const {data: profile} = useQuery({
        queryKey: ["profile"],
        queryFn: () => axiosClient.get("/users/profile").then(res => res.data)
    })

    const {data: ewPrice} = useQuery({
        queryKey: ["ew-price"],
        queryFn: () => axiosClient.get("/ew/price").then(res => res.data)
    })

    const userCode = profile?.studentId
    const username = profile?.username
    const dormName = room.dorm.dormName
    const roomNumber = room.roomNumber
    const slotName = slot.slotName
    const semesterName = nextSemester?.name
    const semesterDate = [nextSemester?.startDate, nextSemester?.endDate]
    const price = room.pricing.price
    const electricPrice = ewPrice?.electricPrice
    const waterPrice = ewPrice?.waterPrice
    const maxElectricIndex = ewPrice?.maxElectricIndex
    const maxWaterIndex = ewPrice?.maxWaterIndex

    return <div className={"grid md:grid-cols-2 gap-3"}>
        <div className={"section"}>
            <div className={"mb-3 font-medium"}>Xác nhận</div>
            <Descriptions items={[
                {
                    label: "Mã sinh viên",
                    children: userCode
                },
                {
                    label: "Sinh viên",
                    children: username
                },
                {
                    label: "Dorm",
                    children: dormName
                },
                {
                    label: "Phòng",
                    children: roomNumber
                },
                {
                    label: "Slot",
                    children: slotName
                },
                {
                    label: "Kỳ",
                    children: <Tag>{semesterName}</Tag>
                },
                {
                    label: "Thời gian",
                    children: `${formatDate(semesterDate[0])} - ${formatDate(semesterDate[1])}`
                },
            ]}/>
        </div>
        <div className={"section flex flex-col gap-3"}>
            <div className={"font-medium"}>Thanh toán</div>
            <div className={""}>
                <div className={"text-gray-400"}>Giá điện</div>
                <div className={""}>{formatPrice(electricPrice)} / 1 kW, miễn phí <span>{maxElectricIndex}</span> kW đầu
                    tiên
                </div>
            </div>
            <div className={""}>
                <div className={"text-gray-400"}>Giá nước</div>
                <div className={""}>{formatPrice(waterPrice)} / 1 m3, miễn phí <span>{maxWaterIndex}</span> m3 đầu tiên
                </div>
            </div>
            <div className={"ml-auto"}>
                <div>Giá tổng cộng</div>
                <div className={"font-medium text-2xl"}>{formatPrice(price)}</div>
            </div>
            <SlotPaymentButton type={"primary"} size={"large"} slotId={slot?.id}/>
        </div>
    </div>
}
