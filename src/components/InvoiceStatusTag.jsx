import {Tag} from "antd";


const invoiceStatus = {
    SUCCESS: {
        label: "Đã thanh toán",
        color: "success"
    },
    CANCEL: {
        label: "Hủy",
        color: "error"
    },
    PENDING: {
        label: "Chờ thanh toán"
    }
}

export function InvoiceStatusTag({ value}) {
    return <Tag color={invoiceStatus[value]?.color}>{invoiceStatus[value]?.label || value}</Tag>
}