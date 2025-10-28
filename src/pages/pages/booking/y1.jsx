import {RoomCard} from "../../../components/booking/RoomCard.jsx";
import {RoomConfirmModal} from "../../../components/booking/RoomConfirmModal.jsx";
import {useEffect, useState} from "react";
import {useApi} from "../../../hooks/useApi.js";
import {Alert, App, Card, Skeleton} from "antd";
import {AppLayout} from "../../../components/layout/AppLayout.jsx";

export default function BookingYear1Page() {
    const [isOpen, setIsOpen] = useState(false);
    const [room, setRoom] = useState(null);
    const {get, data, error, isSuccess} = useApi();
    const {notification} = App.useApp();
    useEffect(() => {
        if(error) notification.error({ message: "Lỗi", description: error.toString() });
    }, [error, notification]);
    useEffect(() => {
        get("/rooms-matching")
    }, [get]);
    const skeleton = <div className={"flex gap-2"}>
        <Skeleton.Node className={"!w-100 !h-50"} active />
        <Skeleton.Node className={"!w-100 !h-50"} active />
    </div>;
    return <>
        <AppLayout activeSidebar={"booking"}>
            <Card title={"Đặt phòng"} className={"h-full"}>
                <RoomConfirmModal isOpen={isOpen} setIsOpen={setIsOpen} room={room} />
                <div className={"flex gap-3 flex-wrap"}>
                    {isSuccess && data.length === 0 && <>
                        <Alert message={"Không còn phòng phù hợp với bạn"} />
                    </>}
                    {!data && skeleton}
                    {data && data.sort((a, b) => (b.matching - a.matching)).map(r =>
                        <RoomCard key={r.id} setSelected={setRoom} setIsOpen={setIsOpen} data={r} />)}
                </div>
            </Card>
        </AppLayout>
    </>
}