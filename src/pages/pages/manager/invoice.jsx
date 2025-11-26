import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {Button, Modal, Popconfirm, Table, Tag} from "antd";
import {formatPrice} from "../../../util/formatPrice.js";
import {Plus} from "lucide-react";
import {useNavigate} from "react-router-dom";
import useErrorNotification from "../../../hooks/useErrorNotification.js";
import {ResidentFilter} from "../../../components/ResidentSelect.jsx";
import {InvoiceTypeFilter} from "../../../components/InvoiceTypeSelect.jsx";
import {InvoiceStatusFilter} from "../../../components/InvoiceStatusSelect.jsx";
import {create} from "zustand";
import {DateRangeFilter} from "../../../components/DateRangeSelect.jsx";
import {formatTime} from "../../../util/formatTime.js";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import {cn} from "../../../util/cn.js";
import {InvoiceTypeTag} from "../../../components/InvoiceTypeTag.jsx";
import {InvoiceStatusTag} from "../../../components/InvoiceStatusTag.jsx";

const useModalStore = create(set => ({
    invoice: null,
    isOpen: false,
    open: (invoice) => set({invoice, isOpen: true}),
    close: () => set({isOpen: false}),
}))

const renderInvoiceStatus = (val) => {
    if (val === "PENDING") return <Tag>Chưa thanh toán</Tag>
    if (val === "SUCCESS") return <Tag color={"green"}>Đã thanh toán</Tag>
    if (val === "CANCEL") return <Tag color={"red"}>Hủy</Tag>
}

function CancelAction({invoice}) {
    const queryClient = useQueryClient();
    const {error, mutate, isLoading} = useMutation({
        mutationKey: ["cancel-invoice"],
        mutationFn: ({id}) => axiosClient({
            method: "POST",
            url: `/invoices/${id}`,
            data: {status: "CANCEL"}
        }).then(res => res.data),
        onSuccess: () => queryClient.invalidateQueries({queryKey: ["invoices"]})
    })

    useErrorNotification(error);

    const onClick = () => {
        mutate({id: invoice.id})
    }

    return <Popconfirm onConfirm={onClick} title={"Xác nhận hủy"}><Button loading={isLoading} type="link">Hủy</Button></Popconfirm>
}

function AppCard({title, className, children}) {
    return <div className={cn("border border-gray-200 rounded-lg", className)}>
        <div className={"border-b rounded-t-lg border-gray-200 p-2 bg-gray-50 text-gray-500 font-medium"}>{title}</div>
        <div className={"p-3"}>{children}</div>
    </div>
}

function DetailAction({invoice}) {
    const {open} = useModalStore();
    const onClick = () => {
        open(invoice)
    }
    return <Button onClick={onClick} type="link">Chi tiết</Button>
}

function DetailInvoiceModal() {
    const {invoice, isOpen, close} = useModalStore();

    return <Modal width={{"md": 700, "lg": 800}} title={"Chi tiết hóa đơn"} open={isOpen} onCancel={close}
                  footer={null}>
        {invoice && (
            <>
                <div className={"flex gap-3"}>
                    <div className={"flex flex-col gap-3"}>
                        <AppCard title={"Hóa đơn"}>
                            <div className={"text-blue-600 hover:text-blue-400 hover:cursor-pointer"}>{invoice.id}</div>
                            <div className={"text-gray-500"}>{formatTime(invoice.createTime)}</div>
                            <div className={"text-blue-600"}>{renderInvoiceStatus(invoice.status)}</div>
                        </AppCard>
                        <AppCard title={"Sinh viên"} className={"flex-grow"}>
                            <div className={"font-medium"}>{invoice.user.fullName}</div>
                            <div>{invoice.user.userCode}</div>
                            <div className={"text-gray-500 text-sm"}>{invoice.user.email}</div>
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

function InvoiceCountLabel({label, count}) {
    return <div
        className={"bg-white p-5 rounded-lg border border-gray-200 flex flex-col items-center justify-center *:flex-grow"}>
        <div className={"text-2xl font-medium"}>{count}</div>
        <div>{label}</div>
    </div>
}

function InvoiceCount() {
    const {data, error} = useQuery({
        queryKey: ["invoice-count"],
        queryFn: () => axiosClient.get("/invoices/count").then(res => res.data)
    })

    useErrorNotification(error);

    return <>
        <div className={"grid grid-cols-3 gap-3"}>
            <InvoiceCountLabel label={"Tổng số hóa đơn"} count={data?.totalCount}/>
            <InvoiceCountLabel label={"Tổng số chưa thanh toán"} count={data?.totalPending}/>
            <InvoiceCountLabel label={"Tổng số đã thanh toán"} count={data?.totalSuccess}/>
        </div>
    </>
}

const useFilterStore = create(set => ({
    page: 0,
    userId: null,
    type: null,
    status: null,
    sort: "createTime,DESC",
    startDate: null,
    endDate: null,
    setSort: (sort) => set({sort}),
    setUserId: (userId) => set({userId, page: 0}),
    setType: (type) => set({type, page: 0}),
    setStatus: (status) => set({status, page: 0}),
    setPage: (page) => set({page}),
    setStartDate: (startDate) => set({startDate}),
    setEndDate: (endDate) => set({endDate}),
}))

function InvoiceFilter() {
    const navigate = useNavigate();
    const {userId, setUserId, setStatus, setType, setStartDate, setEndDate} = useFilterStore()
    return <>
        <div className={"rounded-lg p-5 bg-white border border-gray-200 flex flex-wrap gap-5"}>
            <div>
                <div className={"font-medium mb-3 text-lg"}>Bộ lọc</div>
                <div className={"flex gap-3 flex-wrap"}>
                    <ResidentFilter value={userId} onChange={setUserId}/>
                    <InvoiceTypeFilter onChange={setType}/>
                    <InvoiceStatusFilter onChange={setStatus}/>
                    <DateRangeFilter onChange={(val) => {
                        if (val) {
                            setStartDate(val[0].format("YYYY-MM-DD"));
                            setEndDate(val[1].format("YYYY-MM-DD"));
                        } else {
                            setStartDate(null);
                            setEndDate(null);
                        }
                    }}/>
                </div>
            </div>
            <div className={"ml-auto flex gap-3 items-end"}>
                <Button type={"primary"} onClick={() => navigate("/pages/manager/invoice/create")} icon={<Plus size={14}/>}>Tạo hóa
                    đơn</Button>
            </div>
        </div>
    </>
}

function InvoiceTable() {
    const {page, setPage, userId, status, type, sort, setSort, startDate, endDate} = useFilterStore()
    const {data, error} = useQuery({
        queryKey: ["invoices", page, userId, status, type, sort, startDate, endDate],
        queryFn: () => axiosClient.get("/invoices", {
            params: {
                page, userId, status, type, size: 5, sort: sort, startDate, endDate
            }
        }).then(res => res.data),
    })
    useErrorNotification(error)

    return <Table className={"overflow-auto"} bordered dataSource={data ? data.content.map(item => {
        item.key = item.id;
        return item
    }) : []} columns={[
        {
            title: "Mã sinh viên",
            dataIndex: ["user", "userCode"],
        },
        {
            title: "Tên sinh viên",
            dataIndex: ["user", "fullName"],
        },
        {
            title: "Giá",
            dataIndex: "price",
            render: formatPrice,
            sorter: true,
        },
        {
            title: "Nội dung",
            dataIndex: "reason",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createTime",
            render: formatTime,
            sorter: true,
        },
        {
            title: "Loại",
            dataIndex: "type",
            render: (val) => <InvoiceTypeTag value={val}/>
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (val) => <InvoiceStatusTag value={val}/>,
        },
        {
            title: "Action",
            render: (val, row) => {
                const btns = [<DetailAction key={"detail"} invoice={row}/>]
                if (row.status === "PENDING") btns.push(<CancelAction key="cancel" invoice={row}/>)
                return btns;
            }
        },
    ]} pagination={{
        current: data?.page?.page,
        pageSize: 5,
        total: data?.page?.totalElements,
    }} onChange={({current}, filter, {field, order}) => {
        if (field) {
            const dir = order === "ascend" ? "ASC" : "DESC";
            if (field) {
                setSort(`${field},${dir}`)
            } else {
                setSort("createTime,DESC")
            }
        }
        setPage(current - 1)
    }}/>
}

export default function ManageInvoicePage() {
    return <LayoutManager active={"manager-invoice"} header={<>
        <span className={"font-medium text-lg"}>Quản lý hóa đơn</span>
    </>}>
        <DetailInvoiceModal/>
        <div className={"rounded-lg h-full flex flex-col gap-3"}>
            <InvoiceCount/>
            <InvoiceFilter/>
            <div className={"bg-white rounded-lg p-5 border border-gray-200 flex-grow"}>
                <InvoiceTable/>
            </div>
        </div>
    </LayoutManager>
}