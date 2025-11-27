import axiosClient from "../../api/axiosClient/axiosClient.js";
import {Alert, App, Button, Descriptions, Modal, Skeleton, Spin, Table, Tag} from "antd";
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {create} from 'zustand'
import {formatPrice} from "../../util/formatPrice.js";
import {cn} from "../../util/cn.js";
import {Bed, Building, House} from "lucide-react";
import {formatDate} from "../../util/formatTime.js";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import CreateBookingY2 from "./booking/y2.jsx";
import {PageHeader} from "../../components/PageHeader.jsx";
import {Link} from "react-router-dom";
import useErrorNotification from "../../hooks/useErrorNotification.js";

dayjs.extend(isBetween);

const useStore = create(set => ({
    recentRoom: null,
    selectedRoom: null,
    selectedSlot: null,
    nextSemester: null,
    setSelectedRoom: (selectedRoom) => set({selectedRoom}),
    setSelectedSlot: (selectedSlot) => set({selectedSlot}),
}))

function ExtendAction() {
    const queryClient = useQueryClient();
    const {notification} = App.useApp();
    const {mutate} = useMutation({
        mutationFn: () => axiosClient.get("/booking/extend").then(res => res.data),
        onError: err => {
            const errCode = err?.response?.data?.message || err?.message;
            notification.error({message: errCode})
        },
        onSuccess: data => {
            console.log(data)
            queryClient.invalidateQueries({
                queryKey: ["current-slot"]
            })
        }
    })

    return <Button onClick={() => mutate()} type={"link"}>Gia hạn</Button>
}

function PaymentAction() {
    const queryClient = useQueryClient()
    const {mutate, error} = useMutation({
        mutationFn: () => axiosClient({
            url: "/booking/payment",
            method: "POST",
        }).then(res => res.data),
        onSuccess: data => {
            window.open(data, '_blank')
            queryClient.invalidateQueries({
                queryKey: ["current-slot"]
            })
        }
    })
    useErrorNotification(error)
    const onClick = async () => {
        mutate()
    }
    return <Button onClick={onClick} type="link">Thanh toán</Button>
}

const useRoommateModal = create(set => ({
    id: null,
    isOpen: false,
    open: (id) => set({isOpen: true, id}),
    close: () => set({isOpen: false, id: null}),
}))

function RoommateModal() {
    const {isOpen, close, id} = useRoommateModal()

    const {data} = useQuery({
        queryKey: ["roommate", id],
        queryFn: () => id && axiosClient.get(`/roommate/${id}`).then(res => res.data),
    })

    return <Modal title={"Thông tin chi tiết"} open={isOpen} onCancel={close} onOk={close} footer={null}>
        {data && (
            <>
                <div className={"font-medium mb-3"}>Các survey trùng nhau</div>
                <div>
                    {data.similar.map(item => (
                        <>
                            <div className={"bg-gray-50 border border-gray-200 p-2"}>
                                <div className={"font-medium"}>Câu hỏi</div>
                                <div>{item[0]}</div>
                                <div className={"font-medium"}>Câu trả lời</div>
                                <div>{item[1]}</div>
                            </div>
                        </>
                    ))}
                </div>
            </>
        )}
    </Modal>
}

function Roommates() {
    const {open} = useRoommateModal();
    const {data} = useQuery({
        queryKey: ["roommates"],
        queryFn: () => axiosClient.get("/user/roommates").then(res => res.data),
    })
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
                title: "Email",
                dataIndex: ["email"],
            },
            {
                title: "Độ phù hợp",
                dataIndex: ["matching"],
            },
            {
                title: "Hành động",
                render: (val, row) => {
                    return <Button onClick={() => open(row.id)} type={"link"}>Chi tiết</Button>
                }
            },
        ]} pagination={false}/>
    </div>
}

function CurrentSlot() {
    const {data, isError, error, isSuccess, isLoading} = useQuery({
        queryKey: ["current-slot"],
        queryFn: () => axiosClient.get("/slots/current").then(res => res.data),
    })
    return (<>
            <div className={"section"}>
                <div className={"font-medium mb-3"}>Phòng hiện tại</div>
                <Table bordered dataSource={[data]} columns={[
                    {
                        title: "Dorm",
                        dataIndex: ["room", "dorm", "dormName"],
                        render: (val) => <span className={"flex gap-1 items-center"}><Building size={14}/>{val}</span>
                    },
                    {
                        title: "Phòng",
                        dataIndex: ["room", "roomNumber"],
                        render: (val) => <span className={"flex gap-1 items-center"}><House size={14}/>{val}</span>
                    },
                    {
                        title: "Slot",
                        dataIndex: ["slotName"],
                        render: (val) => <span className={"flex gap-1 items-center"}><Bed size={14}/>{val}</span>
                    },
                    {
                        title: "Số giường",
                        dataIndex: ["room", "totalSlot"],
                        render: (val) => <span className={"flex gap-1 items-center"}><Bed size={14}/>{val}</span>
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
                            if (row?.status === "LOCK") return <PaymentAction slot={row}/>
                            return <ExtendAction slot={row}/>
                        }
                    },
                ]} pagination={false}/>
            </div>
            <Roommates/>
        </>
    )
}

function PaymentButton() {
    const queryClient = useQueryClient()
    const {mutate, error} = useMutation({
        mutationFn: ({slotId}) => axiosClient({
            url: "/booking",
            method: "POST",
            params: {slotId}
        }).then(res => res.data),
        onSuccess: data => {
            window.open(data, '_blank')
            queryClient.invalidateQueries({
                queryKey: ["current-slot"]
            })
        }
    })
    useErrorNotification(error)
    const {selectedSlot} = useStore();
    const onClick = async () => {
        mutate({slotId: selectedSlot.id})
    }
    return <Button onClick={onClick} type="primary" htmlType={"submit"}>Thanh toán</Button>
}

function ConfirmSelect() {
    const {data: nextSemester} = useQuery({
        queryKey: ["next-semester"],
        queryFn: () => axiosClient.get("/semesters/next").then(res => res.data)
    })
    const {selectedSlot, selectedRoom} = useStore();

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
        if (data.status !== "AVAILABLE") return;
        if (selectedSlot && selectedSlot.id === data.id) {
            setSelectedSlot(null)
            return;
        }
        setSelectedSlot(data)
    }
    return <div
        onClick={onClick}
        className={cn("border border-gray-200 p-5 rounded-lg transition-all", {
            "!border-blue-200 bg-blue-50": selectedSlot && selectedSlot.id === data.id,
            "hover:cursor-pointer hover:shadow-lg": data.status === "AVAILABLE",
            "bg-gray-100 select-none": data.status !== "AVAILABLE",
        })}>
        <Bed/><span>{data.slotName}</span>
    </div>
}

function SelectSlot() {
    const {selectedRoom} = useStore();

    return <div className={"section"}>
        <div className={"font-medium mb-3"}>Chọn slot</div>
        <div className={"flex gap-3 flex-wrap"}>
            {selectedRoom.slots.map(slot => <SlotItem key={slot.id} data={slot}/>)}
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

function CreateBookingY1({timeConfig}) {
    const {isLoading, data, isSuccess, isError, error} = useQuery({
        queryKey: ["rooms-matching"],
        queryFn: () => axiosClient.get("/rooms-matching").then(res => res.data),
        retry: false
    })
    const {selectedRoom, selectedSlot} = useStore()

    const errorCode = error?.response?.data?.message || error?.message;

    const {startBookingDate, endBookingDate} = timeConfig;
    if (!dayjs().isBetween(
        startBookingDate,
        endBookingDate,
        'day', // Granularity: only compare year, month, and day
        '[]'   // Inclusivity: [ means inclusive, so today is >= start AND <= end
    )) {
        return (
            <>
                <div className={"section"}>
                    <div className={"font-medium text-lg"}>Đặt phòng</div>
                </div>
                <div className={"section"}>
                    <Alert showIcon type={"error"}
                           message={`Chưa đến thời gian đặt phòng (${formatDate(startBookingDate)} - ${formatDate(endBookingDate)})`}/>
                </div>
            </>
        )
    }

    return <>
        <div className={"section"}>
            <div className={"font-medium text-lg"}>Đặt phòng</div>
        </div>
        <div className={"section"}>
            {!isSuccess && !isError && <>
                <Skeleton active={isLoading}/>
            </>}
            {isError && <>
                <Alert showIcon type={"error"} message={"Lỗi"} closable={true}
                       description={{
                           SURVEY_NOT_FOUND: "Bạn không thể đặt phòng nếu chưa hoàn thành khảo sát",
                           BOOKING_DATE_NOT_START: "Chưa đến thời gian đặt phòng",
                           TIME_CONFIG_NOT_FOUND: "Chưa đến thời gian đặt phòng"
                       }[errorCode] || errorCode}/>
                {errorCode === "SURVEY_NOT_FOUND" && (
                    <>
                        <div className={"mt-5"}>
                            <Link to={"/survey"}><Button>Chuyển trang sang điền khảo sát</Button></Link>
                        </div>
                    </>
                )}
            </>}
            {isSuccess && <>
                <div className={"font-medium mb-3"}>Top 5 phòng phù hợp nhất</div>
                <div className={"grid lg:grid-cols-3 gap-5"}>
                    {data.map(data => <MatchingRoom key={data.id} data={data}/>)}
                </div>
            </>}
        </div>
        <div className={"grid gap-3 md:grid-cols-2"}>
            {selectedRoom && <SelectSlot/>}
            {selectedRoom && selectedSlot && <ConfirmSelect/>}
        </div>
    </>
}

function CreateBookingByYear({timeConfig}) {
    const {data, error, isLoading} = useQuery({
        queryKey: ["user-slot-history"],
        queryFn: () => axiosClient.get("/user/slot-history").then(res => res.data),
        retry: false
    })
    if (data && data.content.length > 0) {
        return <CreateBookingY2 timeConfig={timeConfig}/>
    }
    if (data && data.content.length === 0) {
        return <CreateBookingY1 timeConfig={timeConfig}/>
    }
    return <Spin spinning={isLoading} fullscreen={true}></Spin>
}

function CreateBooking() {
    const {data, error} = useQuery({
        queryKey: ["current-time-config"],
        queryFn: () => axiosClient.get("/time-config/current").then(res => res.data),
        retry: false,
    })

    if (error) {
        return (
            <>
                <Alert showIcon type={"error"}>Chưa đến thời gian đặt phòng</Alert>
            </>
        )
    }

    return (
        <>
            <CreateBookingByYear timeConfig={data}/>
        </>
    )
}

export default function BookingPage() {
    const {data, isError, error, isSuccess, isLoading} = useQuery({
        queryKey: ["current-slot"],
        queryFn: () => axiosClient.get("/slots/current").then(res => res.data),
        retry: false,
    })

    return <AppLayout activeSidebar={"booking"}>
        <RoommateModal/>
        <div className={"flex-grow flex gap-3 flex-col"}>
            {isError && (
                <>
                    <PageHeader title={"Đặt phòng"}/>
                    <div className={"section"}>
                        <Alert showIcon closable type={"error"} message={"Lỗi"} description={error.message}/>
                    </div>
                </>
            )}
            {isSuccess && !data && <CreateBooking/>}
            {isSuccess && data && <CurrentSlot data={data}/>}
        </div>
    </AppLayout>
}