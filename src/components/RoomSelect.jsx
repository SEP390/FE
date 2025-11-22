import {Select} from "antd";
import {useEffect, useState} from "react";
import {useApi} from "../hooks/useApi.js";

export function RoomSelect(props) {
    const {get, data} = useApi();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [options, setOptions] = useState([]);
    const {value} = props;

    useEffect(() => {
        if (data) {
            const opts = data.content.map(item => ({
                label: `${item.dorm.dormName} - ${item.roomNumber}`,
                value: item.id,
            }))
            if (page === 0) {
                setOptions(opts)
            } else {
                setOptions([...options, ...opts])
            }
        }
    }, [data]);

    const handlePopupScroll = (e) => {
        const {target} = e;
        if (
            target.scrollTop + target.offsetHeight === target.scrollHeight &&
            data?.page.totalPages > page + 1
        ) {
            console.log("EQUAL")
            setPage(page + 1)
        }
    };

    useEffect(() => {
        setPage(0)
    }, [search]);

    useEffect(() => {
        get("/rooms", {
            roomNumber: search ? search : undefined,
            id: value && !search ? value : undefined,
            page: page
        })
    }, [get, search, value, page]);

    return <Select onPopupScroll={handlePopupScroll} autoClearSearchValue={false} {...props} className={"w-45"}
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
