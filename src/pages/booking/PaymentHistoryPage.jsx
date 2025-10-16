import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {Card, Skeleton, Table, Tag} from "antd";
import {useApi} from "../../hooks/useApi.js";
import {useEffect, useState} from "react";
import {formatPrice} from "../../util/formatPrice.js";
import {formatTime} from "../../util/formatTime.js";

const statusLabel = {
    SUCCESS: {
        color: "green",
        text: "ĐÃ THANH TOÁN"
    },
    PENDING: {
        color: "default",
        text: "CHỜ THANH TOÁN"
    },
    CANCEL: {
        color: "red",
        text: "HỦY THANH TOÁN"
    }
}

/**
 * @type import("antd").TableColumnsType
 */
const columns = [
    {
        title: 'Giá',
        dataIndex: 'price',
        key: 'price',
        render: (value) => formatPrice(value),
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createDate',
        key: 'createDate',
        render: (createDate) => {
            return formatTime(createDate);
        },
        sorter: {
            multiple: 0
        }
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: 'status',
        render: (status) => <Tag color={statusLabel[status].color}>{statusLabel[status].text}</Tag>,
        filters: Object.entries(statusLabel).map(entry => ({value: entry[0], text: entry[1].text}))
    },
    {
        title: 'Ghi chú',
        dataIndex: 'note',
        key: 'note',
    },
];

export function PaymentHistoryPage() {
    const {get, data, isSuccess} = useApi();

    // Zero index
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState(null)
    const [status, setStatus] = useState(null)

    const dataSource = data ? data.content.map(item => {
        item.key = item.id;
        return item;
    }) : [];

    const onTableChange = ({current}, {status}, {field, order}, extra) => {
        if (field && page > 0) {
            setPage(0);
        } else {
            setPage(current - 1);
            setSort([[field, order]]);
        }
        setStatus(status);
    };

    useEffect(() => {
        get("/payment/history", {page, sort, status});
    }, [get, page, sort, status]);

    return <>
        <AppLayout activeSidebar={"payment"}>
            <Card className={"h-full"} title="Lịch sử thanh toán">
                <Table
                    loading={!isSuccess}
                    bordered
                    onChange={onTableChange}
                    columns={columns}
                    showSorterTooltip={false}
                    dataSource={dataSource}
                    pagination={{
                        current: page + 1,
                        total: data ? data.page.totalElements : 0,
                        pageSize: 5
                    }}
                />
            </Card>
        </AppLayout>
    </>
}