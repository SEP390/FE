import { DatePicker } from "antd";

const {RangePicker} = DatePicker;

export default function DateRangeSelect({ onChange }) {
    return <div className={"flex flex-col gap-2"}>
        <div className={"text-sm font-medium"}>Khoảng thời gian</div>
        <RangePicker placeholder={["Từ ngày", "Đến ngày"]} onChange={(date, dateStr) => onChange(dateStr)} />
    </div>
}