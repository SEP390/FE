import {useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import {useApi} from "../../hooks/useApi.js";
import {Result, Skeleton} from "antd";
import {AppLayout} from "../../components/layout/AppLayout.jsx";

export function PaymentResult() {
    const [searchParams] = useSearchParams();

    const params = Object.fromEntries(searchParams.entries());

    const {get, data, isLoading} = useApi();

    useEffect(() => {
        get("/payment/verify?" + new URLSearchParams(params));
    }, []);

    useEffect(() => {
        console.log(data);
    }, [data]);

    const subTitle = (data) => {
        if (data && data.slotHistory) {
            return <span>{data.slotHistory.slot.slotName}, {data.slotHistory.slot.room.roomNumber}, {data.slotHistory.slot.room.dorm.dormName}</span>
        }
        return "";
    }

    return <>
        <AppLayout>
            <div className={"h-full bg-white rounded-lg flex items-center justify-center"}>
                <div className={"p-3"}>
                    {isLoading && <Skeleton active />}
                    {data && data.status === "CANCEL" && <>
                        <Result
                            status="info"
                            title="Bạn đã hủy thanh toán"
                        />
                    </>}
                    {data && data.status === "SUCCESS" && <>
                        <Result
                            status="success"
                            title="Thanh toán thành công"
                            subTitle={subTitle(data)}
                        />
                    </>}
                </div>
            </div>
        </AppLayout>
    </>
}