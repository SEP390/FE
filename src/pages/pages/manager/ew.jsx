import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {Button, Table} from 'antd'
import {createApiStore} from "../../../util/createApiStore.js";
import {useViewEffect} from "../../../hooks/useViewEffect.js";
import {RoomFilter} from "../../../components/RoomSelect.jsx";
import {SemesterFilter} from "../../../components/SemesterSelect.jsx";
import {DateRangeFilter} from "../../../components/DateRangeSelect.jsx";
import {useNavigate} from "react-router-dom";
import {DollarSign, Plus} from "lucide-react";
import {create} from "zustand";
import {useEffect} from "react";

const getEWIndex = createApiStore("GET", "/ew/room")

function EWTable() {
    const roomId = useFilterStore(state => state.roomId);
    const {data, mutate} = getEWIndex();

    useViewEffect(getEWIndex)

    useEffect(() => {
        mutate({roomId})
    }, [mutate, roomId]);

    return <Table className={"overflow-auto"} bordered dataSource={data ? data.content : []} columns={[
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

}

function CreateElectricInvoiceButton() {
    const navigate = useNavigate();
    return <Button icon={<Plus size={14}/>}
                   onClick={() => navigate("/pages/manager/invoice/create?type=EW&subject=ALL&back=ew")}>Tạo hóa
        đơn</Button>
}

function ManageEWPriceButton() {
    const navigate = useNavigate();
    return <Button icon={<DollarSign size={14}/>} onClick={() => navigate("/pages/manager/ew/price")}>Quản lý
        giá</Button>
}

const useFilterStore = create(set => ({
    roomId: null,
    setRoomId: (roomId) => set({roomId}),
}))

export default function ManageEW() {
    const roomId = useFilterStore(state => state.roomId);
    const setRoomId = useFilterStore(state => state.setRoomId);
    return <LayoutManager active={"manager-ew"}>
        <div className={"flex flex-col gap-3"}>
            <div className={"section"}>
                <div className={"font-medium text-lg"}>Quản lý điện nước</div>
            </div>
            <div className={"section flex flex-wrap gap-3"}>
                <div>
                    <div className={"font-medium text-lg mb-3"}>Bộ lọc</div>
                    <div className={"flex gap-3 flex-wrap"}>
                        <RoomFilter value={roomId} onChange={setRoomId}/>
                        <SemesterFilter/>
                        <DateRangeFilter/>
                    </div>
                </div>
                <div className={"ml-auto flex items-end gap-3"}>
                    <ManageEWPriceButton/>
                    <CreateElectricInvoiceButton/>
                </div>
            </div>
            <div className={"section flex-grow"}>
                <EWTable/>
            </div>
            <div>

            </div>
        </div>
    </LayoutManager>
}