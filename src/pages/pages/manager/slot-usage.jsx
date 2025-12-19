import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {PageHeader} from "../../../components/PageHeader.jsx";
import {App, Button, Popconfirm, Table, Tag} from 'antd'
import {ResidentFilter} from "../../../components/ResidentSelect.jsx";
import {RoomFilter} from "../../../components/RoomSelect.jsx";
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import {useNavigate} from "react-router-dom";
import {formatTime} from "../../../util/formatTime.js";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import useErrorNotification from "../../../hooks/useErrorNotification.js";
import {create} from "zustand";
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";
import {SemesterFilter} from "../../../components/SemesterSelect.jsx";

function CheckoutButton({slotHistory}) {
    const queryClient = useQueryClient();
    const {notification} = App.useApp();
    const {mutate, error} = useMutation({
        mutationFn: ({id}) => axiosClient.post(`/slots/checkout/${id}`),
        onSuccess: () => {
            notification.success({message: "Checkout thành công"})
            queryClient.invalidateQueries({
                queryKey: ["slot-history"]
            })
        },
    })

    useErrorNotification(error)

    const onConfirm = () => {
        mutate({id: slotHistory.slotId})
    }
    return <Popconfirm onConfirm={onConfirm} title={"Xác nhận checkout"}>
        <Button type={"link"}>Checkout</Button>
    </Popconfirm>
}

function SwapSlotButton({userId}) {
    const navigate = useNavigate()
    return <Button onClick={() => navigate(`/pages/manager/swap?userId=${userId}`)} type={"link"}>Đổi phòng</Button>
}

const useFilterStore = create(set => ({
    page: 0,
    userId: null,
    setUserId: (userId) => set({userId}),
    semesterId: null,
    setSemesterId: (semesterId) => set({semesterId}),
    roomId: null,
    setRoomId: (roomId) => set({roomId}),
    setPage: (page) => set({page})
}))

export default function SlotUsageManage() {
    const {page, setPage, userId, setUserId, roomId, setRoomId, semesterId, setSemesterId} = useFilterStore();

    const {data} = useQuery({
        queryKey: ["slot-history", page, userId, roomId, semesterId],
        queryFn: () => axiosClient.get("/slot-history", {
            params: {
                page, size: 5, userId, roomId, semesterId
            }
        }).then(res => res.data)
    })

    return <RequireRole role={"MANAGER"}><LayoutManager active={"slot"}>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title="Quản lý giường"/>
            <div className={"section"}>
                <div className={"flex gap-3 flex-wrap"}>
                    <ResidentFilter value={userId} onChange={setUserId}/>
                    <RoomFilter value={roomId} onChange={setRoomId}/>
                    <SemesterFilter value={semesterId} onChange={setSemesterId} />
                </div>
            </div>
            <div className={"section"}>
                <Table className={"overflow-auto"} bordered dataSource={data ? data.content : []} columns={[
                    {
                        title: "Mã sinh viên",
                        dataIndex: ["user", "userCode"],
                    },
                    {
                        title: "Sinh viên",
                        dataIndex: ["user", "fullName"],
                    },
                    {
                        title: "Kỳ",
                        dataIndex: ["semester", "name"],
                        render: (val) => <Tag>{val}</Tag>
                    },
                    {
                        title: "Dorm",
                        dataIndex: ["room", "dorm", "dormName"],
                    },
                    {
                        title: "Phòng",
                        dataIndex: ["room", "roomNumber"],
                    },
                    {
                        title: "Slot",
                        dataIndex: ["slotName"],
                    },
                    {
                        title: "Checkin",
                        dataIndex: ["checkin"],
                        render: val => val && formatTime(val)
                    },
                    {
                        title: "Checkout",
                        dataIndex: ["checkout"],
                        render: val => val && formatTime(val)
                    },
                    {
                        title: "Hành động",
                        render: (val, row) => {
                            return [
                                !row.checkout && <CheckoutButton slotHistory={row}/>,
                                !row.checkout && <SwapSlotButton userId={row.user.id}/>
                            ];
                        }
                    }
                ]} onChange={({current}) => {
                    setPage(current - 1)
                }} pagination={{
                    showTotal: (total) => <span>Tổng cộng <span className={"font-medium"}>{total}</span> bản ghi</span>,
                    pageSize: 5,
                    current: page + 1,
                    total: data?.page?.totalElements
                }}/>
            </div>
        </div>
    </LayoutManager></RequireRole>
}