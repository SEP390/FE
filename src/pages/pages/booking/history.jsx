import {AppLayout} from "../../../components/layout/AppLayout.jsx";
import {Table, Tag} from "antd";
import {PageHeader} from "../../../components/PageHeader.jsx";
import {createApiStore} from "../../../util/createApiStore.js";
import {useViewEffect} from "../../../hooks/useViewEffect.js";

const slotHistoryStore = createApiStore("GET", "/user/slot-history")

export default function BookingHistoryPage() {
    const {data} = useViewEffect(slotHistoryStore)

    return <AppLayout>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={"Lịch sử đặt phòng"}/>
            <div className={"section"}>
                <Table className={"overflow-auto"} bordered dataSource={data ? data.content : []} columns={[
                    {
                        title: "Kỳ",
                        dataIndex: ["semester", "name"],
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
                    },
                    {
                        title: "Checkout",
                        dataIndex: ["checkout"],
                    },
                ]} pagination={{
                    total: data?.page.totalElements
                }}/>
            </div>
        </div>
    </AppLayout>
}