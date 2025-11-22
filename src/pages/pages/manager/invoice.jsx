import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {useEffect} from "react";
import {useApi} from "../../../hooks/useApi.js";
import {Button, Modal, Table, Tag} from "antd";
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
import {useRefresh} from "../../../hooks/useRefresh.js";

const useModal = create(set => ({
    invoice: null,
    isOpen: false,
    open: (invoice) => set({invoice, isOpen: true}),
    close: () => set({isOpen: false}),
}))

const renderInvoiceStatus = (val) => {
    if (val === "PENDING") return <Tag>Chưa thanh toán</Tag>
    if (val === "SUCCESS") return <Tag color={"green"}>Đã thanh toán</Tag>
    if (val === "CANCEL") return <Tag color={"red"}>Hủy thanh toán</Tag>
}

function CancelAction({invoice}) {
    const {post, data, error} = useApi();

    const {refresh} = useRefresh();

    useErrorNotification(error);

    const onClick = () => {
        post("/invoices/" + invoice.id, {
            status: "CANCEL"
        })
    }

    useEffect(() => {
        if (data) refresh()
    }, [data, refresh]);

    return <Button onClick={onClick} type="link">Hủy</Button>
}

function DetailAction({invoice}) {
    const {open} = useModal();
    const onClick = () => {
        open(invoice)
    }
    return <Button onClick={onClick} type="link">Chi tiết</Button>
}

function DetailInvoice() {
    const {invoice, isOpen, close} = useModal();

    return <Modal width={{"md": 700, "lg": 800}} title={"Chi tiết hóa đơn"} open={isOpen} onCancel={close}
                  footer={null}>
        {invoice && (
            <>
                <div className={"flex gap-3"}>
                    <div className={"flex flex-col gap-3"}>
                        <div className={"border border-gray-200 rounded-lg p-3 flex gap-5"}>
                            <div>
                                <div className={"flex gap-2"}>
                                    <div className={"font-medium whitespace-nowrap"}>Hóa đơn:</div>
                                    <div
                                        className={"text-blue-600 hover:text-blue-400 hover:cursor-pointer"}>{invoice.id}</div>
                                </div>
                                <div className={"text-gray-500"}>{formatTime(invoice.createTime)}</div>
                            </div>
                            <div className={"text-blue-600"}>{renderInvoiceStatus(invoice.status)}</div>
                        </div>
                        <div className={"border border-gray-200 rounded-lg"}>
                            <div
                                className={"border-b rounded-t-lg border-gray-200 p-2 bg-gray-50 text-gray-500 font-medium"}>
                                <div>Sinh viên</div>
                            </div>
                            <div className={"p-3"}>
                                <div className={"font-medium"}>{invoice.user.fullName} | {invoice.user.userCode}</div>
                                <div className={"text-gray-500 text-sm"}>{invoice.user.email}</div>
                            </div>
                        </div>
                        <div className={"border border-gray-200 rounded-lg"}>
                            <div
                                className={"border-b rounded-t-lg border-gray-200 p-2 bg-gray-50 text-gray-500 font-medium"}>
                                <div>Chi tiết</div>
                            </div>
                            <div className={"p-3"}>
                                {invoice.type === "BOOKING" && (
                                    <>
                                        <div className={"mb-3"}>
                                            {invoice.reason}
                                        </div>
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
                    </div>
                    <div className={"flex-grow flex flex-col gap-3"}>
                        <div className={"border border-gray-200 rounded-lg p-3 flex-grow"}>

                        </div>
                        <div className={"p-3 border border-gray-200 rounded-lg"}>
                            <div className={"flex items-center"}>
                                <div className={"text-gray-500 font-medium"}>Giá</div>
                                <div
                                    className={"ml-auto text-lg font-medium text-orange-500"}>{formatPrice(invoice.price)}</div>
                            </div>
                        </div>
                        <Button>Hủy</Button>
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
    const {get, data, error} = useApi();

    useErrorNotification(error);

    useEffect(() => {
        get("/invoices/count");
    }, [get]);

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
    setUserId: (userId) => set({userId}),
    setType: (type) => set({type}),
    setStatus: (status) => set({status}),
    setPage: (page) => set({page}),
}))

function InvoiceFilter() {
    const navigate = useNavigate();
    const {setUserId, setStatus, setType} = useFilterStore()
    return <>
        <div className={"rounded-lg p-5 bg-white border border-gray-200 flex flex-wrap gap-5"}>
            <div>
                <div className={"font-medium mb-3 text-lg"}>Bộ lọc</div>
                <div className={"flex gap-3 flex-wrap"}>
                    <ResidentFilter onChange={setUserId}/>
                    <InvoiceTypeFilter onChange={setType}/>
                    <InvoiceStatusFilter onChange={setStatus}/>
                    <DateRangeFilter/>
                </div>
            </div>
            <div className={"ml-auto flex gap-3 items-end"}>
                <Button onClick={() => navigate("/pages/manager/invoice/create")} icon={<Plus size={14}/>}>Tạo hóa
                    đơn</Button>
                <Button type={"primary"} icon={<Plus size={14}/>}>Tạo hóa đơn điện nước</Button>
            </div>
        </div>
    </>
}

function InvoiceTable() {
    const {page, userId, status, type} = useFilterStore()
    const {get, data, error} = useApi();

    const {onRefresh} = useRefresh()

    useErrorNotification(error)

    useEffect(() => {
        get("/invoices", {page, userId, status, type});
    }, [get, page, status, type, userId, onRefresh]);

    return <Table className={"overflow-auto"} bordered dataSource={data ? data.content : []} columns={[
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
            dataIndex: ["price"],
            render: (val) => formatPrice(val),
        },
        {
            title: "Nội dung",
            dataIndex: "reason",
        },
        {
            title: "  Ngày tạo",
            dataIndex: "createTime",
            render: (val) => formatTime(val),
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
            render: renderInvoiceStatus,
        },
        {
            title: "Action",
            render: (val, row) => {
                const btns = [<DetailAction invoice={row}/>]
                if (row.status === "PENDING") btns.push(<CancelAction invoice={row}/>)
                return btns;
            }
        },
    ]} pagination={{
        current: data?.page?.page,
        total: data?.page?.totalElements
    }}/>

}

export default function ManageInvoicePage() {

    return <LayoutManager active={"manager-invoice"} header={<>
        <span className={"font-medium text-lg"}>Quản lý hóa đơn</span>
    </>}>
        <DetailInvoice/>
        <div className={"rounded-lg h-full flex flex-col gap-3"}>
            <InvoiceCount/>
            <InvoiceFilter/>
            <div className={"bg-white rounded-lg p-5 border border-gray-200 flex-grow"}>
                <InvoiceTable/>
            </div>
        </div>
    </LayoutManager>
}