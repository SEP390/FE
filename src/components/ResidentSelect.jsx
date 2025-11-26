import {useState} from "react";
import {Select} from "antd";
import {useQuery} from "@tanstack/react-query";
import axiosClient from "../api/axiosClient/axiosClient.js";

export function ResidentSelect({value, onChange}) {
    const [search, setSearch] = useState("");

    const {data} = useQuery({
        queryKey: ["residents", search, value],
        queryFn: () => axiosClient.get("/residents/search", {
            params: {
                userCode: !value ? search : undefined,
                id: value ? value : undefined,
            }
        }).then(res => res.data)
    })

    const options = data ? data.content.map(item => ({
        label: `${item.userCode} - ${item.fullName}`,
        value: item.id,
    })) : null

    return <Select value={value} onChange={onChange} className={"w-45"} allowClear filterOption={false}
                   options={options} showSearch onSearch={setSearch}
                   placeholder={"Chọn sinh viên"}/>
}

export function ResidentFilter(props) {
    return <div className={"flex flex-col gap-2"}>
        <div className={"text-sm font-medium"}>Sinh viên</div>
        <ResidentSelect {...props} />
    </div>
}
