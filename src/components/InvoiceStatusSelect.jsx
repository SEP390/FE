import {Select} from "antd";

export function InvoiceStatusSelect(props) {
    return <Select {...props} className={"w-35"} allowClear placeholder={"Trạng thái"} options={[
        {
            label: "Đã thanh toán",
            value: "SUCCESS",
        },
        {
            label: "Chưa thanh toán",
            value: "PENDING",
        },
        {
            label: "Hủy",
            value: "CANCEL",
        },
    ]}/>
}

export function InvoiceStatusFilter(props) {
   return <div className={"flex flex-col gap-2"}>
       <div className={"text-sm font-medium"}>Trạng thái</div>
       <InvoiceStatusSelect {...props} />
   </div>
}