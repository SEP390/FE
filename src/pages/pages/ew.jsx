import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {PageHeader} from "../../components/PageHeader.jsx";
import {Table, Tag} from "antd";
import {SemesterFilter} from "../../components/SemesterSelect.jsx";
import {DateRangeFilter} from "../../components/DateRangeSelect.jsx";
import {useQuery} from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import useErrorNotification from "../../hooks/useErrorNotification.js";
import {create} from "zustand";
import {formatDate} from "../../util/formatTime.js";
import {ThunderboltOutlined} from "@ant-design/icons";
import {CalendarDays, Droplet} from "lucide-react";

function CountLabel({value, label}) {
    return <div className={"section text-center"}>
        <div className={"text-lg font-medium"}>{value}</div>
        <div>{label}</div>
    </div>
}

function CurrentUsage() {
    const {data, error} = useQuery({
        queryKey: ["user-ew-count"],
        queryFn: () => axiosClient.get("/user/ew/count").then(res => res.data)
    })

    useErrorNotification(error)

    return <div className={"flex gap-3 *:flex-grow flex-wrap"}>
        <CountLabel value={data?.electric} label={"Số điện đã dùng kỳ này"}/>
        <CountLabel value={data?.water} label={"Số nước đã dùng kỳ này"}/>
        <CountLabel value={data?.electricOverflow} label={"Số điện vượt mức kỳ này"}/>
        <CountLabel value={data?.waterOverflow} label={"Số nước vượt mức kỳ này"}/>
    </div>
}

const useFilterStore = create(set => ({
    page: 0,
    sort: "startDate,DESC",
    semesterId: null,
    setSemesterId: (semesterId) => set({semesterId}),
    onChange: ({current}, filter, {field, order}) => set({
        page: current - 1,
        sort: field ? `${field},${order === "ascend" ? "ASC" : "DESC"}` : "startDate,DESC"
    }),
    startDate: null,
    endDate: null,
    setDateRange: (val) => {
        if (val) {
            set({
                startDate: val[0].format("YYYY-MM-DD"),
                endDate: val[1].format("YYYY-MM-DD"),
            })
        } else {
            set({startDate: null, endDate: null})
        }
    }
}))

export default function UserEWUsage() {
    const {page, onChange, semesterId, setSemesterId, sort, startDate, endDate, setDateRange} = useFilterStore();
    const {data, error} = useQuery({
        queryKey: ["user-ew", page, semesterId, sort, startDate, endDate],
        queryFn: () => axiosClient.get("/user/ew", {
            params: {
                page, sort, semesterId, startDate, endDate
            }
        }).then(res => res.data)
    })

    useErrorNotification(error)

    return <AppLayout activeSidebar={"ew"}>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={'Sử dụng điện nước'}/>
            <CurrentUsage/>
            <div className={"section"}>
                <div className={"font-medium text-lg mb-3"}>Bộ lọc</div>
                <div className={"flex gap-3"}>
                    <SemesterFilter onChange={setSemesterId}/>
                    <DateRangeFilter onChange={setDateRange}/>
                </div>
            </div>
            <div className={"section flex-grow"}>
                <Table className={"overflow-auto"} dataSource={data ? data.content : []} bordered columns={[
                    {
                        title: "Số điện",
                        dataIndex: "electric",
                        render: (val) => <span
                            className={"flex gap-1 items-center"}><ThunderboltOutlined/>{val} kW</span>,
                        sorter: true,
                    },
                    {
                        title: "Số nước",
                        dataIndex: "water",
                        render: (val) => <span className={"flex gap-1 items-center"}><Droplet size={14}/>{val}<span>m<sup>3</sup></span></span>,
                        sorter: true,
                    },
                    {
                        title: "Kỳ",
                        dataIndex: ["semester", "name"],
                        render: (val) => <Tag>{val}</Tag>
                    },
                    {
                        title: "Từ ngày",
                        dataIndex: "startDate",
                        render: (val) => <span className={"flex gap-1 items-center"}><CalendarDays size={14}/>{formatDate(val)}</span>,
                        sorter: true,
                    },
                    {
                        title: "Đến ngày",
                        dataIndex: "endDate",
                        render: (val) => <span className={"flex gap-1 items-center"}><CalendarDays size={14}/>{formatDate(val)}</span>,
                        sorter: true,
                    },
                    {
                        title: "Trạng thái",
                        dataIndex: "paid",
                        render: (value, record) => {
                            if (value) return <Tag color={"success"}>Đã thanh toán</Tag>
                            if (!value) return <Tag color={"error"}>Chưa thanh toán</Tag>
                        }
                    },
                ]} onChange={onChange} pagination={{
                    current: page + 1,
                    total: data?.page?.totalElements,
                }}/>
            </div>
        </div>
    </AppLayout>
};