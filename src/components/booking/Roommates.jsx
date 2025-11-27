import {useQuery} from "@tanstack/react-query";
import axiosClient from "../../api/axiosClient/axiosClient.js";
import {Button, Modal, Table} from "antd";
import {create} from "zustand";
const useRoommateModal = create(set => ({
    id: null,
    isOpen: false,
    open: (id) => set({isOpen: true, id}),
    close: () => set({isOpen: false, id: null}),
}))

function RoommateModal() {
    const {isOpen, close, id} = useRoommateModal()

    const {data} = useQuery({
        queryKey: ["roommate", id],
        queryFn: () => id && axiosClient.get(`/roommate/${id}`).then(res => res.data),
    })

    return <Modal title={"Thông tin chi tiết"} open={isOpen} onCancel={close} onOk={close} footer={null}>
        {data && (
            <>
                <div className={"font-medium mb-3"}>Các survey trùng nhau</div>
                <div>
                    {data.similar.map(item => (
                        <>
                            <div className={"bg-gray-50 border border-gray-200 p-2"}>
                                <div className={"font-medium"}>Câu hỏi</div>
                                <div>{item[0]}</div>
                                <div className={"font-medium"}>Câu trả lời</div>
                                <div>{item[1]}</div>
                            </div>
                        </>
                    ))}
                </div>
            </>
        )}
    </Modal>
}

export function Roommates() {
    const {open} = useRoommateModal();
    const {data} = useQuery({
        queryKey: ["roommates"],
        queryFn: () => axiosClient.get("/user/roommates").then(res => res.data),
    })
    return <div className={"section"}>
        <RoommateModal />
        <div className={"font-medium mb-3"}>Bạn cùng phòng</div>
        <Table bordered dataSource={data ? data : null} columns={[
            {
                title: "Mã sinh viên",
                dataIndex: ["userCode"],
            },
            {
                title: "Sinh viên",
                dataIndex: ["fullName"],
            },
            {
                title: "Email",
                dataIndex: ["email"],
            },
            {
                title: "Độ phù hợp",
                dataIndex: ["matching"],
            },
            {
                title: "Hành động",
                render: (val, row) => {
                    return <Button onClick={() => open(row.id)} type={"link"}>Chi tiết</Button>
                }
            },
        ]} pagination={false}/>
    </div>
}
