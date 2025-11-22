import {LayoutManager} from "../../../../components/layout/LayoutManager.jsx";
import {Button, Form, Input, Select} from "antd";
import {ChevronLeft, Minus, Plus} from "lucide-react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useApi} from "../../../../hooks/useApi.js";
import {useEffect} from "react";
import useErrorNotification from "../../../../hooks/useErrorNotification.js";
import PriceInput from "../../../../components/PriceInput.jsx";
import {RoomSelect} from "../../../../components/RoomSelect.jsx";
import {ResidentSelect} from "../../../../components/ResidentSelect.jsx";

function BackButton() {
    const navigate = useNavigate();
    const [params] = useSearchParams()
    const onClick = () => {
        if (params.get("back") === "ew") navigate("/pages/manager/ew")
        else navigate("/pages/manager/invoice")
    }
    return <Button type={"text"} onClick={onClick} icon={<ChevronLeft size={14}/>}>Quay
        lại</Button>
}

export default function ManagerCreateInvoice() {
    const {post, data, error, isLoading} = useApi()
    const onFinish = (value) => {
        post("/invoices", value)
    }
    const navigate = useNavigate();

    const [params] = useSearchParams()

    useEffect(() => {
        if (data) navigate("/pages/manager/invoice")
    }, [data, navigate]);

    useErrorNotification(error)
    return <LayoutManager header={<span className={"font-medium text-lg"}>Tạo hóa đơn</span>}>
        <div className={"rounded-lg h-full flex flex-col gap-3"}>
            <div className={"p-5 bg-white rounded-lg border border-gray-200 flex gap-3 items-center flex-wrap"}>
                <BackButton/>
                <div className={"font-medium text-lg"}>Tạo hóa đơn</div>
            </div>
            <div className={"p-5 bg-white rounded-lg border border-gray-200 flex gap-3 items-center flex-wrap"}>
                <Form
                    name="basic"
                    labelCol={{span: 5}}
                    className={"w-130"}
                    onFinish={onFinish}
                    initialValues={{
                        subject: params.get("subject") || "USER",
                        type: params.get("type") || "OTHER"
                    }}
                >
                    {(fields) => (
                        <>
                            <Form.Item name={"type"} label={"Loại hóa đơn"}>
                                <Select allowClear placeholder={"Loại hóa đơn"} options={[
                                    {
                                        label: "Điện nước",
                                        value: "EW",
                                    },
                                    {
                                        label: "Vi phạm",
                                        value: "VIOLATION",
                                    },
                                    {
                                        label: "Khác",
                                        value: "OTHER",
                                    },
                                ]}/>
                            </Form.Item>
                            {fields.type === "EW" && (
                                <>
                                    <div className={"mb-3 text-center"}>Tạo hóa điện nước tự động (nếu có)</div>
                                </>
                            )}
                            <Form.Item
                                label="Chủ thể"
                                name="subject"
                                rules={[{required: true, message: 'Bạn phải chọn sinh viên'}]}
                            >
                                <Select options={[
                                    {
                                        label: "Sinh viên",
                                        value: "USER"
                                    },
                                    {
                                        label: "Phòng",
                                        value: "ROOM"
                                    },
                                    {
                                        label: "Tất cả sinh viên",
                                        value: "ALL"
                                    },
                                ]}/>
                            </Form.Item>
                            {fields.subject === "USER" && (
                                <>
                                    <Form.Item label={"Sinh viên"}
                                               rules={[{required: true, message: 'Chưa chọn sinh viên'}]}>
                                        <Form.List initialValue={[undefined]} name={"users"}>
                                            {(fields, {add, remove}) => (
                                                <>
                                                    {fields.map(({key, name}) => (
                                                        <>
                                                            <div className={"flex gap-3"}>
                                                                <Form.Item
                                                                    key={key}
                                                                    name={[name, 'userId']}
                                                                    rules={[{
                                                                        required: true,
                                                                        message: 'Chưa chọn sinh viên'
                                                                    }]}
                                                                    className={"flex-grow"}
                                                                >
                                                                    <ResidentSelect/>
                                                                </Form.Item>
                                                                <Button onClick={() => remove(name)} type={"dashed"}
                                                                        icon={<Minus size={14}/>}></ Button>
                                                            </div>
                                                        </>
                                                    ))}
                                                    <Form.Item><Button onClick={() => add()} type={"dashed"}
                                                                       icon={<Plus size={14}/>}>Thêm sinh viên</Button></Form.Item>
                                                </>
                                            )}
                                        </Form.List>
                                    </Form.Item>
                                </>
                            )}
                            {fields.subject === "ROOM" && (
                                <>
                                    <Form.Item name={"roomId"} label={"Phòng"}
                                               rules={[{
                                                   required: true,
                                                   message: 'Chưa chọn phòng'
                                               }]}>
                                        <RoomSelect/>
                                    </Form.Item>
                                </>
                            )}
                            {fields.type !== "EW" && (
                                <>
                                    <Form.Item
                                        label="Nội dung"
                                        name="reason"
                                        rules={[{required: true, message: 'Bạn phải nhập nội dung'}]}
                                    >
                                        <Input.TextArea placeholder={"Nhập nội dung"}/>
                                    </Form.Item>
                                    <Form.Item
                                        label="Giá tiền"
                                        name="price"
                                        rules={[{required: true, message: 'Bạn phải nhập nội dung'}]}
                                    >
                                        <PriceInput/>
                                    </Form.Item>
                                </>
                            )}
                            <Form.Item label={null}>
                                <Button type="primary" htmlType="submit">
                                    Tạo
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form>
            </div>
        </div>
    </LayoutManager>
}