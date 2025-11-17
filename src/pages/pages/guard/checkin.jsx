import {LayoutGuard} from "../../../components/layout/LayoutGuard.jsx";
import {Button, Card, Table} from "antd";
import {create} from 'zustand'
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import {useEffect} from "react";

const useListCheckinStore = create(set => ({
    page: 0,
    setPage: (page) => set({page}),
    data: null,
    fetchData: async ({ page }) => {
        const res = await axiosClient("/slots", {
            params: {
                status: 'CHECKIN',
                page,
            }
        })
        console.log(res.data)
        set({ slots: res.data.content })
    }
}))

export default function GuardCheckinPage() {
    const {data, fetchData, page, setPage} = useListCheckinStore()
    useEffect(() => {
        fetchData({page})
     }, [fetchData, page]);
    return <LayoutGuard>
        <Card title={"Danh sách chờ checkin"} className={"h-full overflow-auto"}>
            <div>

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
                        return <Button variant={"link"}>Checkin</Button>
                    }
                }
            ]} pagination={{
                current: page+1
            }}/>
        </Card>
    </LayoutGuard>
}