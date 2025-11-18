import {App, Button, Card, Table, Tag} from 'antd';
import {useApi} from "../../hooks/useApi.js";
import {useEffect} from "react";
import axiosClient from "../../api/axiosClient/axiosClient.js";
export default function VNPayDev() {
    const {get, data} = useApi();

    useEffect(() => {
        get("/invoices")
    }, [get]);
    
    const {notification} = App.useApp();

    const updateStatus = (id, status) => {
        axiosClient({
            method: "POST",
            url: "/vnpay-dev",
            params: {
                id, status
            }
        }).then(res => {
            get("/invoices")
            notification.info({message: "Updated"})
        })
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
                                <Button onClick={() => updateStatus(row.id, "SUCCESS")} type={"link"}>Thành công</Button>,
                                <Button onClick={() => updateStatus(row.id, "CANCEL")} type={"link"}>Hủy</Button>
                            ]
                        }
                    },
                ]} pagination={{

                }} bordered/>
            </Card>
        </div>
    </>
}