import {useState} from "react";
import {Select} from "antd";
import {useInfiniteQuery} from "@tanstack/react-query";
import axiosClient from "../api/axiosClient/axiosClient.js";

export function ResidentSelect({value, onChange}) {
    const [search, setSearch] = useState("");

    const searchTrim = search ? search.trim() : ""

    const {data, fetchNextPage, hasNextPage, isFetchingNextPage} = useInfiniteQuery({
        queryKey: ["residents", searchTrim, value],
        queryFn: ({pageParam = 0}) => axiosClient.get("/residents/search", {
            params: {
                page: pageParam,
                userCode: !value ? searchTrim : undefined,
                id: value ? value : undefined,
            }
        }).then(res => res.data),
        getNextPageParam: (lastPage) => {
            return lastPage.page.number <= lastPage.page.totalPages ? lastPage.page.number + 1 : undefined
        },
    })
    const options = data ? data.pages.map(item => item.content).flat().map(item => ({
        label: `${item.userCode} - ${item.fullName}`,
        value: item.id,
    })) : null
    const onPopupScroll = (e) => {
        const {target} = e;
        if (
            target.scrollTop + target.offsetHeight === target.scrollHeight &&
            hasNextPage && !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    }
    return <Select onPopupScroll={onPopupScroll} value={value} onChange={onChange} className={"w-45"} allowClear
                   filterOption={false}
                   options={options} showSearch onSearch={setSearch}
                   placeholder={"Chọn sinh viên"}/>
}

export function ResidentFilter(props) {
    return <div className={"flex flex-col gap-2"}>
        <div className={"text-sm font-medium"}>Sinh viên</div>
        <ResidentSelect {...props} />
    </div>
}
