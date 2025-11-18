import {useEffect} from "react";
import {Button, Card, Table, Tag} from "antd";
import {create} from 'zustand'
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import {formatPrice} from "../../util/formatPrice.js";

const useStore = create(set => ({
    data: null,
    fetchData: async ({page}) => {
        const res = await axiosClient("/user/invoices", {
            params: {
                page
            }
        })
        console.log(res.data)
        set({ data: res.data })
    },
    page: 0,
    setPage: (page) => set({page})
}))

function PaymentAction({invoiceId}) {
    const onClick = async () => {
        const res = await axiosClient({
            url: "/payment/" + invoiceId,
            method: "GET",
        })
        const paymentUrl = res.data;
        window.open(paymentUrl, '_blank').focus();
    }
    return <Button onClick={onClick} type={"link"}>Thanh toán</Button>
}

function InvoiceDetailModal() {

}

export default function InvoicesPage() {
    const {data, fetchData, page, setPage} = useStore()
    useEffect(() => {
        fetchData({page,})
    }, [fetchData, page,]);

    return <AppLayout activeSidebar={"invoices"}>
        <Card title={"Danh sách hóa đơn"} className={"h-full overflow-auto"}>
            <Table bordered dataSource={data ? data.content : []} columns={[
                {
                    title: "Giá",
                    dataIndex: ["price"],
                    render: (val) => formatPrice(val),
                },
                {
                    title: "Nội dung",
                    dataIndex: "reason",
                },
                {
                    title: "Loại",
                    dataIndex: ["type"],
                    render: (val) => {
                        if (val === "BOOKING") return <Tag>Đặt phòng</Tag>
                    }
                },
                {
                    title: "Trạng thái",
                    dataIndex: ["status"],
                    render: (val) => {
                        if (val === "PENDING") return <Tag>Chưa thanh toán</Tag>
                        if (val === "SUCCESS") return <Tag color={"green"}>Đã thanh toán</Tag>
                        if (val === "CANCEL") return <Tag color={"red"}>Hủy thanh toán</Tag>
                    }
                },
                {
                    title: "Hành động",
                    render: (val, row) => {
                        if (row.status === "PENDING") return <PaymentAction invoiceId={row.id}/>
                    }
                }
            ]} pagination={{
                current: page + 1
            }}/>
        </Card>
    </AppLayout>
}