import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {Card, Table, Tag} from "antd";
import {useApi} from "../../hooks/useApi.js";
import {useEffect} from "react";
import {formatPrice} from "../../util/formatPrice.js";

const columns = [
    {
        title: 'Giá',
        dataIndex: 'price',
        key: 'price',
        render: (value) => formatPrice(value)
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createDate',
        key: 'createDate',
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: 'status',
        render: (status) => {
            if (status === 'SUCCESS') return <Tag color="green">THÀNH CÔNG</Tag>
            return <Tag color="red">HỦY THANH TOÁN</Tag>
        }
    },
    {
        title: 'Ghi chú',
        dataIndex: 'note',
        key: 'note',
    },
];

export function PaymentHistoryPage() {
    const {get, data} = useApi();

    useEffect(() => {
        get("/payment/history?page=0")
    }, []);

    return <>
        <AppLayout>
            <Card className={"h-full"} title="Lịch sử thanh toán">
                <Table bordered columns={columns} dataSource={data ? data.content : null} />
            </Card>
        </AppLayout>
    </>
}