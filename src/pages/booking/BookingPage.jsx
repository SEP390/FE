import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {useEffect} from "react";
import {useApi} from "../../hooks/useApi.js";
import {App, Button, Card, Descriptions, Empty, List, Skeleton, Spin, Tag} from "antd";
import {useNavigate} from "react-router-dom";
import {formatPrice} from "../../util/formatPrice.js";

function PendingPayment() {
    const { get, data, error} = useApi();

    const onPayment = () => {
        get("/booking/latest-payment-url")
    }

    useEffect(() => {
        if (data) window.location.href = data;
    }, [data]);

    return <div className={"mb-4 flex flex-col gap-2"}>
        <div className={"text-red-600"}>* Bạn chưa thanh toán</div>
        <div className={"w-30"}>
            <Button onClick={onPayment}>Thanh toán</Button>
        </div>
    </div>
}

function RoomMates({ roomId }) {
    const {get, data, error} = useApi();
    const {notification} = App.useApp();
    useEffect(() => {
        if(error) notification.error({ message: "Lỗi", description: error.toString() });
    }, [error, notification]);
    useEffect(() => {
        if (!roomId) return;
        get(`/rooms/${roomId}/roommates`)
    }, [roomId, get]);

    return <>
        {data !== null && <>
            <Card title={"Bạn cùng phòng"}>
                {data.length === 0 && <Empty />}
                <List>
                    {data.map((rm) => <List.Item key={rm.id}>
                        <div className={"flex gap-2"}>
                            <span>{rm.email}</span><Tag>Match {rm.matching}%</Tag>
                        </div>
                    </List.Item>)}
                </List>
            </Card>
        </>}
    </>
}

export function CurrentBooking({ data }) {
    if (!data) return <>
        <Skeleton active />
    </>

    return <>
        <Card title={"Thông tin phòng hiện tại"} className={"h-full"}>
            {data && data.status === 'LOCK' && <PendingPayment />}
            <Descriptions bordered className={"!mb-5"}>
                <Descriptions.Item label="Slot">
                    {data?.slotName}
                </Descriptions.Item>
                <Descriptions.Item label="Phòng">
                    {data?.room?.roomNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Tòa">
                    {data?.room?.dorm?.dormName}
                </Descriptions.Item>
                <Descriptions.Item label="Tầng">
                    {data?.room?.floor}
                </Descriptions.Item>
                <Descriptions.Item label="Giá">
                    <div>{formatPrice(data?.room?.pricing?.price)}</div>
                </Descriptions.Item>
            </Descriptions>
            <div>
                <RoomMates roomId={data?.room?.id}/>
            </div>
        </Card>
    </>
}

export function BookingPage() {
    const {get, data, error, isSuccess} = useApi();

    const navigate = useNavigate()
    const {notification} = App.useApp();
    useEffect(() => {
        if(error) notification.error({ message: "Lỗi", description: error.toString() });
    }, [error, notification]);
    useEffect(() => {
        get("/booking/current")
    }, [get]);

    useEffect(() => {
        if (isSuccess && (!data || data.status === 'CANCEL')) navigate("/pages/booking/y1")
    }, [data, isSuccess, navigate]);

    return <Spin spinning={!isSuccess}>
        <AppLayout activeSidebar={"booking"}>
            <CurrentBooking data={data}/>
        </AppLayout>
    </Spin>
}