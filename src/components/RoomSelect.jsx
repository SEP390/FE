import {Select} from "antd";
import {useEffect, useState} from "react";
import {useApi} from "../hooks/useApi.js";

export function RoomSelect(props) {
    const {get, data} = useApi();
    const [search, setSearch] = useState("");

    useEffect(() => {
        get("/rooms", {
            roomNumber: search
        })
    }, [get, search]);

    const options = data ? data.content.map(item => ({
        label: `${item.dorm.dormName} - ${item.roomNumber}`,
        value: item.id,
    })) : null
    return <Select {...props} className={"w-45"} allowClear filterOption={false}
                   options={options} showSearch onSearch={setSearch}
                   placeholder={"Chọn phòng"}/>
}
