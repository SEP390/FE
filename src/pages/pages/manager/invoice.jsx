import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {useCallback, useEffect, useState} from "react";
import {useApi} from "../../../hooks/useApi.js";
import {Button, Table, Tag} from "antd";
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

function CancelAction({invoice, fetchInvoices}) {
    const {post, data, error} = useApi();

    const onClick = () => {
        post("/invoices/" + invoice.id, {
            status: "CANCEL"
        })
    }

    useEffect(() => {
        if (data) fetchInvoices()
    }, [data]);

    return <Button onClick={onClick} type="link">Hủy</Button>
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
    userId: null,
    type: null,
    status: null,
    setUserId: (userId) => set({userId}),
    setType: (type) => set({type}),
    setStatus: (status) => set({status})
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
    const [page, setPage] = useState(0);
    const {get, data, error} = useApi();

    const fetchInvoices = useCallback(() => {
        get("/invoices", {page});
    }, [get, page])

    useErrorNotification(error)

    useEffect(() => {
        fetchInvoices()
    }, [fetchInvoices]);

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
            render: (val) => {
                if (val === "PENDING") return <Tag>Chưa thanh toán</Tag>
                if (val === "SUCCESS") return <Tag color={"green"}>Đã thanh toán</Tag>
                if (val === "CANCEL") return <Tag color={"red"}>Hủy thanh toán</Tag>
            }
        },
        {
            title: "Action",
            render: (val, row) => {
                if (row.status === "PENDING") return <CancelAction invoice={row} fetchInvoices={fetchInvoices}/>
            }
        },
    ]} pagination={{
        current: data?.page?.page,
        total: data?.page?.totalElements
    }}/>

}

export default function ManageInvoicePage() {

    return <LayoutManager header={<>
        <span className={"font-medium text-lg"}>Quản lý hóa đơn</span>
    </>}>
        <div className={"rounded-lg h-full flex flex-col gap-3"}>
            <InvoiceCount/>
            <InvoiceFilter/>
            <div className={"bg-white rounded-lg p-5 border border-gray-200 flex-grow"}>
                <InvoiceTable/>
            </div>
        </div>
    </LayoutManager>
}