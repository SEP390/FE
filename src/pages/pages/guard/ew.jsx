import {LayoutGuard} from "../../../components/layout/LayoutGuard.jsx";
import {PageHeader} from "../../../components/PageHeader.jsx";
import {App, Button, Form, Input, InputNumber, Modal, Table, Tag} from "antd";
import {CalendarDays, Droplet, House, Plus} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {RoomFilter, RoomSelect} from "../../../components/RoomSelect.jsx";
import {DateRangeFilter} from "../../../components/DateRangeSelect.jsx";
import {create} from "zustand";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import dayjs from "dayjs";
import {ThunderboltOutlined} from "@ant-design/icons";
import {formatDate} from "../../../util/formatTime.js";
import {useEffect} from "react";
import useErrorNotification from "../../../hooks/useErrorNotification.js";
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";

const filterStore = create(set => ({
    roomId: null,
    page: 0,
    sort: "createDate,DESC",
    setRoomId: (roomId) => set({roomId}),
    onChange: ({current}) => set({page: current - 1})
}))

const useModal = create(set => ({
    data: null,
    isOpen: false,
    open: (data) => set({data, isOpen: true}),
    close: () => set({data: null, isOpen: false}),
}))

function EWRoomEditModal() {
    const {isOpen, close, data} = useModal()
    const [form] = Form.useForm()
    const queryClient = useQueryClient()
    useEffect(() => {
        form && data && form.setFieldsValue({
            roomId: data.room.id,
            ...data
        })
    }, [form, data]);

    const {notification} = App.useApp()
    const {mutate, error} = useMutation({
        mutationFn: (value) => axiosClient.put("/ew/room", value).then(res => res.data),
        onSuccess: () => {
            notification.success({message: "Sửa thành công"})
            queryClient.invalidateQueries({
                queryKey: ["ew-room"]
            })
            close()
        }
    })

    useErrorNotification(error)

    const onFinish = (value) => {
        mutate(value)
    }

    return <Modal onOk={() => form.submit()} title={"Sửa"} open={isOpen} onCancel={close}>
        {data && (
            <>
                <Form labelCol={{span: 6}} onFinish={onFinish} form={form} initialValues={{
                    roomId: data.room.id,
                    ...data
                }}>
                    <Form.Item hidden name={"id"}>
                        <Input />
                    </Form.Item>
                    <Form.Item label={"Phòng"} name={"roomId"}>
                        <RoomSelect disabled={true} value={data.roomId}/>
                    </Form.Item>
                    <Form.Item label={"Điện sử dụng"} name={"electricUsed"}>
                        <InputNumber disabled className={"!w-full"} suffix={"kW"}/>
                    </Form.Item>
                    <Form.Item label={"Nước sử dụng"} name={"waterUsed"}>
                        <InputNumber disabled className={"!w-full"} suffix={"m3"}/>
                    </Form.Item>
                    <Form.Item rules={[{
                        required: true, message: "",
                    }]} label={"Số điện"} name={"electric"}>
                        <InputNumber suffix={"kW"} className={"!w-full"}/>
                    </Form.Item>
                    <Form.Item rules={[{
                        required: true, message: "",
                    }]} label={"Số nước"} name={"water"}>
                        <InputNumber suffix={"m3"} className={"!w-full"}/>
                    </Form.Item>
                </Form>
            </>
        )}
    </Modal>
}

export default function GuardEW() {
    const {open} = useModal()
    const navigate = useNavigate();
    const {roomId, setRoomId, page, onChange, sort} = filterStore();
    const {data} = useQuery({
        queryKey: ["ew-room", roomId, page, sort],
        queryFn: () => axiosClient.get("ew/room", {
            params: {roomId, page, sort}
        }).then(res => res.data)
    })

    return <RequireRole role={"GUARD"}><LayoutGuard active={"electric-water"}>
        <EWRoomEditModal/>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={"Nhập điện nước"}/>
            <div className={"section flex gap-3"}>
                <div>
                    <div className={"flex gap-3 flex-wrap"}>
                        <RoomFilter value={roomId} onChange={setRoomId}/>
                        <DateRangeFilter/>
                    </div>
                </div>
                <div className={"ml-auto"}>
                    <Button onClick={() => navigate("/pages/guard/ew/create")} icon={<Plus size={14}/>}>Tạo bản ghi
                        mới</Button>
                </div>
            </div>
            <div className={"section"}>
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
                        render: (val) => <span className={"flex gap-1 items-center"}><Droplet
                            size={14}/>{val}<span>m<sup>3</sup></span></span>,
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
                        render: (val) => <span className={"flex gap-1 items-center"}><Droplet
                            size={14}/>{val}<span>m<sup>3</sup></span></span>,
                    },
                    {
                        title: "Ngày nhập",
                        dataIndex: "createDate",
                        render: (val) => <span className={"flex gap-1 items-center"}><CalendarDays
                            size={14}/>{formatDate(val)}</span>,
                    },
                    {
                        title: "Hành động",
                        render: (val, row) => (
                            <>
                                {row.createDate === dayjs().format("YYYY-MM-DD") && (
                                    <>
                                        <Button onClick={() => open(row)} type={"link"}>Sửa</Button>
                                    </>
                                )}
                            </>
                        )
                    }
                ]} pagination={{
                    showTotal: (total) => <span>Tổng cộng <span className={"font-medium"}>{total}</span> bản ghi</span>,
                    current: page + 1,
                    total: data?.content?.totalElements
                }}/>
            </div>
        </div>
    </LayoutGuard></RequireRole>
}