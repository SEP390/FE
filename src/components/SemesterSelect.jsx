import {useEffect, useState} from "react";
import {Select, Tag} from "antd";
import {useApi} from "../hooks/useApi.js";

export function SemesterSelect(props) {
    const {get, data} = useApi();
    const [search, setSearch] = useState("");

    useEffect(() => {
        get("/semesters", {
            name: search
        })
    }, [get, search]);

    const options = data ? data.content.map(item => ({
        label: item.name,
        value: item.id,
    })) : null
    return <Select {...props} allowClear filterOption={false}
                   options={options} showSearch onSearch={setSearch}
                   placeholder={"Chọn kỳ"}/>
}

export function SemesterFilter(props) {
    return <div className={"flex flex-col gap-1"}>
        <div className={"font-medium"}>Chọn kỳ</div>
        <SemesterSelect {...props} />
    </div>
}