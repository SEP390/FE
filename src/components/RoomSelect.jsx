import {Select} from "antd";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import axiosClient from "../api/axiosClient/axiosClient.js";

export function RoomSelect(props) {
    const [search, setSearch] = useState("");
    const {value} = props;
    const {data} = useQuery({
        queryKey: ["rooms", search, value],
        queryFn: () => axiosClient.get("/rooms", {
            params: {
                roomNumber: search ? search : undefined,
                id: value && !search ? value : undefined,
            }
        }).then(res => res.data)
    })

    const options = data ? data.content.map(item => ({
        label: `${item.dorm.dormName} - ${item.roomNumber}`,
        value: item.id,
    })) : null;


    return <Select autoClearSearchValue={false} {...props} className={"w-45"}
                   allowClear filterOption={false}
                   options={options} showSearch onSearch={setSearch}
                   placeholder={"Chọn phòng"}/>
}

export function RoomFilter(props) {
    return <div className={"flex flex-col gap-1"}>
        <div className={"font-medium"}>Phòng</div>
        <RoomSelect {...props} />
    </div>
}
