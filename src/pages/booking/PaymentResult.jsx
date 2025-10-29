import {useEffect} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {useApi} from "../../hooks/useApi.js";
import {Button, Result, Skeleton} from "antd";
import {AppLayout} from "../../components/layout/AppLayout.jsx";

export function PaymentResult() {
    const [searchParams] = useSearchParams();

    const params = Object.fromEntries(searchParams.entries());

    const {get, data, isLoading} = useApi();

    useEffect(() => {
        get("/payment/verify?" + new URLSearchParams(params));
    }, []);

    const subTitle = (data) => {
        if (data && data.slotHistory) {
            return <span>{data.slotHistory.slotName}, {data.slotHistory.roomNumber}, {data.slotHistory.dormName}</span>
        }
        return "";
    }

    const extra = (data) => {
        if (data && data.slotHistory) {
            return [
                <Button><Link to={"/booking-history"}>Lịch sử đặt phòng</Link></Button>, data.status !== 'SUCCESS' && <Button><Link to={"/booking"}>Đặt lại phòng</Link></Button>
            ]
        }
        if (data && data.electricWaterBill) {
            return [
                <Button><Link to={"/electric-water"}>Quay về hóa đơn điện nước</Link></Button>
            ]
        }
    }

    const status = (data) => {
        if (data.status === "CANCEL") return "info";
        if (data.status === "SUCCESS") return "success";
        return "";
    }
    const title = (data) => {
        if (data.status === "CANCEL") return "Bạn đã hủy thanh toán";
        if (data.status === "SUCCESS") return "Thanh toán thành công";
        return "";
    }

    return <>
        <AppLayout>
            <div className={"h-full bg-white rounded-lg flex items-center justify-center"}>
                <div className={"p-3"}>
                    {isLoading && <Skeleton active />}
                    {data && <Result
                        status={status(data)}
                        title={title(data)}
                        subTitle={subTitle(data)}
                        extra={extra(data)}
                    />}
                </div>
            </div>
        </AppLayout>
    </>
}