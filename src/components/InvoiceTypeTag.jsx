import {Tag} from "antd";

const invoiceTypes = {
    BOOKING: "Đặt phòng",
    EW: "Điện nước",
    OTHER: "Khác",
    VIOLATION: "Vi phạm",
    COMPENSATE: "Đền bù",
    SWAP: "Đổi phòng",
    EXTEND: "Gia hạn",
}

export function InvoiceTypeTag({ value }) {
    return <Tag>{invoiceTypes[value] || value}</Tag>;
}