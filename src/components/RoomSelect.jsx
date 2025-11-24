import {Select} from "antd";
import {useEffect, useState} from "react";
import {useApi} from "../hooks/useApi.js";

export function RoomSelect(props) {
    const {get, data} = useApi();
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState([]);
    const {value} = props;

    useEffect(() => {
        if (data) {
            setOptions(data.content.map(item => ({
                label: `${item.dorm.dormName} - ${item.roomNumber}`,
                value: item.id,
            })))
        }
    }, [data]);

    useEffect(() => {
        get("/rooms", {
            roomNumber: search ? search : undefined,
            id: value && !search ? value : undefined,
        })
    }, [get, search, value]);

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
