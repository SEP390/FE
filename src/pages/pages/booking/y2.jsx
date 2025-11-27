import {useApi} from "../../../hooks/useApi.js";
import {useEffect} from "react";
import {Alert, App, Button, Card, Pagination, Skeleton} from "antd";
import {create} from 'zustand'
import {formatPrice} from "../../../util/formatPrice.js";
import {cn} from "../../../util/cn.js";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import {formatDate} from "../../../util/formatTime.js";
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import {useQuery} from "@tanstack/react-query";
import {PageHeader} from "../../../components/PageHeader.jsx";
import useErrorNotification from "../../../hooks/useErrorNotification.js";
import {Bed, Building, House} from "lucide-react";
import {ConfirmSelect} from "../../booking/ConfirmSelect.jsx";

dayjs.extend(isBetween);

const useStore = create((set) => ({
    totalSlot: null,
    dorm: null,
    floor: null,
    room: null,
    slot: null,
    setTotalSlot: (totalSlot) => set({totalSlot, dorm: null, floor: null, room: null}),
    setDorm: (dorm) => set({dorm, floor: null, room: null}),
    setFloor: (floor) => set({floor, room: null}),
    setRoom: (room) => set({room}),
    setSlot: (slot) => set({slot}),
}))

function SlotList() {
    const setSlot = useStore(state => state.setSlot);
    const {room, slot} = useStore();

    const {get, data, error} = useApi();

    const {notification} = App.useApp();
    useEffect(() => {
        if (error) notification.error({message: "Lỗi", description: error.toString()});
    }, [error, notification]);

    useEffect(() => {
        if (!room) return;
        get("/rooms/" + room.id)
    }, [get, room]);

    if (!data) return <></>

    return <>
        <div className={"mb-3 font-medium"}>Chọn slot</div>
        <div className={"flex gap-2 flex-wrap"}>
            {data.slots.map((item) => <Card className={cn("transition-all", {
                "!bg-gray-100": item.status !== "AVAILABLE",
                "!bg-blue-50 !border-blue-200": item.id === slot?.id,
                "hover:shadow-lg hover:cursor-pointer": item.id !== room?.id && item.status === "AVAILABLE"
            })} onClick={() => {
                if (item.status === "AVAILABLE") setSlot(item)
            }} key={item.id}>
                <div className={"flex gap-1 items-center"}><Bed size={14}/>{item.slotName}</div>
            </Card>)}
        </div>
    </>
}

function RoomList() {
    const totalSlot = useStore(state => state.totalSlot);
    const dorm = useStore(state => state.dorm);
    const floor = useStore(state => state.floor);
    const room = useStore(state => state.room)
    const setRoom = useStore(state => state.setRoom);

    const {data, error} = useQuery({
        queryKey: ["rooms-booking", totalSlot, dorm?.id, floor],
        queryFn: () => axiosClient.get("/rooms/booking", {
            params: {totalSlot, dormId: dorm?.id, floor}
        }).then(res => res.data)
    })

    useErrorNotification(error)

    if (!totalSlot || !dorm || !floor) return <></>

    if (!data) return <>
        <Skeleton active/>
    </>

    return <>
        <div className={"flex flex-col gap-2"}>
            <div className={"font-medium"}>Chọn phòng</div>
            <div className={"flex gap-2 flex-wrap"}>
                {data.content.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)).map((item) => <Card
                    className={cn("transition-all", {
                        "!bg-blue-50 !border-blue-200": item.id === room?.id,
                        "hover:shadow-lg hover:cursor-pointer": item.id !== room?.id
                    })} onClick={() => setRoom(item)}
                    key={item.id}>
                    <div className={"flex items-center gap-1"}><House size={16}/>{item.roomNumber}</div>

                </Card>)}
            </div>
            <div>
                <Pagination/>
            </div>
            <SlotList/>
        </div>
    </>
}

function FloorList() {
    const dorm = useStore(state => state.dorm)
    const floor = useStore(state => state.floor)
    const setFloor = useStore(state => state.setFloor)

    if (!dorm) return <></>

    return <>
        <div className={"font-medium"}>Chọn tầng</div>
        <div className={"flex gap-3 flex-wrap"}>
            {[...Array(dorm.totalFloor)].map((val, id) => id + 1).map(f => <Button onClick={() => setFloor(f)}
                                                                                   disabled={f === floor}>Tầng {f}</Button>)}
        </div>
    </>
}

function DormList() {
    const dorm = useStore((state) => state.dorm)
    const totalSlot = useStore((state) => state.totalSlot)
    const setDorm = useStore((state) => state.setDorm)
    const {data, error} = useQuery({
        queryKey: ["dorms"],
        queryFn: () => axiosClient.get("/dorms").then(res => res.data)
    })
    useErrorNotification(error);

    if (!data) return <>
        <Skeleton active/>
    </>

    if (!totalSlot) return <></>

    return <>
        <div className={"font-medium"}>Chọn Dorm</div>
        <div className={"flex gap-2 flex-wrap"}>
            {data.sort((a, b) => a.dormName.localeCompare(b.dormName)).map(item => (
                <Card key={item.id}
                      className={cn("transition-all", {
                          "!bg-blue-50 !border-blue-200": item.id === dorm?.id,
                          "hover:shadow-lg hover:cursor-pointer": item.id !== dorm?.id
                      })}
                      onClick={() => setDorm(item)}>
                    <div className={"flex items-center gap-1"}><Building size={16}/>{item.dormName}</div>
                </Card>
            ))}
        </div>
    </>;
}

function PricingList() {
    const totalSlot = useStore((state) => state.totalSlot)
    const setTotalSlot = useStore(state => state.setTotalSlot)
    const {data, error} = useQuery({
        queryKey: ["pricing"],
        queryFn: () => axiosClient.get("/pricing").then(res => res.data)
    })
    useErrorNotification(error)
    if (!data) return <>
        <Skeleton active/>
    </>
    return <>
        <div className={"font-medium"}>Chọn loại phòng</div>
        <div className={"flex gap-2 flex-wrap"}>
            {data.map(item => <Card key={item.id} className={cn("border-gray-200 transition-all", {
                "!bg-blue-50 !border-blue-200": item.totalSlot === totalSlot,
                "hover:shadow-lg hover:cursor-pointer": item.totalSlot !== totalSlot,
            })} onClick={() => setTotalSlot(item.totalSlot)}>
                <div className={"text-lg font-medium"}>{formatPrice(item.price)}</div>
                <div className={"text- items-center justify-center flex gap-1"}><Bed
                    size={16}/><span>{item.totalSlot} giường</span>
                </div>
            </Card>)}
        </div>
    </>
}

export default function CreateBookingY2() {
    const {data: timeConfig, error: timeConfigError} = useQuery({
        queryKey: ["current-time-config"],
        queryFn: () => axiosClient.get("/time-config/current").then(res => res.data),
        retry: false,
    })
    const {room, slot, dorm, floor, totalSlot} = useStore()

    if (timeConfigError) return (
        <>
            <div className={"section"}>
                <div className={"font-medium text-lg"}>Đặt phòng</div>
            </div>
            <div className={"section"}>
                <Alert showIcon type={"error"} message={"Chưa đến thời gian đặt phòng"}/>
            </div>
        </>
    )

    if (!timeConfig) return <></>

    const {startExtendDate, endExtendDate} = timeConfig;
    if (!dayjs().isBetween(
        startExtendDate,
        endExtendDate,
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
                           message={`Chưa đến thời gian đặt phòng (${formatDate(startExtendDate)} - ${formatDate(endExtendDate)})`}/>
                </div>
            </>
        )
    }
    return (
        <>
            <PageHeader title={"Đặt phòng"}/>
            <div className={"section"}>
                <div className={"flex flex-col gap-3"}>
                    <PricingList/>
                    <DormList/>
                    <FloorList/>
                    {totalSlot && dorm && floor && <RoomList/>}
                </div>
            </div>
            {room && slot && (
                <>
                    <div>
                        <ConfirmSelect slot={slot} room={room}/>
                    </div>
                </>
            )}
        </>
    )
}