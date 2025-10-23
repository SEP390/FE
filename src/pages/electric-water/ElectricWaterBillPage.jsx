import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {Card, Table, Tag} from "antd";
import {formatPrice} from "../../util/formatPrice.js";
import {useApi} from "../../hooks/useApi.js";
import {useEffect} from "react";

function BillAction({data}) {
    const {get, data: paymentUrl} = useApi();

    const onClick = () => {
        get(`/electric-water-bill/${data.id}/payment-url`);
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
            title: 'Kỳ',
            dataIndex: 'semesterName',
            key: 'semesterName',
            render: (value) => {
                return <Tag>{value}</Tag>
            }
        },
        {
            title: 'Số điện',
            dataIndex: 'electricIndex',
            key: 'electricIndex',
            render: (value) => {
                return Intl.NumberFormat('vi-VN', {}).format(value) + " kw"
            }
        },
        {
            title: 'Số nước',
            dataIndex: 'waterIndex',
            key: 'waterIndex',
            render: (value) => {
                return <span>{Intl.NumberFormat('vi-VN', {}).format(value)} m<sup>3</sup></span>
            }
        },
        {
            title: "Thanh toán",
            dataIndex: "paid",
            key: 'paid',
            render: (paid) => {
                if (!paid) return <Tag color="default">CHỜ THANH TOÁN</Tag>
                return <Tag color="green">ĐÃ THANH TOÁN</Tag>
            }
        },
        {
            title: 'Hành động',
            dataIndex: 'id',
            key: 'id',
            render: (value, row) => {
                if (!row.paid) return <BillAction data={row}/>
                return <></>
            }
        },
    ];

    useEffect(() => {
        get("/electric-water-bill/user")
    }, []);

    const dataSource = data ? data.content.map(item => {
        item.key = item.id;
        Object.assign(item, item.bill);
        item.waterIndex = item.index.waterIndex;
        item.electricIndex = item.index.electricIndex;
        item.semesterName = item.index.semester.name;
        item.semesterId = item.index.semester.id;
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