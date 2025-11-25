import {useEffect, useState} from "react";
import {Select, Tag} from "antd";
import {useApi} from "../hooks/useApi.js";
import {useQuery} from "@tanstack/react-query";
import axiosClient from "../api/axiosClient/axiosClient.js";

export function SemesterSelect(props) {
    const [search, setSearch] = useState("");
    const {data} = useQuery({
        queryKey: ["semesters", search],
        queryFn: () => axiosClient.get("semesters", {
            params: {
                name: search,
            }
        }).then(res => res.data)
    })

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