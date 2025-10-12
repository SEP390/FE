import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {RoomCard} from "../../components/booking/RoomCard.jsx";
import {RoomConfirmModal} from "../../components/booking/RoomConfirmModal.jsx";
import {useEffect, useState} from "react";
import {useApi} from "../../hooks/useApi.js";
import {Card, notification, Skeleton} from "antd";
import {CurrentBooking} from "./CurrentBooking.jsx";
import {BookingY1} from "./BookingY1.jsx";

export function BookingPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [room, setRoom] = useState(null);

    const {get, data, isError, isLoading, error} = useApi();

    const [isCurrentBooking, setCurrentBooking] = useState(false);

    useEffect(() => {
        get("/booking/current")
    }, [get]);

    useEffect(() => {
        if (data && data.status !== "CANCEL") {
            setCurrentBooking(true);
        }
    }, [data])

    return <AppLayout activeSidebar={"booking"}>
        <Card className={"h-full overflow-auto"} title={isCurrentBooking ? "Phòng hiện tại" : "Đặt phòng"}>
            {isLoading && <Skeleton active />}
            {isCurrentBooking && <CurrentBooking data={data} />}
            {!isCurrentBooking && <BookingY1 />}
        </Card>
    </AppLayout>
}