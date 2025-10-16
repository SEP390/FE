import {Card, Divider, Empty, Pagination, Skeleton, Table, Tag} from "antd";
import {useEffect, useState} from "react";
import {useApi} from "../../hooks/useApi.js";
import {AppLayout} from "../../components/layout/AppLayout.jsx";
import {formatTime} from "../../util/formatTime.js";

const columns = [
    {
        title: 'Kỳ',
        dataIndex: 'semesterName',
        key: 'semesterId',
        render: (semesterName) => {
            return <Tag>{semesterName}</Tag>
        }
    },
    {
        title: 'Dorm',
        dataIndex: 'dormName',
        key: 'dormId',
    },
    {
        title: 'Tầng',
        dataIndex: 'floor',
        key: 'floor',
    },
    {
        title: 'Phòng',
        dataIndex: 'roomNumber',
        key: 'roomId',
    },
    {
        title: 'Slot',
        dataIndex: 'slotName',
        key: 'slotId',
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: 'status',
        render: (status) => {
            if (status === 'SUCCESS') return <Tag color="green">THÀNH CÔNG</Tag>
            return <Tag color="red">HỦY THANH TOÁN</Tag>
        },
        filters: [
            { text: 'Đã thanh toán', value: 'SUCCESS' },
            { text: 'Hủy thanh toán', value: 'CANCEL' },
            { text: 'Chờ thanh toán', value: 'PENDING' },
        ],
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createDate',
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

    const onTableChange = (pagination, filters, sorter, extra) => {
        if (filters.status) {
            fetchData({ status: filters.status[0] })
        } else {
            fetchData({})
        }
    }

    return <>
        <AppLayout activeSidebar={"booking-history"}>
            <Card className={"h-full"} title="Lịch sử đặt phòng của bạn">
                <div>
                    <Table
                        bordered
                        columns={columns} dataSource={data ? data.content.sort((a, b) => b.createDate.localeCompare(a.createDate)) : []}
                        pagination={{
                            total: data?.totalPages
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