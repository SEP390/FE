import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {useEffect, useState} from "react";
import {useApi} from "../../../hooks/useApi.js";
import {App, Button, Input, Select, Table, Tag} from "antd";
import {formatPrice} from "../../../util/formatPrice.js";
import {Plus} from "lucide-react";
import {useNavigate} from "react-router-dom";

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

function InvoiceFilter() {
    const navigate = useNavigate();
    return <>
        <div className={"rounded-lg p-5 bg-white border border-gray-200"}>
            <div className={"font-medium mb-3"}>Bộ lọc</div>
            <div className={"flex gap-3 flex-wrap"}>
                <Input className={"!w-30"} placeholder={"Mã sinh viên"}/>
                <Select placeholder={"Loại hóa đơn"} options={[
                    {
                        label: "Đặt phòng",
                        value: "BOOKING",
                    },
                    {
                        label: "Điện nước",
                        value: "EW",
                    },
                    {
                        label: "Khác",
                        value: "OTHER",
                    },
                ]}/>
                <div className={"ml-auto flex gap-3"}>
                    <Button onClick={() => navigate("/pages/manager/invoice/create")} icon={<Plus size={14}/>}>Tạo hóa đơn</Button>
                    <Button type={"primary"} icon={<Plus size={14}/>}>Tạo hóa đơn điện nước</Button>
                </div>
            </div>
        </div>
    </>
}

function InvoiceTable() {
    const [page, setPage] = useState(0);
    const {get, data, error} = useApi();
    const {notification} = App.useApp();

    useEffect(() => {
        get("/invoices", {page});
    }, [get, page]);

    return <Table bordered dataSource={data ? data.content : []} columns={[
        {
            title: "Mã sinh viên",
            dataIndex: ["user", "userCode"],
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
    ]} pagination={{
        current: data?.page?.page,
        total: data?.page?.totalElements
    }}/>

}

export default function ManageInvoicePage() {

    return <LayoutManager>
        <div className={"rounded-lg h-full flex flex-col gap-3"}>
            <InvoiceCount/>
            <InvoiceFilter/>
            <div className={"bg-white rounded-lg p-5 border border-gray-200 flex-grow"}>
                <InvoiceTable/>
            </div>
        </div>
    </LayoutManager>
}