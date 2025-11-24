import {useApi} from "../hooks/useApi.js";
import {useEffect, useState} from "react";
import {Select} from "antd";

export function SlotSelect({roomId, value, onChange}) {
    const {get, data} = useApi();
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState([]);

    useEffect(() => {
        if (data) {
            setOptions(data.slots.map(item => ({
                label: `${item.slotName}`,
                value: item.id,
            })))
        }
    }, [data]);

    useEffect(() => {
        get("/rooms/" + roomId)
    }, [get, roomId, search, value]);

    return <Select value={value} onChange={onChange} autoClearSearchValue={false} className={"w-45"}
                   allowClear filterOption={false}
                   options={options} showSearch onSearch={setSearch}
                   placeholder={"Chọn phòng"}/>
}