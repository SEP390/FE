import {useEffect} from "react";
import {Button, Modal, Table, Tag} from "antd";
import {create} from 'zustand'
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import {formatPrice} from "../../util/formatPrice.js";
import {formatTime} from "../../util/formatTime.js";
import {useApi} from "../../hooks/useApi.js";
import useErrorNotification from "../../hooks/useErrorNotification.js";
import {UserInvoiceCount} from "../../components/UserInvoiceCount.jsx";
import {PageHeader} from "../../components/PageHeader.jsx";
import {InvoiceTypeFilter} from "../../components/InvoiceTypeSelect.jsx";
import {InvoiceStatusFilter} from "../../components/InvoiceStatusSelect.jsx";

const useInvoiceModalStore = create(set => ({
    invoice: null,
    open: (invoice) => set({invoice, isOpen: true}),
    isOpen: false,
    close: () => set({invoice: null, isOpen: false}),
}))

function DetailAction({invoice}) {
    const {open} = useInvoiceModalStore();
    return <Button onClick={() => open(invoice)} type={"link"}>Chi tiết</Button>
}

function InvoiceModal() {
    const {isOpen, close} = useInvoiceModalStore();
    return <Modal open={isOpen} onCancel={close} onOk={close}>
        hello
    </Modal>
}

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

const usePageStore = create(set => ({
    page: 0,
    setPage: (page) => set({page}),
}))

export default function InvoicesPage() {
    const {get, data, error} = useApi();

    const {page, setPage} = usePageStore()

    useEffect(() => {
        get("/user/invoices")
    }, [get]);

    useErrorNotification(error);

    return <AppLayout activeSidebar={"invoices"}>
        <InvoiceModal/>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={"Danh sách hóa đơn"}/>
            <UserInvoiceCount />
            <div className={"section"}>
                <div className={"font-medium text-lg mb-3"}>Bộ lọc</div>
                <div className={"flex gap-3 flex-wrap"}>
                    <InvoiceTypeFilter />
                    <InvoiceStatusFilter />
                </div>
            </div>
            <div className={"section"}>
                <Table className={"overflow-auto"} bordered dataSource={data ? data.content : []} columns={[
                    {
                        title: "Ngày tạo",
                        dataIndex: ["createTime"],
                        render: (val) => formatTime(val),
                    },
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
                            const btns = [<DetailAction invoice={row}/>]
                            if (row.status === "PENDING") btns.push(<PaymentAction invoiceId={row.id}/>)
                            return btns;
                        }
                    }
                ]} pagination={{
                    current: page + 1
                }}/>
            </div>
        </div>
    </AppLayout>
}