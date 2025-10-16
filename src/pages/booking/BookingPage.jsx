import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {useEffect, useState} from "react";
import {useApi} from "../../hooks/useApi.js";
import {useNavigate} from "react-router-dom";
import {Spin} from "antd";
import {CurrentBooking} from "./CurrentBooking.jsx";
import {BookingY1} from "./BookingY1.jsx";

export function BookingPage() {
    const {get, data, isError, isComplete} = useApi();
    const [outlet, setOutlet] = useState(null);

    useEffect(() => {
        get("/booking/current")
    }, [get]);

    useEffect(() => {
        if (!isComplete) return;
        if (data) {
            setOutlet(<CurrentBooking data={data}/>);
        } else {
            setOutlet(<BookingY1 />);
        }
    }, [data, isComplete]);

    return <Spin spinning={!isComplete}>
        <AppLayout activeSidebar={"booking"}>
            {outlet}
        </AppLayout>
    </Spin>
}