import {LayoutGuard} from "../../../components/layout/LayoutGuard.jsx";
import {App, Button, Card, Input, Popconfirm, Table} from "antd";
import {useCallback, useEffect, useState} from "react";
import {useApi} from "../../../hooks/useApi.js";

function CheckinButton({slotId, fetchSlots}) {
    const {post, data, error, isLoading} = useApi();
    const {notification} = App.useApp();
    useEffect(() => {
        if (error) notification.error({message: error})
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

    return <LayoutGuard active={"guard-checkin"}>
        <Card title={"Danh sách chờ checkin"} className={"h-full overflow-auto"}>
            <div className={"mb-3"}>
                <div className={"p-5 border border-gray-200 bg-gray-50 rounded-lg "}>
                    <div className={"font-medium mb-3"}>Bộ lọc</div>
                    <div className={"flex gap-3"}>
                        <div>
                            <Input placeholder={"Mã sinh viên"} onChange={(e) => setUserCode(e.target.value)}
                                   value={userCode}/>
                        </div>
                        <div>
                            <Input placeholder={"Phòng"}/>
                        </div>
                        <div>
                            <Input placeholder={"Dorm"}/>
                        </div>
                    </div>
                </div>
            </div>
            <Table loading={isLoading} bordered dataSource={data ? data.content : []} columns={[
                {
                    title: "Mã sinh viên",
                    dataIndex: ["user", "userCode"],
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
        </Card>
    </LayoutGuard>
}