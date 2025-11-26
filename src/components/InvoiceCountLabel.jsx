import {Skeleton} from "antd";

export function InvoiceCountLabel({label, count}) {
    return <div
        className={"bg-white p-5 rounded-lg border border-gray-200 flex flex-col items-center justify-center *:flex-grow"}>
        <div className={"text-2xl font-medium"}>{count !== null ? count : 0}</div>
        <div>{label}</div>
    </div>
}
