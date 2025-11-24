import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {PageHeader} from "../../../components/PageHeader.jsx";
import {useViewEffect} from "../../../hooks/useViewEffect.js";
import {createApiStore} from "../../../util/createApiStore.js";
import {App, Button, Popconfirm, Table} from 'antd'
import {ResidentFilter} from "../../../components/ResidentSelect.jsx";
import {RoomFilter} from "../../../components/RoomSelect.jsx";
import axiosClient from "../../../api/axiosClient/axiosClient.js";

const slotHistoryStore = createApiStore("GET", "/slot-history")

export default function SlotUsageManage() {
    const {data, fetch} = useViewEffect(slotHistoryStore)

    const {notification} = App.useApp();
    const onCheckout = (slotHistory) => {
        axiosClient({
            method: "POST",
            url: "/slots/checkout/" + slotHistory.slotId,
        }).then((res) => {
            console.log(res)
            fetch()
        }).catch(err => {
            notification.error({message: err?.response?.data?.message || err.message})
        })
    }

    return <LayoutManager active={"slot"}>
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
                        title: "Mã sinh viên",
                        dataIndex: ["user", "userCode"],
                    },
                    {
                        title: "Sinh viên",
                        dataIndex: ["user", "fullName"],
                    },
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
                        render: (val, row) => {
                            return [
                                !row.checkout &&
                                <Popconfirm onConfirm={() => onCheckout(row)} title={"Xác nhận checkout"}>
                                    <Button type={"link"}>Checkout</Button>
                                </Popconfirm>,
                                !row.checkout && <Button type={"link"}>Đổi phòng</Button>
                            ];
                        }
                    }
                ]} pagination={{
                    total: data?.page.totalElements
                }}/>
            </div>
        </div>
    </LayoutManager>
}