import {App, Button, Card, Table, Tag} from 'antd';
import {useState} from "react";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import useErrorNotification from "../../hooks/useErrorNotification.js";

export default function VNPayDev() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0)
    const {data} = useQuery({
        queryKey: ["invoices", page],
        queryFn: () => axiosClient.get("/invoices", {
            params: {page}
        }).then(res => res.data),
    })
    const {notification} = App.useApp();
    const {mutate, error} = useMutation({
        mutationFn: ({id, status}) => axiosClient.post(`/invoices/${id}`, {status}),
        onSuccess: () => {
            notification.success({message: "Cập nhật thành công!"})
            queryClient.invalidateQueries({queryKey: ["invoices"]})
        },
    })
    useErrorNotification(error);

    const updateStatus = (id, status) => {
        mutate({ id, status })
    }

    return <>
        <div className={"!h-screen p-5 bg-gray-50 overflow-auto"}>
            <Card title={"VNPay Dev"} className={"border border-gray-200 rounded-lg p-5 bg-white"}>
                <Table dataSource={data?.content} columns={[
                    {
                        title: "Nội dung",
                        dataIndex: "reason",
                    },
                    {
                        title: "Giá",
                        dataIndex: "price",
                    },
                    {
                        title: "Status",
                        dataIndex: "status",
                        render: (val) => <Tag>{val}</Tag>
                    },
                    {
                        title: "Action",
                        render: (val, row) => {
                            return [
                                <Button onClick={() => updateStatus(row.id, "SUCCESS")} type={"link"}>Thành
                                    công</Button>,
                                <Button onClick={() => updateStatus(row.id, "CANCEL")} type={"link"}>Hủy</Button>
                            ]
                        }
                    },
                ]} pagination={{}} bordered/>
            </Card>
        </div>
    </>
}