import {AppLayout} from "../../../components/layout/AppLayout.jsx";
import {useApi} from "../../../hooks/useApi.js";
import {useEffect} from "react";
import {Card, App, Skeleton, Button, Pagination, Modal, Divider, Descriptions} from "antd";
import {create} from 'zustand'
import {formatPrice} from "../../../util/formatPrice.js";
import {cn} from "../../../util/cn.js";

const useStore = create((set) => ({
    totalSlot: null,
    dorm: null,
    floor: null,
    room: null,
    slot: null,
    setTotalSlot: (totalSlot) => set({ totalSlot, dorm: null, floor: null, room: null }),
    setDorm: (dorm) => set({ dorm, floor: null, room: null }),
    setFloor: (floor) => set({ floor, room: null }),
    setRoom: (room) => set({ room }),
    setSlot: (slot) => set({ slot }),
}))

function SlotModal() {
    const room = useStore(state => state.room);
    const dorm = useStore(state => state.dorm);
    const slot = useStore(state => state.slot);
    const setSlot = useStore(state => state.setSlot);

    return <Modal
        title={"Xác nhận"}
        open={slot !== null}
        onCancel={() => setSlot(null)}
        onOk={() => setSlot(null)}>
        <Descriptions bordered items={[
            {
                key: "dormName",
                label: "Dorm",
                children: dorm?.dormName
            },
            {
                key: "roomNumber",
                label: "Phòng",
                children: room?.roomNumber
            },
            {
                key: "floor",
                label: "Tầng",
                children: room?.floor
            },
            {
                key: "price",
                label: "Giá",
                children: room ? formatPrice(room.pricing.price) : ''
            },
        ]}/>
    </Modal>
}
function SlotList() {
    const setSlot = useStore(state => state.setSlot);
    const room = useStore(state => state.room);

    const { get, data, error } = useApi();

    const {notification} = App.useApp();
    useEffect(() => {
        if(error) notification.error({ message: "Lỗi", description: error.toString() });
    }, [error, notification]);

    useEffect(() => {
        if (!room) return;
        get("/rooms/" + room.id)
    }, [get, room]);

    if (!data) return <></>

    return <>
        <SlotModal />
        <div className={"flex gap-2"}>
            {data.slots.map((item) => <Card hoverable onClick={() => setSlot(item)} key={item.id}>
                {item.slotName}
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

    const { get, data, error } = useApi();

    const {notification} = App.useApp();
    useEffect(() => {
        if(error) notification.error({ message: "Lỗi", description: error.toString() });
    }, [error, notification]);

    useEffect(() => {
        if (!totalSlot || !dorm || !floor) return
        get("/rooms/booking", {
            totalSlot, dormId: dorm.id, floor
        });
    }, [dorm, floor, get, totalSlot]);

    if (!totalSlot || !dorm || !floor) return <></>

    if (!data) return <>
        <Skeleton active />
    </>

    return <>
        <div className={"flex flex-col gap-2"}>
            <div className={"font-medium"}>Chọn phòng</div>
            <div className={"flex gap-2"}>
                {data.content.sort((a,b) => a.roomNumber.localeCompare(b.roomNumber)).map((item) => <Card className={cn({"!bg-gray-100": item.id === room?.id})} hoverable onClick={() => setRoom(item)} key={item.id}>
                    {item.roomNumber}
                </Card>)}
            </div>
            <div>
                <Pagination />
            </div>
            <SlotList />
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
        <div className={"flex gap-3"}>
            {[...Array(dorm.totalFloor)].map((val,id) => id+1).map(f => <Button onClick={() => setFloor(f)} disabled={f === floor}>Tầng {f}</Button>)}
        </div>
    </>
}

function DormList() {
    const { get, data, error } = useApi();
    const dorm = useStore((state) => state.dorm)
    const totalSlot = useStore((state) => state.totalSlot)
    const setDorm = useStore((state) => state.setDorm)
    const {notification} = App.useApp();

    useEffect(() => {
        get("/dorms");
    }, [get]);

    useEffect(() => {
        if(error) notification.error({ message: "Lỗi", description: error.toString() });
    }, [error, notification]);

    if (!data) return <>
        <Skeleton active />
    </>

    if (!totalSlot) return <></>

    return <>
        <div className={"font-medium"}>Chọn Dorm</div>
        <div className={"flex gap-2"}>
            {data.sort((a,b) => a.dormName.localeCompare(b.dormName)).map(item => <Card key={item.id} className={cn({"!bg-gray-50": item.id === dorm?.id})} hoverable onClick={() => setDorm(item)}>
                <div>{item.dormName}</div>
            </Card>)}
        </div>
    </>;
}

function PricingList() {
    const { get, data, error } = useApi();
    const totalSlot = useStore((state) => state.totalSlot)
    const setTotalSlot = useStore(state => state.setTotalSlot)
    const {notification} = App.useApp();
    useEffect(() => {
        if(error) notification.error({ message: "Lỗi", description: error.toString() });
    }, [error, notification]);
    useEffect(() => {
        get("/pricing");
    }, [get]);
    if (!data) return <>
        <Skeleton active />
    </>
    return <>
        <div className={"font-medium"}>Chọn loại phòng</div>
        <div className={"flex gap-2"}>
            {data.map(item => <Card key={item.id} className={cn({"!bg-gray-50": item.totalSlot === totalSlot})} hoverable onClick={() => setTotalSlot(item.totalSlot)}>
                <div>Phòng {item.totalSlot} giường</div>
                <div>{formatPrice(item.price)}</div>
            </Card>)}
        </div>
    </>
}
export default function BookingYear2Page() {
    return <AppLayout>
        <Card className={"h-full overflow-y-auto"}>
            <div className={"flex flex-col gap-3"}>
                <PricingList />
                <DormList />
                <FloorList />
                <RoomList />
            </div>
        </Card>
    </AppLayout>
}