import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import {App, Button, Table, Tag} from "antd";
import {Bed, Building, House} from "lucide-react";
import {formatPrice} from "../../util/formatPrice.js";
import {Roommates} from "./Roommates.jsx";
import useErrorNotification from "../../hooks/useErrorNotification.js";

function PaymentAction() {
    const queryClient = useQueryClient()
    const {mutate, error} = useMutation({
        mutationFn: () => axiosClient({
            url: "/booking/payment",
            method: "POST",
        }).then(res => res.data),
        onSuccess: async (data) => {
            window.open(data, '_blank')
            await queryClient.invalidateQueries({
                queryKey: ["current-slot"]
            })
        }
    })
    useErrorNotification(error)
    const onClick = async () => {
        mutate()
    }
    return <Button onClick={onClick} type="link">Thanh toán</Button>
}

function ExtendAction() {
    const queryClient = useQueryClient();
    const {notification} = App.useApp();
    const currentSemester = useQuery({
        queryKey: ["semestes-current"],
        queryFn: () => axiosClient.get("/semesters/current").then(res => res.data)
    })
    const currentSlotHistory = useQuery({
        queryKey: ["user-slot-history-current"],
        queryFn: () => axiosClient.get("/user/slot-history/current").then(res => res.data),
    })
    const {mutate} = useMutation({
        mutationFn: () => axiosClient.get("/booking/extend").then(res => res.data),
        onError: err => {
            const errCode = err?.response?.data?.message || err?.message;
            notification.error({message: errCode})
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["current-slot"]
            })
        }
    })

    return currentSemester.data?.id === currentSlotHistory.data?.semester?.id && <Button onClick={() => mutate()} type={"link"}>Gia hạn</Button>
}

export function CurrentSlot() {
    const {data, isLoading} = useQuery({
        queryKey: ["current-slot"],
        queryFn: () => axiosClient.get("/slots/current").then(res => res.data),
    })
    return (<>
            <div className={"section"}>
                <div className={"font-medium mb-3"}>Phòng hiện tại</div>
                <Table loading={isLoading} bordered dataSource={[data]} columns={[
                    {
                        title: "Dorm",
                        dataIndex: ["room", "dorm", "dormName"],
                        render: (val) => <span className={"flex gap-1 items-center"}><Building size={14}/>{val}</span>
                    },
                    {
                        title: "Phòng",
                        dataIndex: ["room", "roomNumber"],
                        render: (val) => <span className={"flex gap-1 items-center"}><House size={14}/>{val}</span>
                    },
                    {
                        title: "Slot",
                        dataIndex: ["slotName"],
                        render: (val) => <span className={"flex gap-1 items-center"}><Bed size={14}/>{val}</span>
                    },
                    {
                        title: "Số giường",
                        dataIndex: ["room", "totalSlot"],
                        render: (val) => <span className={"flex gap-1 items-center"}><Bed size={14}/>{val}</span>
                    },
                    {
                        title: "Giá",
                        dataIndex: ["room", "pricing", "price"],
                        render: (val) => formatPrice(val)
                    },
                    {
                        title: "Trạng thái",
                        dataIndex: ["status"],
                        render: (val) => {
                            if (val === "LOCK") return <Tag>Chưa thanh toán</Tag>
                            if (val === "CHECKIN") return <Tag>Chờ checkin</Tag>
                            if (val === "UNAVAILABLE") return <Tag>Đã checkin</Tag>
                        }
                    },
                    {
                        title: "Hành động",
                        render: (val, row) => {
                            if (row?.status === "LOCK") return <PaymentAction slot={row}/>
                            return <ExtendAction slot={row}/>
                        }
                    },
                ]} pagination={false}/>
            </div>
            <Roommates/>
        </>
    )
}
