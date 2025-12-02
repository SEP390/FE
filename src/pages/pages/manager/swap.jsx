import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {RoomSelect} from "../../../components/RoomSelect.jsx";
import {useSearchParams} from "react-router-dom";
import {Alert, App, Button, Form} from "antd";
import {ResidentSelect} from "../../../components/ResidentSelect.jsx";
import {SlotSelect} from "../../../components/SlotSelect.jsx";
import {PageHeader} from "../../../components/PageHeader.jsx";
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import {useQuery} from "@tanstack/react-query";
import {formatPrice} from "../../../util/formatPrice.js";
import {useState} from "react";
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";
import {CurrentRoomInput} from "../../../components/CurrentRoomInput.jsx";
import {RoomPricingSelect} from "../../../components/RoomPricingSelect.jsx";

function SwapDetail({roomId, userId}) {
    const {data, error} = useQuery({
        queryKey: ["swap-detail", roomId, userId],
        queryFn: () => axiosClient.get("/slots/swap/detail", {
            params: {
                roomId, userId
            }
        }).then(res => res.data),
    })

    if (!data) return <></>

    return <>
        {!data.old && (
            <Form.Item label={null}>
                <div className={"text-red-600"}>Sinh viên không ở trong phòng</div>
            </Form.Item>
        )}
        {data.old && data.new && (
            <>
                <Form.Item label={null}>
                    {data.old.pricing.price > data.new.pricing.price && (
                        <>
                            <div className={"text-red-600"}>Không thể đổi sang phòng có giá thấp hơn phòng hiện tại</div>
                        </>
                    )}
                    {data.swapable && data.new.pricing.price === data.old.pricing.price && (
                        <>
                            <div>Giá bằng nhau, không tạo hóa đơn phụ trội</div>
                        </>
                    )}
                    {data.swapable && data.new.pricing.price > data.old.pricing.price && (
                        <>
                            <div>Sẽ tạo hóa đơn phụ trội giá <span
                                className={"font-medium"}>{formatPrice(data.new.pricing.price - data.old.pricing.price)}</span>
                            </div>
                        </>
                    )}
                </Form.Item>
            </>
        )}
    </>
}

export default function SwapSlot() {
    const [params] = useSearchParams()
    const [userId, setUserId] = useState(params.get("userId"))

    const {notification} = App.useApp()
    const onFinish = (value) => {
        console.log(value)
        axiosClient({
            method: "POST",
            url: "/slots/swap",
            data: value
        }).then(res => {
            console.log(res)
            notification.success({message: "Thành công"})
        }).catch(e => {
            console.log(e)
            notification.error({message: e.response?.data?.message || e.message})
        })
    }
    return <RequireRole role={"MANAGER"}><LayoutManager>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={"Đổi phòng"} back={"/pages/manager/slot-usage"}/>
            <div className={"section flex flex-col gap-3"}>
                <Alert className={"md:w-120"} type={"info"} message={"Chỉ có thể đổi phòng sang giá phòng lớn hơn hoặc bằng phòng hiện tại"} />
                <Form onFinish={onFinish} labelCol={{span: 10}} className={"md:w-100"} initialValues={{userId}}>
                    {(fields) => (
                        <>
                            <Form.Item label={"Sinh viên"} name={"userId"}>
                                <ResidentSelect onChange={setUserId}/>
                            </Form.Item>
                            <Form.Item label={"Phòng hiện tại"}>
                                <CurrentRoomInput userId={userId}/>
                            </Form.Item>
                            <Form.Item label={"Loại phòng chuyển đến"} name={"totalSlot"}>
                                <RoomPricingSelect />
                            </Form.Item>
                            {fields.totalSlot && fields.userId && (
                                <>
                                    <Form.Item label={"Chuyển sang phòng"} name={"roomId"}>
                                        <RoomSelect totalSlot={fields.totalSlot} swapUserId={fields.userId}/>
                                    </Form.Item>
                                </>
                            )}
                            {fields.roomId && (
                                <>
                                    <Form.Item label={"Slot"} name={"slotId"}>
                                        <SlotSelect roomId={fields.roomId}/>
                                    </Form.Item>
                                </>
                            )}
                            {userId && (
                                <>
                                    <SwapDetail roomId={fields.roomId} userId={userId}/>
                                </>
                            )}
                            <Form.Item label={null}>
                                <Button htmlType={"submit"}>Đổi phòng</Button>
                            </Form.Item>
                        </>
                    )}
                </Form>
            </div>
        </div>
    </LayoutManager></RequireRole>
}