import {useEffect} from "react";
import {Button, Modal, Table, Tag} from "antd";
import {create} from 'zustand'
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {formatPrice} from "../../util/formatPrice.js";
import {formatTime} from "../../util/formatTime.js";
import useErrorNotification from "../../hooks/useErrorNotification.js";
import {PageHeader} from "../../components/PageHeader.jsx";
import {InvoiceTypeFilter} from "../../components/InvoiceTypeSelect.jsx";
import {InvoiceStatusFilter} from "../../components/InvoiceStatusSelect.jsx";
import {useApiStore} from "../../hooks/useApiStore.js";
import {createApiStore} from "../../util/createApiStore.js";
import {useViewEffect} from "../../hooks/useViewEffect.js";
import {InvoiceCountLabel} from "../../components/InvoiceCountLabel.jsx";
import {useUpdateEffect} from "../../hooks/useUpdateEffect.js";

const userInvoicesStore = createApiStore("GET", "/user/invoices")
const invoicePaymentStore = createApiStore("GET", "/invoices/{id}/payment")
const userInvoiceCountStore = createApiStore("GET", "/user/invoices/count")

function UserInvoiceCount() {
    const {data} = userInvoiceCountStore()

    useViewEffect(userInvoiceCountStore)

    return <div className={"section"}>
        <div className={"grid grid-cols-3 gap-3"}>
            <InvoiceCountLabel label={"Tổng số hóa đơn"} count={data?.totalCount}/>
            <InvoiceCountLabel label={"Tổng số chưa thanh toán"} count={data?.totalPending}/>
            <InvoiceCountLabel label={"Tổng số đã thanh toán"} count={data?.totalSuccess}/>
        </div>
    </div>
}

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
    const {fetch, setUrl, data} = useApiStore(invoicePaymentStore)
    useUpdateEffect(invoicePaymentStore)
    const onClick = async () => {
        setUrl(`/invoices/${invoiceId}/payment`)
        fetch().then()
    }
    useEffect(() => {
        data && window.open(data, '_blank').focus()
    }, [data]);
    return <Button onClick={onClick} type={"link"}>Thanh toán</Button>
}

function InvoiceDetailModal() {

}

const usePageStore = create(set => ({
    page: 0,
    setPage: (page) => set({page}),
}))

export default function InvoicesPage() {
    const {mutate, data, error} = useApiStore(userInvoicesStore);

    const {page, setPage} = usePageStore()

    useEffect(() => {
        mutate({page})
    }, [mutate, page]);

    useErrorNotification(error);

    return <AppLayout activeSidebar={"invoices"}>
        <InvoiceModal/>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={"Danh sách hóa đơn"}/>
            <UserInvoiceCount/>
            <div className={"section"}>
                <div className={"font-medium text-lg mb-3"}>Bộ lọc</div>
                <div className={"flex gap-3 flex-wrap"}>
                    <InvoiceTypeFilter/>
                    <InvoiceStatusFilter/>
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
                    current: page + 1,
                    total: data?.page.totalElements
                }}/>
            </div>
        </div>
    </AppLayout>
}