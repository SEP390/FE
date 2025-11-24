import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {PageHeader} from "../../components/PageHeader.jsx";
import {Table, Tag} from "antd";
import {createApiStore} from "../../util/createApiStore.js";
import {useViewEffect} from "../../hooks/useViewEffect.js";
import {SemesterFilter} from "../../components/SemesterSelect.jsx";
import {DateRangeFilter} from "../../components/DateRangeSelect.jsx";

const userUsage = createApiStore("GET", "/user/ew/count")

function CountLabel({ value, label }) {
    return <div className={"section text-center"}>
        <div className={"text-lg font-medium"}>{value}</div>
        <div>{label}</div>
    </div>
}

function CurrentUsage() {
    const {data} = useViewEffect(userUsage)

    return <div className={"flex gap-3 *:flex-grow flex-wrap"}>
        <CountLabel value={data?.electric} label={"Số điện đã dùng kỳ này"} />
        <CountLabel value={data?.water} label={"Số nước đã dùng kỳ này"} />
        <CountLabel value={data?.electricOverflow} label={"Số điện vượt mức kỳ này"} />
        <CountLabel value={data?.waterOverflow} label={"Số nước vượt mức kỳ này"} />
    </div>
}

const userEWUsageStore = createApiStore("GET", "/user/ew")
export default function UserEWUsage() {
    const {data} = useViewEffect(userEWUsageStore)

    return <AppLayout activeSidebar={"ew"}>
        <div className={"flex flex-col gap-3"}>
            <PageHeader title={'Sử dụng điện nước'}/>
            <CurrentUsage/>
            <div className={"section"}>
                <div className={"font-medium text-lg mb-3"}>Bộ lọc</div>
                <div className={"flex gap-3"}>
                    <SemesterFilter/>
                    <DateRangeFilter/>
                </div>
            </div>
            <div className={"section flex-grow"}>
                <Table className={"overflow-auto"} dataSource={data ? data.content : []} bordered columns={[
                    {
                        title: "Số điện",
                        dataIndex: "electric",
                    },
                    {
                        title: "Số nước",
                        dataIndex: "water",
                    },
                    {
                        title: "Kỳ",
                        dataIndex: ["semester", "name"],
                    },
                    {
                        title: "Từ ngày",
                        dataIndex: "startDate",
                    },
                    {
                        title: "Đến ngày",
                        dataIndex: "endDate",
                    },
                    {
                        title: "Trạng thái",
                        dataIndex: "paid",
                        render: (value, record) => {
                            if (value) return <Tag color={"success"}>Đã thanh toán</Tag>
                            if (!value) return <Tag color={"error"}>Chưa thanh toán</Tag>
                        }
                    },
                ]}/>
            </div>
        </div>
    </AppLayout>
};