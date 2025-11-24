import {LayoutGuard} from "../../../../components/layout/LayoutGuard.jsx";
import {PageHeader} from "../../../../components/PageHeader.jsx";
import {Button, Form, InputNumber, Table} from "antd";
import {RoomSelect} from "../../../../components/RoomSelect.jsx";
import {create} from "zustand";
import {useEffect} from "react";
import {useApiStore} from "../../../../hooks/useApiStore.js";
import {useUpdateEffect} from "../../../../hooks/useUpdateEffect.js";
import {createApiStore} from "../../../../util/createApiStore.js";

const createEWRoomStore = createApiStore("POST", "/ew/room")
const ewRoomStore = createApiStore("GET", "/ew/room")

const useStore = create(set => ({
    roomId: null,
    setRoomId: (roomId) => set({roomId})
}))

function RecentRecord() {
    const {roomId, setRoomId} = useStore();
    const {mutate, data} = useApiStore(ewRoomStore)

    useEffect(() => {
        mutate({ roomId })
    }, [mutate, roomId]);

    return <div className={"section"}>
        <div className={"font-medium mb-3"}>Các lần nhập gần nhất</div>
        <Table bordered dataSource={data ? data.content : []} columns={[
            {
                title: "Phòng",
                dataIndex: ["room", "roomNumber"]
            },
            {
                title: "Kỳ",
                dataIndex: ["semester", "name"]
            },
            {
                title: "Số điện",
                dataIndex: "electric"
            },
            {
                title: "Số nước",
                dataIndex: "water"
            },
            {
                title: "Sử dụng điện",
                dataIndex: "electricUsed"
            },
            {
                title: "Sử dụng nước",
                dataIndex: "waterUsed"
            },
            {
                title: "Ngày nhập",
                dataIndex: "createDate"
            },
        ]}/>
    </div>
}

export default function GuardCreateEW() {
    const {roomId, setRoomId} = useStore();
    const {fetch} = ewRoomStore()
    const [form] = Form.useForm()

    const {mutate, data} = useUpdateEffect(createEWRoomStore, "Thành công")

    useEffect(() => {
        console.log(roomId)
    }, [roomId]);

    const onFinish = (value) => {
        mutate(value).then(fetch)
    }

    return <LayoutGuard active={"electric-water"}>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={"Tạo bản ghi mới"} back={"/pages/guard/ew"} />
            <div className={"section"}>
                <Form onFinish={onFinish} form={form} labelCol={{span: 5}} className={"md:w-100"}>
                    {(fields) => (
                        <>
                            <Form.Item rules={[{
                                required: true, message: "",
                            }]} label={"Phòng"} name={"roomId"}>
                                <RoomSelect value={roomId} onChange={setRoomId} />
                            </Form.Item>
                            <Form.Item rules={[{
                                required: true, message: "",
                            }]} label={"Số điện"} name={"electric"}>
                                <InputNumber suffix={"kW"} className={"!w-full"} />
                            </Form.Item>
                            <Form.Item rules={[{
                                required: true, message: "",
                            }]} label={"Số điện"} name={"water"}>
                                <InputNumber suffix={"m3"} className={"!w-full"} />
                            </Form.Item>
                            <Form.Item label={null}>
                                <Button type={"primary"} htmlType={"submit"}>Nhập</Button>
                            </Form.Item>
                        </>
                    )}
                </Form>
            </div>
            {roomId && <RecentRecord />}
        </div>
    </LayoutGuard>
}