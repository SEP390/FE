import {useApi} from "../hooks/useApi.js";
import {useEffect, useState} from "react";
import {Select} from "antd";

export default function ResidentSelect({value, onChange}) {
    const {get, data} = useApi();
    const [search, setSearch] = useState("");

    useEffect(() => {
        get("/residents/search", {
            userCode: search
        })
    }, [get, search]);

    const options = data ? data.content.map(item => ({
        label: `${item.userCode} - ${item.fullName}`,
        value: item.id,
    })) : null
    return <Select value={value} allowClear filterOption={false} options={options} showSearch onSearch={setSearch}
                   placeholder={"Chọn sinh viên"} onChange={onChange}/>
}
