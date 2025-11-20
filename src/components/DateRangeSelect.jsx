import { DatePicker } from "antd";

const {RangePicker} = DatePicker;

export function DateRangeSelect({ onChange }) {
    return <RangePicker placeholder={["Từ ngày", "Đến ngày"]} onChange={(date, dateStr) => onChange(dateStr)} />
}

export function DateRangeFilter({ onChange }) {
    return <div className={"flex flex-col gap-2"}>
        <div className={"text-sm font-medium"}>Khoảng thời gian</div>
        <DateRangeSelect onChange={onChange} />
    </div>
}