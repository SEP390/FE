import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {PageHeader} from "../../../components/PageHeader.jsx";
import {useViewEffect} from "../../../hooks/useViewEffect.js";
import {createApiStore} from "../../../util/createApiStore.js";
import {Table} from 'antd'
import {ResidentFilter} from "../../../components/ResidentSelect.jsx";
import {RoomFilter} from "../../../components/RoomSelect.jsx";

const slotHistoryStore = createApiStore("GET", "/slot-history")

export default function SlotUsageManage() {
    const {data} = useViewEffect(slotHistoryStore)
    return <LayoutManager>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title="Quản lý giường"/>
            <div className={"section"}>
                <div className={"font-medium mb-3 text-lg"}>Bộ lọc</div>
                <div className={"flex gap-3 flex-wrap"}>
                    <ResidentFilter/>
                    <RoomFilter/>
                </div>
            </div>
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
                    {
                        title: "Hành động",
                        render: () => {
                            return <></>;
                        }
                    }
                ]} pagination={{
                    total: data?.page.totalElements
                }}/>
            </div>
        </div>
    </LayoutManager>
}