import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {Button, Card, Table, Tag} from "antd";
import {formatPrice} from "../../util/formatPrice.js";
import {useApi} from "../../hooks/useApi.js";
import {useEffect} from "react";

function BillAction({data}) {
    const {get, data: paymentUrl} = useApi();

    const onClick = () => {
        get("/electric-water/" + data);
    }

    if (paymentUrl) {
        window.location.href = paymentUrl;
    }

    return <>
        <a onClick={onClick}>Thanh toán</a>
    </>;
}

export function ElectricWaterBillPage() {
    const {get, data} = useApi();



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
            render: (value) => {
                return Intl.DateTimeFormat('vi-VN', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                }).format(new Date(value));
            }
        },
        {
            title: 'Số điện',
            dataIndex: 'kw',
            key: 'kw',
            render: (value) => {
                return Intl.NumberFormat('vi-VN', {}).format(value) + " kw"
            }
        },
        {
            title: 'Số nước',
            dataIndex: 'm3',
            key: 'm3',
            render: (value) => {
                return <span>{Intl.NumberFormat('vi-VN', {}).format(value)} m<sup>3</sup></span>
            }
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: 'status',
            render: (status) => {
                if (status === 'PENDING') return <Tag color="default">CHỜ THANH TOÁN</Tag>
                if (status === 'SUCCESS') return <Tag color="green">ĐÃ THANH TOÁN</Tag>
                return <Tag color="red">HỦY THANH TOÁN</Tag>
            }
        },
        {
            title: 'Hành động',
            dataIndex: 'id',
            key: 'id',
            render: (value, row) => {
                if (row.status === "PENDING") return <BillAction data={value}/>
                return <></>
            }
        },
    ];

    useEffect(() => {
        get("/electric-water")
    }, []);

    const dataSource = data ? data.map(item => {
        item.key = item.id;
        Object.assign(item, item.roomBill);
        return item;
    }) : []

    return <>
        <AppLayout activeSidebar={"electric-water"}>
            <Card className={"h-full"} title={"Hóa đơn điện nước"}>
                <Table bordered columns={columns} dataSource={dataSource}></Table>
            </Card>
        </AppLayout>
    </>
}