import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {RoomFilter, RoomSelect} from "../../../components/RoomSelect.jsx";
import {create} from "zustand";
import {useSearchParams} from "react-router-dom";
import {App, Button, Form} from "antd";
import {ResidentSelect} from "../../../components/ResidentSelect.jsx";
import {SlotSelect} from "../../../components/SlotSelect.jsx";
import {PageHeader} from "../../../components/PageHeader.jsx";
import axiosClient from "../../../api/axiosClient/axiosClient.js";

export default function SwapSlot() {
    const [params] = useSearchParams()
    const userId = params.get("userId")

    const {notification} = App.useApp()
    const onFinish = (value) => {
        console.log(value)
        axiosClient({
            method: "POST",
            url: "/slots/swap",
            data: value
        }).then(res => {
            console.log(res)
            notification.success({message:"Thành công"})
        }).catch(e => {
            console.log(e)
            notification.error({message:e.response?.data?.message || e.message})
        })
    }
    return <LayoutManager>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={"Đổi phòng"} back={"/pages/manager/slot-usage"} />
            <div className={"section"}>
                <Form onFinish={onFinish} labelCol={{span:10}} className={"md:w-100"} initialValues={{ userId }}>
                    {(fields) => (
                        <>
                            <Form.Item label={"Sinh viên"} name={"userId"}>
                                <ResidentSelect />
                            </Form.Item>
                            <Form.Item label={"Chuyển sang phòng"} name={"roomId"}>
                                <RoomSelect />
                            </Form.Item>
                            {fields.roomId && (
                                <>
                                    <Form.Item label={"Slot"} name={"slotId"}>
                                        <SlotSelect roomId={fields.roomId} />
                                    </Form.Item>
                                </>
                            )}
                            <Form.Item label={null}>
                                <Button htmlType={"submit]"}>Đổi phòng</Button>
                            </Form.Item>
                        </>
                    )}
                </Form>
            </div>
        </div>
    </LayoutManager>
}