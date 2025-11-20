import {Select} from "antd";

export default function InvoiceTypeSelect({ onChange }) {
    return <div className={"flex flex-col gap-2"}>
        <div className={"text-sm font-medium"}>Loại hóa đơn</div>
        <Select className={"w-30"} onChange={onChange} allowClear placeholder={"Loại hóa đơn"} options={[
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
    </div>
}