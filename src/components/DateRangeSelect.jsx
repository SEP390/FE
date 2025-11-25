import { DatePicker } from "antd";

const {RangePicker} = DatePicker;

export function DateRangeSelect(props) {
    return <RangePicker {...props} placeholder={["Từ ngày", "Đến ngày"]} />
}

export function DateRangeFilter({ value, onChange }) {
    return <div className={"flex flex-col gap-2"}>
        <div className={"text-sm font-medium"}>Khoảng thời gian</div>
        <DateRangeSelect value={value} onChange={onChange} />
    </div>
}