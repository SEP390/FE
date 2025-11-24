import {LayoutGuard} from "../../../components/layout/LayoutGuard.jsx";
import {Button, Popconfirm, Table} from "antd";
import {useEffect, useState} from "react";
import {ResidentFilter} from "../../../components/ResidentSelect.jsx";
import {PageHeader} from "../../../components/PageHeader.jsx";
import {RoomFilter} from "../../../components/RoomSelect.jsx";
import {useApiStore} from "../../../hooks/useApiStore.js";
import {createApiStore} from "../../../util/createApiStore.js";

const guardCheckinStore = createApiStore("POST", "/guard/checkins")
const guardCheckinSlotsStore = createApiStore("GET", "/slots", { status: "CHECKIN "})

function CheckinButton({slotId}) {
    const { isLoading, isSuccess} = useApiStore(guardCheckinStore);
    const {fetch: fetchSlots} = guardCheckinStore()

    const onConfirm = () => {
        mutate({slotId})
    }
    useEffect(() => {
        isSuccess && fetchSlots().then()
    }, [fetchSlots, isSuccess]);

    return <Popconfirm title={"Xác nhận"} description={"Xác nhận checkin"} onConfirm={onConfirm}
                       onCancel={() => {
                       }}
                       okText="OK"
                       cancelText="Hủy">
        <Button loading={isLoading} type={"link"}>Checkin</Button>
    </Popconfirm>
}

export default function GuardCheckinPage() {
    const {mutate, data, isLoading} = useApiStore(guardCheckinSlotsStore)
    const [page, setPage] = useState(0);

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
                            return <CheckinButton slotId={row.id}/>
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