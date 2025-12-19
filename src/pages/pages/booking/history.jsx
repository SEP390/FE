import {AppLayout} from "../../../components/layout/AppLayout.jsx";
import {Table, Tag} from "antd";
import {PageHeader} from "../../../components/PageHeader.jsx";
import {Bed, Building, Clock, House} from "lucide-react";
import {formatTime} from "../../../util/formatTime.js";
import {SemesterFilter} from "../../../components/SemesterSelect.jsx";
import {RoomFilter} from "../../../components/RoomSelect.jsx";
import {useQuery} from "@tanstack/react-query";
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import useErrorNotification from "../../../hooks/useErrorNotification.js";
import {create} from "zustand";
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";

const useFilterStore = create(set => ({
    page: 0,
    semesterId: null,
    sort: "checkin,DESC",
    roomId: null,
    setSemesterId: (semesterId) => set({semesterId}),
    setRoomId: (roomId) => set({roomId}),
    onChange: ({current}, filter, {field, order}) => set({page: current - 1, sort: field ? `${field},${order === "ascend" ? "ASC": "DESC"}` : "checkin,DESC"})
}))

export default function BookingHistoryPage() {
    const {page, sort, semesterId, roomId, onChange, setSemesterId, setRoomId} = useFilterStore()
    const {data, error} = useQuery({
        queryKey: ["user-slot-history", page, sort, semesterId, roomId],
        queryFn: () => axiosClient.get("/user/slot-history", {
            params: {
                page, sort, size: 5, semesterId, roomId
            }
        }).then(res => res.data)
    })

    useErrorNotification(error);

    return <RequireRole role={"RESIDENT"}><AppLayout activeSidebar={"booking-history"}>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={"Lịch sử đặt phòng"}/>
            <div className={"section"}>
                Bộ lọc                <div className={"flex gap-3 flex-wrap"}>
                    <SemesterFilter value={semesterId} onChange={setSemesterId}/>
                    <RoomFilter value={roomId} onChange={setRoomId}/>
                </div>
            </div>
            <div className={"section"}>
                <Table className={"overflow-auto"} bordered dataSource={data ? data.content : []} columns={[
                    {
                        title: "Kỳ",
                        dataIndex: ["semester", "name"],
                        render: (val) => <Tag>{val}</Tag>
                    },
                    {
                        title: "Dorm",
                        dataIndex: ["room", "dorm", "dormName"],
                        render: (val) => <span className={"flex gap-1 items-center"}><Building size={14}/>{val}</span>
                    },
                    {
                        title: "Phòng",
                        dataIndex: ["room", "roomNumber"],
                        render: (val) => <span className={"flex gap-1 items-center"}><House size={14}/>{val}</span>
                    },
                    {
                        title: "Slot",
                        dataIndex: ["slotName"],
                        render: (val) => <span className={"flex gap-1 items-center"}><Bed size={14}/>{val}</span>
                    },
                    {
                        title: "Checkin",
                        dataIndex: ["checkin"],
                        render: (val) => val &&
                            <span className={"flex gap-1 items-center"}><Clock size={14}/>{formatTime(val)}</span>,
                        sorter: true,
                    },
                    {
                        title: "Checkout",
                        dataIndex: ["checkout"],
                        render: (val) => val &&
                            <span className={"flex gap-1 items-center"}><Clock size={14}/>{formatTime(val)}</span>,
                        sorter: true,
                    },
                ]} pagination={{
                    showTotal: (total) => <span>Tổng cộng <span className={"font-medium"}>{total}</span> bản ghi</span>,
                    current: page + 1,
                    total: data?.page.totalElements,
                    pageSize: 5,
                }} onChange={onChange}/>
            </div>
        </div>
    </AppLayout></RequireRole>
}