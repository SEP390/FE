import {LayoutGuard} from "../../../components/layout/LayoutGuard.jsx";
import {App, Button, Popconfirm, Table} from "antd";
import {ResidentFilter} from "../../../components/ResidentSelect.jsx";
import {PageHeader} from "../../../components/PageHeader.jsx";
import {RoomFilter} from "../../../components/RoomSelect.jsx";
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {create} from "zustand";
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";

const useFilterStore = create(set => ({
    page: 0,
    userId: null,
    roomId: null,
    setUserId: (userId) => set({userId}),
    setRoomId: (roomId) => set({roomId}),
    onChange: ({current}, filter, {field, order}) => set({page: current - 1})
}))

export default function GuardCheckinPage() {
    const queryClient = useQueryClient();
    const {notification} = App.useApp();
    const {page, userId, roomId, setUserId, setRoomId} = useFilterStore();
    const {mutate, isLoading} = useMutation({
        mutationFn: ({slotId}) => axiosClient({
            method: "POST",
            url: "/checkin",
            data: {slotId}
        }).then(res => res.data),
        onSuccess: (res) => {
            notification.success({message: "Checkin thành công"})
            queryClient.invalidateQueries({
                queryKey: ["checkin"]
            })
        },
        onError: (err) => {
            notification.error({message: err?.response?.data?.message || err.message})
        }
    })
    const {data} = useQuery({
        queryKey: ["checkin", page, userId, roomId],
        queryFn: () => axiosClient.get("/slots", {
            params: {
                status: "CHECKIN", page, userId, roomId
            }
        }).then(res => res.data)
    })
    const onCheckin = (slot) => {
        mutate({slotId: slot.id})
    }

    return <RequireRole role={"GUARD"}><LayoutGuard active={"guard-checkin"}>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={"Danh sách chờ checkin"}/>
            <div className={"section"}>
                <div className={"font-medium text-lg mb-3"}>Bộ lọc</div>
                <div className={"flex gap-3"}>
                    <ResidentFilter value={userId} onChange={setUserId}/>
                    <RoomFilter value={roomId} onChange={setRoomId}/>
                </div>
            </div>
            <div className={"section"}>
                <Table loading={isLoading} bordered dataSource={data ? data.content : []} columns={[
                    {
                        title: "Mã sinh viên",
                        dataIndex: ["user", "userCode"],
                    },
                    {
                        title: "Sinh viên",
                        dataIndex: ["user", "fullName"],
                    },
                    {
                        title: "Slot",
                        dataIndex: "slotName",
                    },
                    {
                        title: "Phòng",
                        dataIndex: ["room", "roomNumber"],
                    },
                    {
                        title: "Dorm",
                        dataIndex: ["room", "dorm", "dormName"],
                    },
                    {
                        title: "Hành động",
                        render: (val, row) => {
                            return <Popconfirm onConfirm={() => onCheckin(row)} title={"Xác nhận"}><Button
                                type={"link"}>Checkin</Button></Popconfirm>
                        }
                    }
                ]} pagination={{
                    current: page + 1,
                    total: data?.page?.totalElements
                }}/>
            </div>
        </div>
    </LayoutGuard></RequireRole>
}