import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {useEffect, useState} from "react";
import {useApi} from "../../hooks/useApi.js";
import {Spin} from "antd";
import {CurrentBooking} from "./CurrentBooking.jsx";
import {BookingY1} from "./BookingY1.jsx";

export function BookingPage() {
    const {get, data, isComplete, isSuccess} = useApi();

    useEffect(() => {
        get("/booking/current")
    }, [get]);

    return <Spin spinning={!isComplete}>
        <AppLayout activeSidebar={"booking"}>
            {isSuccess && data && <CurrentBooking data={data}/>}
            {isSuccess && !data && <BookingY1 />}
        </AppLayout>
    </Spin>
}