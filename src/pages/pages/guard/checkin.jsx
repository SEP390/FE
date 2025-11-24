import {LayoutGuard} from "../../../components/layout/LayoutGuard.jsx";
import {App, Button, Popconfirm, Table} from "antd";
import {useCallback, useEffect, useState} from "react";
import {useApi} from "../../../hooks/useApi.js";
import {ResidentFilter} from "../../../components/ResidentSelect.jsx";
import {PageHeader} from "../../../components/PageHeader.jsx";
import {RoomFilter} from "../../../components/RoomSelect.jsx";

function CheckinButton({slotId, fetchSlots}) {
    const {post, error, isLoading} = useApi();
    const {notification} = App.useApp();
    useEffect(() => {
        if (error) notification.error({message: String(error)})
    }, [error, notification]);

    const onConfirm = () => {
        post(`/checkin?slotId=${slotId}`, null)
        fetchSlots()
    }
    return <Popconfirm title={"Xác nhận"} description={"Xác nhận checkin"} onConfirm={onConfirm}
                       onCancel={() => {
                       }}
                       okText="OK"
                       cancelText="Hủy">
        <Button loading={isLoading} type={"link"}>Checkin</Button>
    </Popconfirm>
}

export default function GuardCheckinPage() {
    const {get, data, error, isLoading} = useApi();
    const [page, setPage] = useState(0);
    const {notification} = App.useApp();
    const [userCode, setUserCode] = useState(undefined);

    const fetchSlots = useCallback(() => {
        get("/slots", {
            status: 'CHECKIN',
            page,
            userCode
        })
    }, [get, page, userCode])

    useEffect(() => {
        fetchSlots()
    }, [fetchSlots]);

    useEffect(() => {
        if (error) notification.error({message: String(error)})
    }, [error, notification]);

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
                            return <CheckinButton slotId={row.id} fetchSlots={fetchSlots}/>
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