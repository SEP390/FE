import {useEffect} from "react";
import {Link, useSearchParams} from "react-router-dom";
import {useApi} from "../../hooks/useApi.js";
import {Button, Descriptions, Result, Skeleton, Tag} from "antd";
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {formatPrice} from "../../util/formatPrice.js";
import {formatDate} from "../../util/formatTime.js";

function BookingDetail({data}) {
    return <div className={"w-100 mx-auto"}><Descriptions layout={"vertical"} items={[
        {
            label: "Dorm",
            children: <span>{data.slotInvoice.room.dorm.dormName}</span>
        },
        {
            label: "Phòng",
            children: <span>{data.slotInvoice.room.roomNumber}</span>
        },
        {
            label: "Slot",
            children: <span>{data.slotInvoice.slotName}</span>
        },
        {
            label: "Giá",
            children: <span>{formatPrice(data.price)}</span>
        },
        {
            label: "Kỳ",
            children: <Tag>{data.slotInvoice.semesterName}</Tag>
        },
    ]}/></div>
}
export function PaymentResult() {
    const [searchParams] = useSearchParams();

    const params = Object.fromEntries(searchParams.entries());

    const {post, data, isLoading} = useApi();

    useEffect(() => {
        post("/payment?" + new URLSearchParams(params), null);
    }, []);

    const subTitle = (data) => {
        if (data && data.slotHistory) {
            return <span>{data.slotHistory.slotName}, {data.slotHistory.roomNumber}, {data.slotHistory.dormName}</span>
        }
        return "";
    }

    const extra = (data) => {
        if (data && data.slotInvoice) {
            return [
                <Button><Link to={"/pages/booking/history"}>Lịch sử đặt
                    phòng</Link></Button>, data.status !== 'SUCCESS' &&
                <Button><Link to={"/booking"}>Đặt lại phòng</Link></Button>
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
                    {isLoading && <Skeleton active/>}
                    {data && <Result
                        status={status(data)}
                        title={title(data)}
                        subTitle={subTitle(data)}
                        extra={extra(data)}
                    />}
                    {data && data.type === 'BOOKING' && <BookingDetail data={data} />}
                </div>
            </div>
        </AppLayout>
    </>
}