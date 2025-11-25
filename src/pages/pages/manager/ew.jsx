import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {Button, Table, Tag} from 'antd'
import {createApiStore} from "../../../util/createApiStore.js";
import {RoomFilter} from "../../../components/RoomSelect.jsx";
import {SemesterFilter} from "../../../components/SemesterSelect.jsx";
import {DateRangeFilter} from "../../../components/DateRangeSelect.jsx";
import {useNavigate} from "react-router-dom";
import {CalendarDays, DollarSign, Droplet, House, Plus} from "lucide-react";
import {create} from "zustand";
import {useQuery} from "@tanstack/react-query";
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import {formatDate} from "../../../util/formatTime.js";
import {ThunderboltOutlined} from "@ant-design/icons";

const getEWIndex = createApiStore("GET", "/ew/room")

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
    semesterId: null,
    setSemesterId: (semesterId) => set({semesterId}),
    startDate: null,
    setStartDate: (startDate) => set({startDate}),
    endDate: null,
    setEndDate: (endDate) => set({endDate}),
}))

export default function ManageEW() {
    const {roomId, semesterId, startDate, endDate, setRoomId, setSemesterId} = useFilterStore();

    const {data} = useQuery({
        queryKey: ["ew-room", roomId, semesterId, startDate, endDate],
        queryFn: () => axiosClient.get("/ew/room", {
            params: {
                roomId, semesterId, startDate, endDate
            }
        }).then(res => res.data)
    })

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
                        <SemesterFilter value={semesterId} onChange={setSemesterId}/>
                        <DateRangeFilter/>
                    </div>
                </div>
                <div className={"ml-auto flex items-end gap-3"}>
                    <ManageEWPriceButton/>
                    <CreateElectricInvoiceButton/>
                </div>
            </div>
            <div className={"section flex-grow"}>
                <Table className={"overflow-auto"} bordered dataSource={data ? data.content : []} columns={[
                    {
                        title: "Phòng",
                        dataIndex: ["room", "roomNumber"],
                        render: (val) => <span className={"flex gap-1 items-center"}><House size={14}/>{val}</span>
                    },
                    {
                        title: "Kỳ",
                        dataIndex: ["semester", "name"],
                        render: (val) => <Tag>{val}</Tag>
                    },
                    {
                        title: "Số điện",
                        dataIndex: "electric",
                        render: (val) => <span
                            className={"flex gap-1 items-center"}><ThunderboltOutlined/>{val} kW</span>,
                    },
                    {
                        title: "Số nước",
                        dataIndex: "water",
                        render: (val) => <span className={"flex gap-1 items-center"}><Droplet
                            size={14}/>{val}<span>m<sup>3</sup></span></span>,
                    },
                    {
                        title: "Sử dụng điện",
                        dataIndex: "electricUsed",
                        render: (val) => <span
                            className={"flex gap-1 items-center"}><ThunderboltOutlined/>{val} kW</span>,
                    },
                    {
                        title: "Sử dụng nước",
                        dataIndex: "waterUsed",
                        render: (val) => <span className={"flex gap-1 items-center"}><Droplet
                            size={14}/>{val}<span>m<sup>3</sup></span></span>,
                    },
                    {
                        title: "Ngày nhập",
                        dataIndex: "createDate",
                        render: (val) => <span className={"flex gap-1 items-center"}><CalendarDays
                            size={14}/>{formatDate(val)}</span>,
                    },
                ]}/>
            </div>
            <div>

            </div>
        </div>
    </LayoutManager>
}