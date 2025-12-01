import {Select} from "antd";
import {useState} from "react";
import {useInfiniteQuery} from "@tanstack/react-query";
import axiosClient from "../api/axiosClient/axiosClient.js";

export function RoomSelect({ value, totalSlot, swapUserId, ...props}) {
    const [search, setSearch] = useState("");
    const searchTrim = search ? search.trim() : ""
    const {data, fetchNextPage, hasNextPage, isFetchingNextPage} = useInfiniteQuery({
        queryKey: ["rooms", searchTrim, value, totalSlot, swapUserId],
        queryFn: ({pageParam = 0}) => axiosClient.get("/rooms", {
            params: {
                page: pageParam,
                roomNumber: !value ? searchTrim : undefined,
                id: value && !search ? value : undefined,
                totalSlot: totalSlot ? totalSlot : undefined,
                swapUserId: swapUserId ? swapUserId : undefined,
                sort: "roomNumber"
            }
        }).then(res => res.data),
        getNextPageParam: (lastPage) => {
            return lastPage.page.number <= lastPage.page.totalPages ? lastPage.page.number + 1 : undefined
        },
    })
    const options = data ? data.pages.map(item => item.content).flat().map(item => ({
        label: `${item.dorm.dormName} - ${item.roomNumber}`,
        value: item.id,
    })) : null;
    const onPopupScroll = (e) => {
        const {target} = e;
        if (
            target.scrollTop + target.offsetHeight === target.scrollHeight &&
            hasNextPage && !isFetchingNextPage
        ) {
            console.log("fetch next")
            fetchNextPage();
        }
    }

    return <Select onPopupScroll={onPopupScroll} autoClearSearchValue={false} {...props} className={"w-45"}
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
