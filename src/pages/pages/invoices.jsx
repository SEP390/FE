import {Button, Modal, Table, Tag} from "antd";
import {create} from 'zustand'
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {formatPrice} from "../../util/formatPrice.js";
import {formatTime} from "../../util/formatTime.js";
import useErrorNotification from "../../hooks/useErrorNotification.js";
import {PageHeader} from "../../components/PageHeader.jsx";
import {InvoiceTypeFilter} from "../../components/InvoiceTypeSelect.jsx";
import {InvoiceStatusFilter} from "../../components/InvoiceStatusSelect.jsx";
import {InvoiceCountLabel} from "../../components/InvoiceCountLabel.jsx";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import {InvoiceTypeTag} from "../../components/InvoiceTypeTag.jsx";
import {InvoiceStatusTag} from "../../components/InvoiceStatusTag.jsx";
import {cn} from "../../util/cn.js";
import {Clock} from "lucide-react";
import {DateRangeFilter} from "../../components/DateRangeSelect.jsx";
import {RequireRole} from "../../components/authorize/RequireRole.jsx";

function AppCard({title, className, children}) {
    return <div className={cn("border border-gray-200 rounded-lg", className)}>
        <div className={"border-b rounded-t-lg border-gray-200 p-2 bg-gray-50 text-gray-500 font-medium"}>{title}</div>
        <div className={"p-3"}>{children}</div>
    </div>
}

function UserInvoiceCount() {
    const {data} = useQuery({
        queryKey: ["user-invoice-count"],
        queryFn: () => axiosClient.get("/user/invoices/count").then(res => res.data),
    })

    return <div className={"grid grid-cols-3 gap-3"}>
        <InvoiceCountLabel label={"Tổng số hóa đơn"} count={data?.totalCount}/>
        <InvoiceCountLabel label={"Tổng số chưa thanh toán"} count={data?.totalPending}/>
        <InvoiceCountLabel label={"Tổng số đã thanh toán"} count={data?.totalSuccess}/>
    </div>

}


function DetailAction({invoice}) {
    const {open} = useModalStore();
    return <Button onClick={() => open(invoice)} type={"link"}>Chi tiết</Button>
}

function PaymentAction({invoiceId}) {
    const queryClient = useQueryClient();
    const {mutate} = useMutation({
        mutationFn: ({invoiceId}) => axiosClient.get(`/invoices/${invoiceId}/payment`).then(res => res.data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ["user-invoices"],
            })
            window.open(data, '_blank')
        }
    })
    const onClick = async () => {
        mutate({invoiceId})
    }
    return <Button onClick={onClick} type={"link"}>Thanh toán</Button>
}

const useModalStore = create(set => ({
    invoice: null,
    isOpen: false,
    open: (invoice) => set({invoice, isOpen: true}),
    close: () => set({isOpen: false}),
}))

const useFilterStore = create(set => ({
    type: null,
    status: null,
    page: 0,
    sort: "createTime,DESC",
    startDate: null,
    endDate: null,
    setDateRange: (val) => {
        if (val) {
            set({ startDate: val[0].format("YYYY-MM-DD"), endDate: val[1].format("YYYY-MM-DD") });
        } else {
            set({ startDate: null, endDate: null, })
        }
    },
    setPage: (page) => set({page}),
    setType: (type) => set({type}),
    setStatus: (status) => set({status}),
    setSort: (sort) => set({sort}),
    onChange: ({current}, filter, {field, order}) => set({page: current - 1, sort: field ? `${field},${order === "ascend" ? "ASC": "DESC"}` : "createTime,DESC"})
}))


function InvoiceDetailModal() {
    const {invoice, isOpen, close} = useModalStore();

    return <Modal width={{"md": 700, "lg": 800}} title={"Chi tiết hóa đơn"} open={isOpen} onCancel={close}
                  footer={null}>
        {invoice && (
            <>
                <div className={"flex gap-3"}>
                    <div className={"flex flex-col gap-3"}>
                        <AppCard title={"Hóa đơn"} className={"flex-grow"}>
                            <div className={"text-blue-600 hover:text-blue-400 hover:cursor-pointer"}>{invoice.id}</div>
                            <div className={"text-gray-500"}>{formatTime(invoice.createTime)}</div>
                            <div className={"text-blue-600"}><InvoiceStatusTag value={invoice?.status}/></div>
                        </AppCard>
                    </div>
                    <div className={"flex-grow flex flex-col gap-3"}>
                        <div className={"border border-gray-200 rounded-lg flex-grow"}>
                            <div
                                className={"border-b rounded-t-lg border-gray-200 p-2 bg-gray-50 text-gray-500 font-medium"}>Chi
                                tiết
                            </div>
                            <div className={"p-3"}>
                                <div className={"mb-3"}>
                                    {invoice.reason}
                                </div>
                                {invoice.type === "BOOKING" && (
                                    <>
                                        <div className={"flex flex-wrap gap-3 justify-between"}>
                                            <div className={"flex flex-col gap-1"}>
                                                <div className={"font-medium"}>Dorm</div>
                                                <div>{invoice.slotInvoice.room.dorm.dormName}</div>
                                            </div>
                                            <div className={"flex flex-col gap-1"}>
                                                <div className={"font-medium"}>Phòng</div>
                                                <div>{invoice.slotInvoice.room.roomNumber}</div>
                                            </div>
                                            <div className={"flex flex-col gap-1"}>
                                                <div className={"font-medium"}>Slot</div>
                                                <div>{invoice.slotInvoice.slotName}</div>
                                            </div>
                                            <div className={"flex flex-col gap-1"}>
                                                <div className={"font-medium"}>Kỳ</div>
                                                <div><Tag>{invoice.slotInvoice.semester.name}</Tag></div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={"border border-gray-200 rounded-lg"}>
                            <div
                                className={"border-b rounded-t-lg border-gray-200 p-2 bg-gray-50 text-gray-500 font-medium"}>Giá
                            </div>
                            <div className={"flex items-center p-3"}>
                                {invoice.type === "BOOKING" && (
                                    <>
                                        <div>Tổng cộng:</div>
                                    </>
                                )}
                                <div
                                    className={"ml-auto text-lg font-medium"}>{formatPrice(invoice.price)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )}
    </Modal>
}

export default function InvoicesPage() {
    const {page, type, status, sort, setType, setStatus, onChange, startDate, endDate, setDateRange} = useFilterStore()
    const {data, error} = useQuery({
        queryKey: ["user-invoices", page, type, status, sort, startDate, endDate],
        queryFn: () => axiosClient({
            method: "GET",
            url: "/user/invoices",
            params: {
                page, type, status, size: 5, sort, startDate, endDate
            }
        }).then(res => res.data)
    })

    useErrorNotification(error);

    return <RequireRole role={"RESIDENT"}><AppLayout activeSidebar={"invoices"}>
        <InvoiceDetailModal/>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={"Danh sách hóa đơn"}/>
            <UserInvoiceCount/>
            <div className={"section"}>
                <div className={"flex gap-3 flex-wrap"}>
                    <InvoiceTypeFilter onChange={setType}/>
                    <InvoiceStatusFilter onChange={setStatus}/>
                    <DateRangeFilter onChange={setDateRange}/>
                </div>
            </div>
            <div className={"section"}>
                <Table className={"overflow-auto"} bordered dataSource={data ? data.content : []} columns={[
                    {
                        title: "Ngày tạo",
                        dataIndex: "createTime",
                        render: (val) => <span className={"flex gap-1 items-center"}><Clock size={14}/>{formatTime(val)}</span>,
                        sorter: true,
                    },
                    {
                        title: "Giá",
                        dataIndex: "price",
                        render: (val) => formatPrice(val),
                        sorter: true,
                    },
                    {
                        title: "Nội dung",
                        dataIndex: "reason",
                    },
                    {
                        title: "Loại",
                        dataIndex: ["type"],
                        render: (val) => <InvoiceTypeTag value={val}/>
                    },
                    {
                        title: "Trạng thái",
                        dataIndex: ["status"],
                        render: (val) => <InvoiceStatusTag value={val}/>
                    },
                    {
                        title: "Hành động",
                        render: (val, row) => (
                            <>
                                <div className={"flex"}>
                                    <DetailAction invoice={row}/>
                                    {row.status === "PENDING" && (
                                        <>
                                            <PaymentAction invoiceId={row.id}/>
                                        </>
                                    )}
                                </div>
                            </>
                        )
                    }
                ]} onChange={onChange} pagination={{
                    showTotal: (total) => <span>Tổng cộng <span className={"font-medium"}>{total}</span> bản ghi</span>,
                    current: page + 1,
                    pageSize: 5,
                    total: data?.page?.totalElements
                }}/>
            </div>
        </div>
    </AppLayout></RequireRole>
}