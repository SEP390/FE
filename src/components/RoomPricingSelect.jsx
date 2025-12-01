import {Select} from "antd";
import {useQuery} from "@tanstack/react-query";
import axiosClient from "../api/axiosClient/axiosClient.js";
import {formatPrice} from "../util/formatPrice.js";

export function RoomPricingSelect(props) {
    const {data} = useQuery({
        queryKey: ["pricing"],
        queryFn: () => axiosClient.get("/pricing").then(res => res.data),
    })

    const options = data ? data.map(item => ({
        label: `Phòng ${item.totalSlot} giường | ${formatPrice(item.price)}`,
        value: item.totalSlot,
    })) : [];

    return <Select autoClearSearchValue={false} {...props} className={"w-45"}
                   allowClear filterOption={false}
                   options={options} showSearch
                   placeholder={"Chọn phòng"}/>
}