import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {useEffect} from "react";
import {useApi} from "../../hooks/useApi.js";
import {Card, Skeleton} from "antd";
import {CurrentBooking} from "./CurrentBooking.jsx";
import {BookingY1} from "./BookingY1.jsx";

export function BookingPage() {
    const {get, data, isError, isComplete} = useApi();

    useEffect(() => {
        get("/booking/current")
    }, [get]);

    const loader = <Card title={<Skeleton className={"!w-30"} active paragraph={false} />} className={"h-full overflow-auto"}>
        <div className={"flex gap-2"}>
            <Skeleton active />
        </div>
    </Card>;

    const content = !isComplete || isError ?
        loader :
        data ? <CurrentBooking data={data} /> : <BookingY1 />

    return <AppLayout activeSidebar={"booking"}>
        {content}
    </AppLayout>
}