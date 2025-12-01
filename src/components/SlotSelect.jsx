import {Select} from "antd";
import {useQuery} from "@tanstack/react-query";
import axiosClient from "../api/axiosClient/axiosClient.js";

export function SlotSelect({roomId, value, onChange}) {
    const {data} = useQuery({
        queryKey: ["rooms", roomId],
        queryFn: () => axiosClient.get(`/rooms/${roomId}`).then(res => res.data),
    });

    const options = data ? data.slots.map(item => ({
        label: `${item.slotName}`,
        value: item.id,
    })) : [];

    return <Select value={value} onChange={onChange} autoClearSearchValue={false} className={"w-45"}
                   allowClear filterOption={false}
                   options={options}
                   placeholder={"Chọn phòng"}/>
}