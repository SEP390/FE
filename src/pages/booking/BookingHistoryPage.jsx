import {Card, Divider, Pagination, Skeleton, Table, Tag} from "antd";
import {useEffect, useState} from "react";
import {useApi} from "../../hooks/useApi.js";
import {AppLayout} from "../../components/layout/AppLayout.jsx";

const columns = [
    {
        title: 'Kỳ',
        dataIndex: 'semesterName',
        key: 'semesterId',
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
            { text: 'Thành công', value: 'SUCCESS' },
            { text: 'Hủy', value: 'CANCEL' },
            { text: 'Chờ thanh toán', value: 'PENDING' },
        ],
        filterMultiple: false,
    }
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
                    {isLoading && <Skeleton active/>}
                    {data && <>
                        <Table
                            bordered
                            columns={columns} dataSource={data.content}
                            pagination={{
                                total: data.totalPages
                            }}
                            onChange={onTableChange}
                            className={"mb-4"}
                        ></Table>
                    </>}
                </div>
            </Card>
        </AppLayout>
    </>;
}