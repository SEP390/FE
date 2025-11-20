import {Select} from "antd";

export default function InvoiceStatusSelect({onChange}) {
   return <div className={"flex flex-col gap-2"}>
       <div className={"text-sm font-medium"}>Trạng thái</div>
       <Select onChange={onChange} className={"w-35"} allowClear placeholder={"Trạng thái"} options={[
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
   </div>
}