import {LayoutGuard} from "../../../components/layout/LayoutGuard.jsx";
import {PageHeader} from "../../../components/PageHeader.jsx";
import {Button, Table} from "antd";
import {Plus} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {RoomFilter} from "../../../components/RoomSelect.jsx";
import {DateRangeFilter} from "../../../components/DateRangeSelect.jsx";
import {createApiStore} from "../../../util/createApiStore.js";
import {useViewEffect} from "../../../hooks/useViewEffect.js";

const ewRoomStore = createApiStore("GET", "/ew/room")

export default function GuardEW() {
    const navigate = useNavigate();

    const {data} = useViewEffect(ewRoomStore)

    return <LayoutGuard active={"electric-water"}>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={"Nhập điện nước"}/>
            <div className={"section flex gap-3"}>
                <div>
                    <div className={"font-medium mb-3 text-lg"}>Bộ lọc</div>
                    <div className={"flex gap-3 flex-wrap"}>
                        <RoomFilter/>
                        <DateRangeFilter/>
                    </div>
                </div>
                <div className={"ml-auto"}>
                    <Button onClick={() => navigate("/pages/guard/ew/create")} icon={<Plus size={14}/>}>Tạo bản ghi
                        mới</Button>
                </div>
            </div>
            <div className={"section"}>
                <Table bordered dataSource={data ? data.content : []} columns={[
                    {
                        title: "Phòng",
                        dataIndex: ["room", "roomNumber"]
                    },
                    {
                        title: "Kỳ",
                        dataIndex: ["semester", "name"]
                    },
                    {
                        title: "Số điện",
                        dataIndex: "electric"
                    },
                    {
                        title: "Số nước",
                        dataIndex: "water"
                    },
                    {
                        title: "Sử dụng điện",
                        dataIndex: "electricUsed"
                    },
                    {
                        title: "Sử dụng nước",
                        dataIndex: "waterUsed"
                    },
                    {
                        title: "Ngày nhập",
                        dataIndex: "createDate"
                    },
                ]}/>
            </div>
        </div>
    </LayoutGuard>
}