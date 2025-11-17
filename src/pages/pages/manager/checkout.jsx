import {LayoutGuard} from "../../../components/layout/LayoutGuard.jsx";
import {App, Button, Card, Input, Table} from "antd";
import {create} from 'zustand'
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import {useEffect} from "react";
import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";

const useListCheckinStore = create(set => ({
    page: 0,
    userCode: null,
    setPage: (page) => set({page}),
    setUserCode: (userCode) => set({userCode}),
    data: null,
    fetchData: async ({ page, userCode }) => {
        const res = await axiosClient("/slots", {
            params: {
                status: 'UNAVAILABLE',
                page,
                userCode: userCode === null ? undefined : userCode,
            }
        })
        console.log(res.data)
        set({ data: res.data })
    }
}))

function CheckoutAction({ slotId }) {
    const {page, fetchData} = useListCheckinStore()
    const {notification} = App.useApp();
    const onClick = async () => {
        const res = await axiosClient({
            method: "POST",
            url: "/slots/checkout/" + slotId,
        })
        notification.success({message: "Checkout thành công"})
        await fetchData({page})
    }
    return <Button onClick={onClick} type={"link"}>Checkout</Button>
}

export default function ManagerCheckout() {
    const {data, fetchData, page, userCode, setPage, setUserCode} = useListCheckinStore()
    useEffect(() => {
        fetchData({page, userCode})
    }, [fetchData, page, userCode]);
    return <LayoutManager active={"manager-checkout"}>
        <Card title={"Danh sách slot"} className={"h-full overflow-auto"}>
            <div className={"mb-3"}>
                <div className={"flex gap-3 items-center"}>
                    <div>
                        Mã sinh viên:
                    </div>
                    <div className={"w-50"}>
                        <Input onChange={(e) => setUserCode(e.target.value)} value={userCode} />
                    </div>
                </div>
            </div>
            <Table bordered dataSource={data ? data.content : []} columns={[
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
                        return <CheckoutAction slotId={row.id}/>
                    }
                }
            ]} pagination={{
                current: page+1
            }}/>
        </Card>
    </LayoutManager>
}
