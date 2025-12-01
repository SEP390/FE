import {LayoutGuard} from "../../../../components/layout/LayoutGuard.jsx";
import {PageHeader} from "../../../../components/PageHeader.jsx";
import {Button, Form, InputNumber, Table, Tag} from "antd";
import {RoomSelect} from "../../../../components/RoomSelect.jsx";
import {create} from "zustand";
import {useEffect, useState} from "react";
import {useApiStore} from "../../../../hooks/useApiStore.js";
import {useUpdateEffect} from "../../../../hooks/useUpdateEffect.js";
import {createApiStore} from "../../../../util/createApiStore.js";
import {ThunderboltOutlined} from "@ant-design/icons";
import {CalendarDays, Droplet, House} from "lucide-react";
import {formatDate} from "../../../../util/formatTime.js";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axiosClient from "../../../../api/axiosClient/axiosClient.js";
import useErrorNotification from "../../../../hooks/useErrorNotification.js";

const createEWRoomStore = createApiStore("POST", "/ew/room")
const ewRoomStore = createApiStore("GET", "/ew/room")

const useStore = create(set => ({
    roomId: null,
    setRoomId: (roomId) => set({roomId})
}))

function RecentRecord() {
    const {roomId} = useStore();

    const [page, setPage] = useState(0);

    const {data} = useQuery({
        queryKey: ["ew-room", roomId, page],
        queryFn: () => axiosClient.get("/ew/room", {
            params: {roomId, sort: "createDate,DESC", page},
        }).then(res => res.data)
    });

    const onChange = ({current}, filter, sorter) => {
        setPage(current - 1)
    }

    return <div className={"section"}>
        <div className={"font-medium mb-3"}>Các lần nhập gần nhất</div>
        <Table bordered dataSource={data ? data.content : []} columns={[
            {
                title: "Phòng",
                dataIndex: ["room", "roomNumber"],
                render: (val) => <span className={"flex gap-1 items-center"}><House size={14}/>{val}</span>
            },
            {
                title: "Kỳ",
                dataIndex: ["semester", "name"],
                render: (val) => <Tag>{val}</Tag>
            },
            {
                title: "Số điện",
                dataIndex: "electric",
                render: (val) => <span
                    className={"flex gap-1 items-center"}><ThunderboltOutlined/>{val} kW</span>,
            },
            {
                title: "Số nước",
                dataIndex: "water",
                render: (val) => <span className={"flex gap-1 items-center"}><Droplet size={14}/>{val}<span>m<sup>3</sup></span></span>,
            },
            {
                title: "Sử dụng điện",
                dataIndex: "electricUsed",
                render: (val) => <span
                    className={"flex gap-1 items-center"}><ThunderboltOutlined/>{val} kW</span>,
            },
            {
                title: "Sử dụng nước",
                dataIndex: "waterUsed",
                render: (val) => <span className={"flex gap-1 items-center"}><Droplet size={14}/>{val}<span>m<sup>3</sup></span></span>,
            },
            {
                title: "Ngày nhập",
                dataIndex: "createDate",
                render: (val) => <span className={"flex gap-1 items-center"}><CalendarDays size={14}/>{formatDate(val)}</span>,
            },
        ]} pagination={{
            current: page + 1,
            total: data?.page?.totalElements,
        }} onChange={onChange}/>
    </div>
}

export default function GuardCreateEW() {
    const queryClient = useQueryClient()
    const {roomId, setRoomId} = useStore();
    const {fetch} = ewRoomStore()
    const [form] = Form.useForm()

    const {mutate, error} = useMutation({
        mutationFn: (val) => axiosClient.post("/ew/room", val),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["ew-room"]
            })
        }
    })

    useErrorNotification(error)

    useEffect(() => {
        if (form && roomId) {
            axiosClient.get("/ew/room/latest", {
                params: { roomId }
            }).then(res => res.data).then(data => {
                form.setFieldsValue({roomId, ...data})
            })
        }
    }, [form, roomId]);

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
                            }]} label={"Số nước"} name={"water"}>
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