import {useEffect} from "react";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import {Alert, App, Button, Descriptions, Skeleton, Table, Tag} from "antd";
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {create} from 'zustand'
import {formatPrice} from "../../util/formatPrice.js";
import {cn} from "../../util/cn.js";
import {Bed} from "lucide-react";
import {formatDate} from "../../util/formatTime.js";
import {createApiStore} from "../../util/createApiStore.js";
import {useViewEffect} from "../../hooks/useViewEffect.js";

const useStore = create(set => ({
    recentRoom: null,
    selectedRoom: null,
    selectedSlot: null,
    nextSemester: null,
    setSelectedRoom: (selectedRoom) => set({selectedRoom}),
    setSelectedSlot: (selectedSlot) => set({selectedSlot}),
}))

function CancelAction() {
    return (
        <>
        </>
    )
}

const bookingPaymentStore = createApiStore("POST", "/booking/payment")

function PaymentAction() {
    const {fetch: fetchCurrentSlot} = currentSlotStore();
    const {fetch: getBookingPayment, data: paymentUrl, error} = bookingPaymentStore()
    const {notification} = App.useApp();
    useEffect(() => {
        if (paymentUrl) {
            window.open(paymentUrl, '_blank')
        }
    }, [paymentUrl])
    useEffect(() => {
        error && notification.error({message: error})
    }, [error, notification]);
    const onClick = async () => {
        await getBookingPayment()
        await fetchCurrentSlot()
    }
    return <Button onClick={onClick} type="link">Thanh toán</Button>
}

const roommatesStore = createApiStore("GET", "/user/roommates")

function Roommates() {
    const {data} = useViewEffect(roommatesStore)
    return <div className={"section"}>
        <div className={"font-medium mb-3"}>Bạn cùng phòng</div>
        <Table bordered dataSource={data} columns={[
            {
                title: "Mã sinh viên",
                dataIndex: ["userCode"],
            },
            {
                title: "Sinh viên",
                dataIndex: ["fullName"],
            },
            {
                title: "email",
                dataIndex: ["email"],
            },
            {
                title: "Độ phù hợp",
                dataIndex: ["matching"],
            },
            {
                title: "Hành động",
                render: (val, row) => {
                    return <Button type={"text"}>Chi tiết</Button>
                }
            },
        ]} pagination={false}/>
    </div>
}

function CurrentSlot() {
    const data = currentSlotStore(state => state.data);

    return (<>
            <div className={"section"}>
                <div className={"font-medium mb-3"}>Phòng hiện tại</div>
                <Table bordered dataSource={[data]} columns={[
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
                            if (row.status === "LOCK") return [<PaymentAction/>, <CancelAction/>]
                        }
                    },
                ]} pagination={false}/>
            </div>
            <Roommates/>
        </>
    )
}

function PaymentButton() {
    const {selectedSlot} = useStore();
    const {fetch: fetchCurrentSlot} = currentSlotStore();
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
    const {selectedSlot, selectedRoom} = useStore();
    const nextSemester = nextSemesterStore(state => state.data);
    return <div className={"section"}>
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
                children: <Tag>{nextSemester?.name}</Tag>
            },
            {
                label: "Ngày bắt đầu",
                children: <span>{formatDate(nextSemester?.startDate)}</span>
            },
            {
                label: "Ngày kết thúc",
                children: <span>{formatDate(nextSemester?.endDate)}</span>
            },
        ]}/>
        <div className={"mt-5"}>
            <PaymentButton/>
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

    return <div className={"section"}>
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
                className={cn({
                    "!border-blue-200 !bg-blue-100": selectedRoom && selectedRoom.id === data.id
                }, "rounded-full text-sx text-gray-500 border border-gray-300 bg-gray-50 w-12 h-12 flex items-center justify-center")}>{matching.toFixed(1)}%
            </div>
        </div>
        <div className={"font-medium mb-3"}>{dormName} - {roomNumber}</div>
        <div className={"text-gray-500 mb-3"}>Số giường còn trống: {availableSlot}/{totalSlot}</div>
        <div className={"text-xl font-medium"}>{formatPrice(price)}</div>
    </div>
}

const matchingRoomsStore = createApiStore("GET", "/rooms-matching");
const nextSemesterStore = createApiStore("GET", "/semesters/next");

function CreateBooking() {
    const {isLoading, data: matchingRooms, fetch: fetchMatchingRooms, isSuccess, isError, error} = matchingRoomsStore()
    const {fetch: fetchNextSemester} = nextSemesterStore()
    const {selectedRoom, selectedSlot} = useStore()

    useEffect(() => {
        fetchMatchingRooms().then();
        fetchNextSemester().then();
    }, [fetchMatchingRooms, fetchNextSemester,]);

    return <>
        <div className={"section"}>
            <div className={"font-medium text-lg"}>Đặt phòng</div>
        </div>
        <div className={"section"}>
            {!isSuccess && !isError && <>
                <Skeleton active={isLoading}/>
            </>}
            {isError && error === "SURVEY_NOT_FOUND" && <>
                <Alert showIcon type={"error"} message={"Lỗi"} closable={true}
                       description={"Bạn không thể đặt phòng nếu chưa hoàn thành khảo sát"}/>
            </>}
            {isError && error === "BOOKING_DATE_NOT_START" && <>
                <Alert showIcon type={"error"} message={"Lỗi"} closable={true}
                       description={"Chưa đến thời gian đặt phòng"}/>
            </>}
            {isSuccess && <>
                <div className={"font-medium mb-3"}>Top 5 phòng phù hợp nhất</div>
                <div className={"grid lg:grid-cols-3 gap-5"}>
                    {matchingRooms.map(data => <MatchingRoom key={data.id} data={data}/>)}
                </div>
            </>}
        </div>
        <div className={"grid gap-3 md:grid-cols-2"}>
            {selectedRoom && <SelectSlot/>}
            {selectedRoom && selectedSlot && <ConfirmSelect/>}
        </div>
    </>
}

const currentSlotStore = createApiStore("GET", "/slots/current");

export default function BookingPage() {
    const isError = currentSlotStore(state => state.isError)
    const isSuccess = currentSlotStore(state => state.isSuccess)
    const data = currentSlotStore(state => state.data)
    const fetch = currentSlotStore(state => state.fetch)

    useEffect(() => {
        fetch().then()
    }, [fetch]);

    return <AppLayout activeSidebar={"booking"}>
        <div className={"flex-grow flex gap-3 flex-col"}>
            {isError || (isSuccess && !data) && <CreateBooking/>}
            {isSuccess && data && <CurrentSlot/>}
        </div>
    </AppLayout>
}