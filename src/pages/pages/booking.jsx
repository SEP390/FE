import {useEffect, useState} from "react";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import {App, Button, Card, Descriptions, Divider, Table, Tag} from "antd";
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {create} from 'zustand'
import {formatPrice} from "../../util/formatPrice.js";
import {cn} from "../../util/cn.js";
import {Bed} from "lucide-react";
import {formatDate} from "../../util/formatTime.js";
import {PaymentHistoryPage} from "../booking/PaymentHistoryPage.jsx";

const useStore = create(set => ({
    currentSlot: null,
    fetchCurrentSlot: async () => {
        const res = await axiosClient("/slots/current");
        console.log(res.data)
        set({currentSlot: res.data});
    },
    recentRoom: null,
    selectedRoom: null,
    selectedSlot: null,
    nextSemester: null,
    ewPrice: {
        electricPrice: null,
        waterPrice: null,
    },
    fetchEWPrice: async () => {
        const res = await axiosClient("/ew/price")
        set({ewPrice: res.data})
    },
    fetchNextSemester: async () => {
        const res = await axiosClient("/semesters/next");
        console.log(res.data)
        set({nextSemester: res.data})
    },
    setSelectedRoom: (selectedRoom) => set({selectedRoom}),
    setSelectedSlot: (selectedSlot) => set({selectedSlot}),
    fetchRecentRoom: async () => {

    },
    matchingRooms: [],
    fetchMatchingRooms: async () => {
        const res = await axiosClient("/rooms-matching", {})
        console.log(res.data)
        set({matchingRooms: res.data})
    },
}))
function PaymentAction({slotId}) {
    const {fetchCurrentSlot} = useStore();
    const onClick = async () => {
        try {
            const res = await axiosClient({
                url: "/payment/pending-booking",
                method: "GET",
                params: {
                    slotId
                }
            })
            const paymentUrl = res.data;
            window.open(paymentUrl, '_blank').focus();
        } catch (error) {
            await fetchCurrentSlot()
        }
    }
    return <Button onClick={onClick} type="link">Thanh toán</Button>
}
function CurrentSlot() {
    const {currentSlot} = useStore();

    return <div>
        <div className={"font-medium mb-3"}>Phòng hiện tại</div>
        <Table bordered dataSource={[currentSlot]} columns={[
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
                title: "Số giường",
                dataIndex: ["room", "totalSlot"],
            },
            {
                title: "Giá",
                dataIndex: ["room", "pricing", "price"],
                render: (val) => formatPrice(val)
            },
            {
                title: "Trạng thái",
                dataIndex: ["status"],
                render: (val) => {
                    if (val === "LOCK") return <Tag>Chưa thanh toán</Tag>
                    if (val === "CHECKIN") return <Tag>Chờ checkin</Tag>
                    if (val === "UNAVAILABLE") return <Tag>Đã checkin</Tag>
                }
            },
            {
                title: "Hành động",
                render: (val, row) => {
                    if (row.status === "LOCK") return <PaymentAction slotId={row.id} />
                }
            },
        ]} pagination={false}/>
    </div>
}

function PaymentButton() {
    const {selectedSlot, fetchCurrentSlot} = useStore();
    const onClick = async () => {
        const res = await axiosClient({
            url: "/booking",
            method: "POST",
            params: {
                slotId: selectedSlot.id
            }
        })
        const paymentUrl = res.data;
        window.open(paymentUrl, '_blank').focus();
        await fetchCurrentSlot();
    }
    return <Button onClick={onClick} type="primary" htmlType={"submit"}>Thanh toán</Button>
}

function ConfirmSelect() {
    const {selectedSlot, selectedRoom, nextSemester} = useStore();
    return <div className={"mt-5"}>
        <Card>
            <Descriptions title={"Xác nhận"} layout={"vertical"} items={[
                {
                    label: "Dorm",
                    children: <span>{selectedRoom.dorm.dormName}</span>
                },
                {
                    label: "Phòng",
                    children: <span>{selectedRoom.roomNumber}</span>
                },
                {
                    label: "Slot",
                    children: <span>{selectedSlot.slotName}</span>
                },
                {
                    label: "Giá",
                    children: <span>{formatPrice(selectedRoom.pricing.price)}</span>
                },
                {
                    label: "Kỳ",
                    children: <Tag>{nextSemester.name}</Tag>
                },
                {
                    label: "Ngày bắt đầu",
                    children: <span>{formatDate(nextSemester.startDate)}</span>
                },
                {
                    label: "Ngày kết thúc",
                    children: <span>{formatDate(nextSemester.endDate)}</span>
                },
            ]}/>
        </Card>
        <div className={"mt-5"}>
            <PaymentButton />
        </div>
    </div>
}

function SlotItem({data}) {
    const {selectedSlot, selectedRoom, setSelectedSlot} = useStore();
    const onClick = () => {
        if (selectedSlot && selectedSlot.id === data.id) {
            setSelectedSlot(null)
            return;
        }
        setSelectedSlot(data)
    }
    return <div
        onClick={onClick}
        className={cn("border border-gray-200 p-5 rounded-lg hover:cursor-pointer hover:shadow-lg transition-all", {
            "!border-blue-200 bg-blue-50": selectedSlot && selectedSlot.id === data.id
        })}>
        <Bed/><span>{data.slotName}</span>
    </div>
}

function SelectSlot() {
    const {selectedRoom} = useStore();

    return <div className={"mt-5"}>
        <Divider/>
        <div className={"font-medium mb-3"}>Chọn slot</div>
        <div className={"flex gap-3"}>
            {selectedRoom.slots.map(slot => <SlotItem data={slot}/>)}
        </div>
    </div>
}

function MatchingRoom({data}) {
    const {selectedRoom, setSelectedRoom, setSelectedSlot} = useStore();
    const {roomNumber, matching, dorm, slots, pricing} = data;
    const {dormName} = dorm;
    const availableSlot = slots.filter(s => s.status === "AVAILABLE").length;
    const totalSlot = slots.length;
    const {price} = pricing;

    const onClick = () => {
        setSelectedSlot(null)
        if (selectedRoom && selectedRoom.id === data.id) {
            setSelectedRoom(null)
            return;
        }
        setSelectedRoom(data)
    }

    return <div onClick={onClick}
                className={cn({
                    "!border-blue-200 bg-blue-50": selectedRoom && selectedRoom.id === data.id
                }, "hover:cursor-pointer hover:shadow-lg transition-all w-full border rounded-lg border-gray-200 p-5 relative")}>
        <div className={"absolute top-3 right-3"}>
            <div
                className={"rounded-full text-sx text-gray-500 border border-gray-300 bg-gray-50 w-12 h-12 flex items-center justify-center"}>{matching.toFixed(1)}%
            </div>
        </div>
        <div className={"font-medium mb-3"}>{dormName} - {roomNumber}</div>
        <div className={"text-gray-500 mb-3"}>Số giường còn trống: {availableSlot}/{totalSlot}</div>
        <div className={"text-xl font-medium"}>{formatPrice(price)}</div>
    </div>
}

function CreateBooking() {
    const {matchingRooms, fetchMatchingRooms, fetchNextSemester, fetchEWPrice, selectedRoom, selectedSlot} = useStore();

    const {notification} = App.useApp();

    useEffect(() => {
        fetchMatchingRooms().catch((err) => {
            notification.error({message: "Lỗi", description: err.data?.message || err.message});
        })
        fetchNextSemester();
    }, [fetchEWPrice, fetchMatchingRooms, fetchNextSemester, notification]);

    return <>
        <div>
            <div className={"font-medium mb-3"}>Top 5 phòng phù hợp nhất</div>
            <div className={"grid lg:grid-cols-3 gap-5"}>
                {matchingRooms.map(data => <MatchingRoom data={data}/>)}
            </div>
            {selectedRoom && <SelectSlot/>}
            {selectedRoom && selectedSlot && <ConfirmSelect/>}
        </div>
    </>
}

export default function BookingPage() {
    const [loading, setLoading] = useState(true);
    const {fetchCurrentSlot, currentSlot} = useStore();
    useEffect(() => {
        fetchCurrentSlot().finally(() => {
            setLoading(false);
        })
    }, [fetchCurrentSlot]);

    return <AppLayout>
        <Card title={"Đặt phòng"} className={"h-full overflow-auto"}>
            {!loading && !currentSlot && <CreateBooking/>}
            {!loading && currentSlot && <CurrentSlot/>}
        </Card>
    </AppLayout>
}