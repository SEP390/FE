import {RoomCard} from "../../components/booking/RoomCard.jsx";
import {RoomConfirmModal} from "../../components/booking/RoomConfirmModal.jsx";
import {useEffect, useState} from "react";
import {useApi} from "../../hooks/useApi.js";
import {Card, notification, Skeleton} from "antd";

export function BookingY1() {
    const [isOpen, setIsOpen] = useState(false);
    const [room, setRoom] = useState(null);

    const {get, data, isError, error} = useApi();

    const [{error: errorNotification}, context] = notification.useNotification();

    useEffect(() => {
        get("/rooms-matching")
    }, [get]);

    useEffect(() => {
        if (isError) {
            errorNotification({
                message: "Error",
                description: error
            })
        }
    }, [isError]);

    const skeleton = <div className={"flex gap-2"}>
        <Skeleton.Node className={"!w-100 !h-50"} active />
        <Skeleton.Node className={"!w-100 !h-50"} active />
    </div>;

    return <>
        {context}
        <Card title={"Đặt phòng"} className={"h-full"}>
            <RoomConfirmModal isOpen={isOpen} setIsOpen={setIsOpen} room={room} />
            <div className={"flex gap-3 flex-wrap"}>
                {!data && skeleton}
                {data && data.sort((a, b) => (b.matching - a.matching)).map(r =>
                    <RoomCard key={r.id} setSelected={setRoom} setIsOpen={setIsOpen} data={r} />)}
            </div>
        </Card>
    </>
}