import {LayoutGuard} from "../../../components/layout/LayoutGuard.jsx";
import {App, Button, Popconfirm, Table} from "antd";
import {useEffect, useState} from "react";
import {ResidentFilter} from "../../../components/ResidentSelect.jsx";
import {PageHeader} from "../../../components/PageHeader.jsx";
import {RoomFilter} from "../../../components/RoomSelect.jsx";
import {useApiStore} from "../../../hooks/useApiStore.js";
import {createApiStore} from "../../../util/createApiStore.js";
import axiosClient from "../../../api/axiosClient/axiosClient.js";

const guardCheckinSlotsStore = createApiStore("GET", "/slots", {status: "CHECKIN "})

export default function GuardCheckinPage() {
    const {mutate, fetch, data, isLoading} = useApiStore(guardCheckinSlotsStore)
    const [page, setPage] = useState(0);
    const {notification} = App.useApp();
    const onCheckin = (slot) => {
        axiosClient({
            method: "POST",
            url: "/checkin",
            data: {
                slotId: slot.id
            }
        }).then((res) => {
            console.log(res)
            fetch()
        }).catch(err => {
            notification.error({message: err?.response?.data?.message || err.message})
        })
    }

    useEffect(() => {
        mutate({page, status: "CHECKIN"})
    }, [mutate, page])

    return <LayoutGuard active={"guard-checkin"}>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={"Danh sách chờ checkin"}/>
            <div className={"section"}>
                <div className={"font-medium text-lg mb-3"}>Bộ lọc</div>
                <div className={"flex gap-3"}>
                    <ResidentFilter/>
                    <RoomFilter/>
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
                            return <Popconfirm onConfirm={() => onCheckin(row)} title={"Xác nhận"}><Button type={"link"}>Checkin</Button></Popconfirm>
                        }
                    }
                ]} pagination={{
                    current: page + 1,
                    total: data?.page?.totalElements
                }}/>
            </div>
        </div>
    </LayoutGuard>
}