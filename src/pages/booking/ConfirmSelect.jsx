import {useQuery} from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import {Form, Input, InputNumber} from "antd";
import {useEffect} from "react";
import dayjs from "dayjs";
import {DateRangeSelect} from "../../components/DateRangeSelect.jsx";
import {SlotPaymentButton} from "../../components/booking/SlotPaymentButton.jsx";
import {formatPrice} from "../../util/formatPrice.js";

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
    const [form] = Form.useForm()
    const [form2] = Form.useForm()

    useEffect(() => {
        form2.setFieldsValue({
            price: room.pricing.price,
            electricPrice: ewPrice?.electricPrice,
            waterPrice: ewPrice?.waterPrice,
            maxElectricIndex: ewPrice?.maxElectricIndex,
            maxWaterIndex: ewPrice?.maxWaterIndex,
        })
    }, [form2, room, ewPrice]);

    useEffect(() => {
        form.setFieldsValue({
            dormName: room.dorm.dormName,
            roomNumber: room.roomNumber,
            slotName: slot.slotName,
            username: profile?.username,
            userCode: profile?.studentId,
            semesterName: nextSemester?.name,
            semesterDate: nextSemester ? [dayjs(nextSemester.startDate), dayjs(nextSemester.endDate)] : null,
        })
    }, [slot, room, form, nextSemester, profile, ewPrice]);

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
            <Form layout={"vertical"} form={form2}>
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
                <div className={"flex gap-3 items-end"}>
                    <SlotPaymentButton type={"primary"} size={"large"} slotId={slot?.id}/>
                    <div className={"ml-auto"}>
                        <div>Giá</div>
                        <div className={"font-medium text-2xl"}>{formatPrice(room.pricing.price)}</div>
                    </div>
                </div>
            </Form>
        </div>
    </div>
}
