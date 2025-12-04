import {useQuery} from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import dayjs from "dayjs";
import {Alert, Button, Form, Input, InputNumber, Skeleton} from "antd";
import {formatDate} from "../../util/formatTime.js";
import {Link} from "react-router-dom";
import {create} from "zustand";
import isBetween from "dayjs/plugin/isBetween";
import {formatPrice} from "../../util/formatPrice.js";
import {cn} from "../../util/cn.js";
import {Bed} from "lucide-react";
import {SlotPaymentButton} from "./SlotPaymentButton.jsx";
import {useEffect} from "react";
import {DateRangeSelect} from "../DateRangeSelect.jsx";

dayjs.extend(isBetween);
const useSelectStore = create(set => ({
    recentRoom: null,
    selectedRoom: null,
    selectedSlot: null,
    nextSemester: null,
    setSelectedRoom: (selectedRoom) => set({selectedRoom}),
    setSelectedSlot: (selectedSlot) => set({selectedSlot}),
}))

function MatchingRoom({data}) {
    const {selectedRoom, setSelectedRoom, setSelectedSlot} = useSelectStore();
    const {roomNumber, matching, dorm, slots, pricing} = data;
    const {dormName} = dorm;
    const availableSlot = slots.filter(s => s.status === "AVAILABLE").length;
    const totalSlot = slots.length;
    const {price} = pricing;

    const onClick = () => {
        setSelectedSlot(null)
        if (selectedRoom && selectedRoom.id === data.id) {
            setSelectedRoom(null)
            return;
        }
        setSelectedRoom(data)
    }

    return <div onClick={onClick}
                className={cn({
                    "!border-blue-200 bg-blue-50": selectedRoom && selectedRoom.id === data.id
                }, "hover:cursor-pointer hover:shadow-lg transition-all w-full border rounded-lg border-gray-200 p-5 relative")}>
        <div className={"absolute top-3 right-3"}>
            <div
                className={cn({
                    "!border-blue-200 !bg-blue-100": selectedRoom && selectedRoom.id === data.id
                }, "rounded-full text-sx text-gray-500 border border-gray-300 bg-gray-50 w-12 h-12 flex items-center justify-center")}>{matching.toFixed(1)}%
            </div>
        </div>
        <div className={"font-medium mb-3"}>{dormName} - {roomNumber}</div>
        <div className={"text-gray-500 mb-3"}>Số giường còn trống: {availableSlot}/{totalSlot}</div>
        <div className={"text-xl font-medium"}>{formatPrice(price)}</div>
    </div>
}

function SelectSlot() {
    const {selectedRoom} = useSelectStore();

    return <div className={"section"}>
        <div className={"font-medium mb-3"}>Chọn slot</div>
        <div className={"flex gap-3 flex-wrap"}>
            {selectedRoom.slots.map(slot => <SlotItem key={slot.id} data={slot}/>)}
        </div>
    </div>
}

function SlotItem({data}) {
    const {selectedSlot, setSelectedSlot} = useSelectStore();
    const onClick = () => {
        if (data.status !== "AVAILABLE") return;
        if (selectedSlot && selectedSlot.id === data.id) {
            setSelectedSlot(null)
            return;
        }
        setSelectedSlot(data)
    }
    return <div
        onClick={onClick}
        className={cn("border border-gray-200 p-5 rounded-lg transition-all", {
            "!border-blue-200 bg-blue-50": selectedSlot && selectedSlot.id === data.id,
            "hover:cursor-pointer hover:shadow-lg": data.status === "AVAILABLE",
            "bg-gray-100 select-none": data.status !== "AVAILABLE",
        })}>
        <Bed/><span>{data.slotName}</span>
    </div>
}

function ConfirmSelect() {
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
    const {selectedSlot, selectedRoom} = useSelectStore();
    const [form] = Form.useForm()
    const [form2] = Form.useForm()

    useEffect(() => {
        form2.setFieldsValue({
            price: selectedRoom.pricing.price,
            electricPrice: ewPrice?.electricPrice,
            waterPrice: ewPrice?.waterPrice,
            maxElectricIndex: ewPrice?.maxElectricIndex,
            maxWaterIndex: ewPrice?.maxWaterIndex,
        })
    }, [form2, selectedRoom, ewPrice]);

    useEffect(() => {
        form.setFieldsValue({
            dormName: selectedRoom.dorm.dormName,
            roomNumber: selectedRoom.roomNumber,
            slotName: selectedSlot.slotName,
            username: profile?.username,
            userCode: profile?.studentId,
            semesterName: nextSemester?.name,
            semesterDate: nextSemester ? [dayjs(nextSemester.startDate), dayjs(nextSemester.endDate)] : null,
        })
    }, [selectedSlot, selectedRoom, form, nextSemester, profile, ewPrice]);

    return <div className={"grid md:grid-cols-2 gap-3"}>
        <div className={"section"}>
            <div className={"mb-3 font-medium"}>Xác nhận</div>
            <Form layout={"vertical"} form={form}>
                <div className={"flex gap-3 *:flex-grow flex-wrap"}>
                    <Form.Item label={"Mã sinh viên"} name={"userCode"}>
                        <Input/>
                    </Form.Item>
                    <Form.Item label={"Sinh viên"} name={"username"}>
                        <Input/>
                    </Form.Item>
                </div>
                <div className={"flex gap-3 *:flex-grow flex-wrap"}>
                    <Form.Item label={"Dorm"} name={"dormName"}>
                        <Input/>
                    </Form.Item>
                    <Form.Item label={"Phòng"} name={"roomNumber"}>
                        <Input/>
                    </Form.Item>
                    <Form.Item label={"Slot"} name={"slotName"}>
                        <Input/>
                    </Form.Item>
                </div>
                <div className={"flex gap-3 *:flex-grow flex-wrap"}>
                    <Form.Item label={"Kỳ"} name={"semesterName"}>
                        <Input/>
                    </Form.Item>
                    <Form.Item label={"Thời gian"} name={"semesterDate"}>
                        <DateRangeSelect format={"DD/MM/YYYY"} className={"w-full"}/>
                    </Form.Item>
                </div>
            </Form>
        </div>
        <div className={"section flex flex-col gap-3"}>
            <div className={"font-medium"}>Thanh toán</div>
            <Form className={"flex flex-col gap-3 h-full"} layout={"vertical"} form={form2}>
                <div className={"flex gap-3 *:flex-grow flex-wrap"}>
                    <Form.Item label={"Giá điện"} name={"electricPrice"}>
                        <InputNumber suffix={"vnđ/kW"} className={"!w-full"}/>
                    </Form.Item>
                    <Form.Item label={"Giá nước"} name={"waterPrice"}>
                        <InputNumber suffix={"vnđ/m3"} className={"!w-full"}/>
                    </Form.Item>
                </div>
                <div className={"flex gap-3 *:flex-grow flex-wrap"}>
                    <Form.Item label={"Số điện miễn phí"} name={"maxElectricIndex"}>
                        <InputNumber suffix={"kW"} className={"!w-full"}/>
                    </Form.Item>
                    <Form.Item label={"Số nước miễn phí"} name={"maxWaterIndex"}>
                        <InputNumber suffix={"m3"} className={"!w-full"}/>
                    </Form.Item>
                </div>
                <div className={"flex flex-grow flex-col gap-3 justify-between"}>
                    <div className={"ml-auto"}>
                        <div>Giá</div>
                        <div className={"font-medium text-2xl"}>{formatPrice(selectedRoom.pricing.price)}</div>
                    </div>
                    <SlotPaymentButton type={"primary"} size={"large"} slotId={selectedSlot?.id}/>
                </div>
            </Form>
        </div>
    </div>
}

export function CreateBookingY1() {
    const {data: userSlotHistory} = useQuery({
        queryKey: ["user-slot-history"],
        queryFn: () => axiosClient.get("/user/slot-history").then(res => res.data),
        retry: false
    })
    const {data: timeConfig, error: timeConfigError} = useQuery({
        queryKey: ["current-time-config"],
        queryFn: () => axiosClient.get("/time-config/current").then(res => res.data),
        retry: false,
    })
    const {isLoading, data, isSuccess, isError, error} = useQuery({
        queryKey: ["rooms-matching"],
        queryFn: () => axiosClient.get("/rooms-matching").then(res => res.data),
        retry: false
    })
    const {selectedRoom, selectedSlot} = useSelectStore()

    const errorCode = error?.response?.data?.message || error?.message;

    if (timeConfigError) return (
        <>
            <div className={"section"}>
                <div className={"font-medium text-lg"}>Đặt phòng</div>
            </div>
            <div className={"section"}>
                <Alert showIcon type={"info"} message={"Chưa đến thời gian đặt phòng"}/>
            </div>
        </>
    )

    if (!timeConfig) return <></>

    let {startBookingDate, endBookingDate} = timeConfig;
    if (userSlotHistory && userSlotHistory.content.length > 0) {
        startBookingDate = timeConfig.startExtendDate;
        endBookingDate = timeConfig.endExtendDate;
    }
    if (!dayjs().isBetween(startBookingDate, endBookingDate, 'day', '[]')) {
        return (
            <>
                <div className={"section"}>
                    <div className={"font-medium text-lg"}>Đặt phòng</div>
                </div>
                <div className={"section"}>
                    <Alert showIcon type={"info"}
                           message={"Thông tin"}
                           description={`Chưa đến thời gian đặt phòng (${formatDate(startBookingDate)} - ${formatDate(endBookingDate)})`}/>
                </div>
            </>
        )
    }

    return <>
        <div className={"section"}>
            <div className={"font-medium text-lg"}>Đặt phòng</div>
        </div>
        <div className={"section"}>
            {isLoading && <>
                <Skeleton active={isLoading}/>
            </>}
            {isError && <>
                <Alert showIcon type={"info"} message={"Thông tin"} closable={true}
                       description={{
                           SURVEY_NOT_FOUND: "Bạn không thể đặt phòng nếu chưa hoàn thành khảo sát",
                           BOOKING_DATE_NOT_START: "Chưa đến thời gian đặt phòng",
                           TIME_CONFIG_NOT_FOUND: "Chưa đến thời gian đặt phòng"
                       }[errorCode] || errorCode}/>
                {errorCode === "SURVEY_NOT_FOUND" && (
                    <>
                        <div className={"mt-5"}>
                            <Link to={"/survey"}><Button>Chuyển trang sang điền khảo sát</Button></Link>
                        </div>
                    </>
                )}
            </>}
            {isSuccess && <>
                <div className={"font-medium mb-3"}>Top 5 phòng phù hợp nhất</div>
                <div className={"grid lg:grid-cols-3 gap-5"}>
                    {data.map(data => <MatchingRoom key={data.id} data={data}/>)}
                </div>
            </>}
        </div>
        {selectedRoom && <SelectSlot/>}
        {selectedRoom && selectedSlot && <ConfirmSelect/>}
    </>
}
