import React, {useEffect, useRef, useState} from "react";
import {useApi} from "../../../hooks/useApi.js";
import {Alert, App, Button, Card, message, Modal, notification, Skeleton, Tour} from "antd";
import {AppLayout} from "../../../components/layout/AppLayout.jsx";
import {useNavigate} from "react-router-dom";
import {create} from 'zustand'
import {Bed, MapPin, TrendingUp} from "lucide-react";
import {formatPrice} from "../../../util/formatPrice.js";
import {cn} from "../../../util/cn.js";

const useTourStore = create(set => ({
    isOpen: true,
    steps: null,
    setSteps: (steps) => set({ steps }),
    setIsOpen: (isOpen) => set({ isOpen }),
}))

const useModalStore = create(set => ({
    isOpen: true,
    close: () => set({ isOpen: false }),
    open: () => set({ isOpen: true }),
}))

const useRoomStore = create(set => ({
    room: null,
    setRoom: (room) => set({ room }),
    rooms: null,
    setRooms: (rooms) => set({ rooms }),
}))

const useSlotStore = create(set => ({
    slot: null,
    setSlot: (slot) => set({ slot }),
}))

function SlotCard({ data }) {
    const setSlot = useSlotStore(state => state.setSlot)
    const slot = useSlotStore(state => state.slot)

    const selected = data.id === slot?.id;

    const onClick = () => {
        if (data.status !== "AVAILABLE") return;
        setSlot(data);
    }

    return <>
        <Card onClick={onClick} hoverable={!selected && data.status === "AVAILABLE"} className={cn({
            "!bg-blue-50 !text-blue-600 !border-blue-50": selected,
            "cursor-pointer": !selected && data.status === "AVAILABLE",
            "!bg-gray-100 border !border-gray-200": data.status !== "AVAILABLE",
        }, "transition-all")}>
            <Bed/>
            <span>{data.slotName}</span>
        </Card>
    </>
}

function RoomConfirmModal() {
    const [tourOpen, setTourOpen] = useState(true);
    const room = useRoomStore(state => state.room);
    const isOpen = useModalStore(state => state.isOpen)
    const closeModal = useModalStore(state => state.close)
    const { post, data, isLoading } = useApi();
    const slot = useSlotStore(state => state.slot);
    const setSlot = useSlotStore(state => state.setSlot);

    const slotRef = useRef();
    const paymentRef = useRef();

    const onPayment = () => {
        if (isLoading) return;
        if (!slot) {
            return;
        }
        post("/booking/create", {
            slotId: slot.id
        });
    }

    useEffect(() => {
        if (!data) return;
        window.location.href = data.paymentUrl;
    }, [data]);

    const onClose = () => {
        closeModal();
        setSlot(null);
    }

    if (!room) return <></>;

    return <>
        <Modal
            width={"1000px"}
            title="Xác nhận"
            closable={{'aria-label': 'Custom Close Button'}}
            open={isOpen}
            onOk={onClose}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>Hủy</Button>,
                <Button ref={paymentRef} loading={isLoading} type={"primary"} key="payment" onClick={onPayment}>Thanh toán</Button>
            ]}>
            <div className={"grid grid-cols-2 gap-3"}>
                <Card title={"Thông tin"}>
                    <div className={"flex flex-col gap-4"}>
                        <div className={"grid grid-cols-3"}>
                            <div>
                                <div className={"font-medium"}>Phòng</div>
                                <div>{room.roomNumber}</div>
                            </div>
                            <div>
                                <div className={"font-medium"}>Tòa</div>
                                <div className={"flex items-center gap-1 text-sm text-gray-600 mb-2"}>
                                    {room.dorm.dormName}
                                </div>
                            </div>
                            <div>
                                <div className={"font-medium"}>Tầng</div>
                                <div>{room.floor}</div>
                            </div>
                        </div>
                        <div className={"flex flex-col gap-2"}>
                            <div className={"font-medium"}>Chọn slot</div>
                            <div ref={slotRef} className={"flex flex-wrap gap-2"}>
                                {room.slots.sort((a, b) => a.slotName.localeCompare(b.slotName))
                                    .map(s => <SlotCard
                                        setSelected={setSlot}
                                        selected={s.id === slot?.id}
                                        key={s.id} data={s}/>)}
                            </div>
                        </div>
                    </div>
                </Card>
                <Card title={"Giá"}>
                    <div className={"flex gap-1 items-center"}>
                        <div className={"text-2xl font-medium"}>{formatPrice(room.pricing.price)}</div>
                        <div>/ tháng</div>
                    </div>
                </Card>
            </div>
        </Modal>
        <Tour open={tourOpen} onClose={() => setTourOpen(false)} steps={[
            {
                title: "Chọn slot",
                description: "Chọn slot cần đăt",
                target: () => slotRef.current,
            },
            {
                title: "Thanh toán",
                description: "Thanh toán slot đã chọn",
                target: () => paymentRef.current,
            }
        ]} />
    </>;
}

function AuthorizationLayer() {
    const {get, data, error, isSuccess} = useApi();
    const navigate = useNavigate();
    useEffect(() => {
        if(error) navigate("/");
    }, [error]);
    useEffect(() => {
        get("/booking/current")
    }, [get]);

    useEffect(() => {
        if (!isSuccess) return;
        if (data && data.status === 'UNAVAILABLE') navigate("/booking");
        if (data && data.status === 'LOCK') navigate("/booking");
    }, [isSuccess, data, navigate]);
    
    if (!isSuccess) return <></>;
    
    return <BookingYear1 />
}

const getMatchingColor = (matching) => {
    if (matching >= 90) return 'text-green-600';
    if (matching >= 85) return 'text-blue-600';
    return 'text-amber-600';
};

function RoomItem({ data, refs }) {
    const setRoom = useRoomStore(state => state.setRoom);
    const openModal = useModalStore(state => state.open);

    const onClick = () => {
        setRoom(data);
        openModal();
    }

    return <>
        <div ref={refs?.allRef} className={"bg-gray-50 rounded-lg p-4 flex flex-col gap-3"}>
            <div ref={refs?.locationRef}>
                <div className={"font-medium text-xl"}>{data.roomNumber}</div>
                <div className={"flex gap-1 items-center text-gray-600"}>
                    <MapPin size={16}/>
                    <span>{data.dorm.dormName}, Tầng {data.floor}</span>
                </div>
            </div>
            <div className={"grid grid-cols-2 gap-3"}>
                <div ref={refs?.priceRef} className={"bg-white rounded-lg p-3"}>
                    <div>Giá</div>
                    <div className={"text-xl font-bold"}>{formatPrice(data.pricing.price)}</div>
                </div>
                <div ref={refs?.matchingRef} className={"bg-white rounded-lg p-3"}>
                    <div>Độ phù hợp</div>
                    <div className={cn("font-bold text-xl", getMatchingColor(data.matching))}>{Math.round((data.matching * 100) / 100).toFixed(2)}%</div>
                </div>
                <div className={"bg-white rounded-lg p-3"}>
                    <div>Số slot còn lại</div>
                    <div className={"text-xl font-bold"}>{data.slots.filter(slot => slot.status === 'AVAILABLE').length}</div>
                </div>
                <div className={"bg-white rounded-lg p-3"}>
                    <div>Tổng số slot</div>
                    <div className={"text-xl font-bold"}>{data.totalSlot}</div>
                </div>
            </div>
            <div>
                <Button onClick={onClick} ref={refs?.detailRef}>Chi tiết</Button>
            </div>
        </div>
    </>
}

function RoomList() {
    const rooms = useRoomStore(state => state.rooms);

    const setTourOpen = useTourStore(state => state.setIsOpen)
    const isTourOpen = useTourStore(state => state.isOpen)
    
    const allRef = useRef();
    const detailRef = useRef();
    const locationRef = useRef();
    const priceRef = useRef();
    const matchingRef = useRef();

    if(rooms == null) return <></>;

    if (rooms.length === 0) return <>
        <Alert message={"Không còn phòng phù hợp với bạn"} />
    </>;

    return <>
        <div className={"flex flex-col gap-3"}>
            <div className={"flex items-center gap-2 p-4 rounded-lg bg-orange-600 text-white"}>
                <TrendingUp />
                <div>
                    <div className={"text-xl"}>Top 5 phòng phù hợp nhất với bạn</div>
                    <div>Dựa trên khảo sát tính cách</div>
                </div>
            </div>
            <div className={"grid grid-cols-2 gap-3"}>
                {rooms.map((room, index) => {
                    if (index === 0) return <RoomItem refs={{
                        allRef, detailRef, locationRef, priceRef, matchingRef
                    }} key={room.id} data={room} />
                    return <RoomItem key={room.id} data={room} />
                })}
            </div>
            <Tour open={isTourOpen} onClose={() => setTourOpen(false)} steps={[
                {
                    title: "Phòng",
                    description: "Thông tin phòng",
                    target: () => allRef.current,
                },
                {
                    title: "Vị trí phòng",
                    description: "Vị trí của phòng",
                    target: () => locationRef.current,
                },
                {
                    title: "Giá phòng",
                    description: "Giá của phòng",
                    target: () => priceRef.current,
                },
                {
                    title: "Độ phù hợp",
                    description: "Độ phù hợp dựa trên khảo sát",
                    target: () => matchingRef.current,
                },
                {
                    title: "Chi tiết phòng",
                    description: "Nhấn để xem chi tiết",
                    target: () => detailRef.current,
                },
            ]} />
        </div>
    </>
}

function BookingYear1() {
    const {get, data, error} = useApi();
    const setRooms = useRoomStore(state => state.setRooms);
    const {notification} = App.useApp();
    useEffect(() => {
        if(error) notification.error({ message: "Lỗi", description: error.toString() });
    }, [error, notification]);
    useEffect(() => {
        get("/rooms-matching")
    }, [get]);
    useEffect(() => {
        setRooms(data)
    }, [data, setRooms]);
    return <>
        <AppLayout activeSidebar={"booking"}>
            <Card title={"Đặt phòng"} className={"h-full overflow-auto"}>
                <div className={"flex flex-col gap-3"}>
                    <RoomList />
                    <RoomConfirmModal />
                </div>
            </Card>
        </AppLayout>
    </>
}

export default function BookingYear1Page() {
    return <AuthorizationLayer />
}