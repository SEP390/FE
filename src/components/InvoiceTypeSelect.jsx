import {Select} from "antd";

export function InvoiceTypeSelect(props) {
    return <Select className={"w-35"} {...props} allowClear placeholder={"Loại hóa đơn"} options={[
        {
            label: "Đặt phòng",
            value: "BOOKING",
        },
        {
            label: "Điện nước",
            value: "EW",
        },
        {
            label: "Vi phạm",
            value: "VIOLATION",
        },
        {
            label: "Khác",
            value: "OTHER",
        },
    ]}/>
}

export function InvoiceTypeFilter(props) {
    return <div className={"flex flex-col gap-2"}>
        <div className={"text-sm font-medium"}>Loại hóa đơn</div>
        <InvoiceTypeSelect {...props} />
    </div>
}