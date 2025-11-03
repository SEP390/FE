import {Card, Divider, Empty, Pagination, Skeleton, Table, Tag} from "antd";
import {useEffect, useState} from "react";
import {useApi} from "../../hooks/useApi.js";
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {formatTime} from "../../util/formatTime.js";

const paymentStatus = {
    SUCCESS: {
        text: "ĐÃ THANH TOÁN",
        color: "success"
    },
    PENDING: {
        text: "CHỜ THANH TOÁN",
        color: "default"
    },
    CANCEL: {
        text: "HỦY THANH TOÁN",
        color: "error"
    },
}

const columns = [
    {
        title: 'Kỳ',
        dataIndex: ['semester', 'name'],
        key: 'semesterId',
        render: (semesterName) => {
            return <Tag>{semesterName}</Tag>
        }
    },
    {
        title: 'Dorm',
        dataIndex: ['dormName'],
        key: 'dormId',
    },
    {
        title: 'Phòng',
        dataIndex: ['roomNumber'],
        key: 'roomId',
    },
    {
        title: 'Slot',
        dataIndex: ['slotName'],
        key: 'slotId',
    },
    {
        title: "Trạng thái",
        dataIndex: ['payment', 'status'],
        key: 'status',
        render: (status) => {
            return <Tag color={paymentStatus[status].color}>{paymentStatus[status].text}</Tag>
        },
        filters: [
            { text: 'Đã thanh toán', value: 'SUCCESS' },
            { text: 'Hủy thanh toán', value: 'CANCEL' },
            { text: 'Chờ thanh toán', value: 'PENDING' },
        ],
    },
    {
        title: 'Ngày tạo',
        dataIndex: ['payment', 'createDate'],
        key: 'createDate',
        render: (createDate) => formatTime(createDate)
    },
];

export function BookingHistoryPage() {
    const [page, setPage] = useState(0);
    const { isLoading, data, get } = useApi();

    const fetchData = (params) => {
        get(`/booking/history?` + new URLSearchParams(params));
    }

    useEffect(() => {
        fetchData({});
    }, []);

    const onTableChange = ({ current }, filters, sorter, extra) => {
        setPage(current - 1);
        if (filters.status) {
            fetchData({ status: filters.status })
        } else {
            fetchData({})
        }
    }

    const dataSource = data ? data.content.map(row => {
        row.key = row.id;
        return row;
    }) : [];

    return <>
        <AppLayout activeSidebar={"booking-history"}>
            <Card className={"h-full"} title="Lịch sử đặt phòng của bạn">
                <div>
                    <Table
                        bordered
                        columns={columns} dataSource={dataSource}
                        pagination={{
                            current: page + 1,
                            total: data ? data.page.totalElements : 0,
                            pageSize: 5
                        }}
                        onChange={onTableChange}
                        className={"mb-4"}
                        locale={{
                            emptyText: isLoading ? <Skeleton active={true} /> : <Empty />
                        }}
                    ></Table>
                </div>
            </Card>
        </AppLayout>
    </>;
}