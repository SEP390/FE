import {LayoutManager} from "../../../../components/layout/LayoutManager.jsx";
import {Button, Form, Input, InputNumber, Select} from "antd";
import {ChevronLeft, Minus, Plus} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useApi} from "../../../../hooks/useApi.js";
import {useEffect, useState} from "react";
import useErrorNotification from "../../../../hooks/useErrorNotification.js";

function BackButton() {
    const navigate = useNavigate();
    return <Button type={"text"} onClick={() => navigate("/pages/manager/invoice")} icon={<ChevronLeft size={14}/>}>Quay
        lại</Button>
}

function UserSelect({value, onChange}) {
    const {get, data} = useApi();
    const [search, setSearch] = useState("");

    useEffect(() => {
        get("/residents/search", {
            userCode: search
        })
    }, [get, search]);

    const options = data ? data.content.map(item => ({
        label: `${item.userCode} - ${item.fullName}`,
        value: item.id,
    })) : null
    return <Select value={value} allowClear filterOption={false} options={options} showSearch onSearch={setSearch}
                   placeholder={"Chọn sinh viên"} onChange={onChange}/>
}

export default function ManagerCreateInvoice() {
    const {post, data, error, isLoading} = useApi()
    const onFinish = (value) => {
        post("/invoices", value)
    }
    const navigate = useNavigate();

    useEffect(() => {
        if (data) navigate("/pages/manager/invoice")
    }, [data, navigate]);

    useErrorNotification(error)
    return <LayoutManager>
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
                        subject: "USER"
                    }}
                >
                    {(fields) => (
                        <>
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
                                ]}/>
                            </Form.Item>
                            {fields.subject === "USER" && (
                                <>
                                    <Form.Item label={"Sinh viên"}
                                               rules={[{required: true, message: 'Chưa chọn sinh viên'}]}>
                                        <Form.List name={"users"}>
                                            {(fields, {add, remove}) => (
                                                <>
                                                    {fields.map(({key, name, ...restField}) => (
                                                        <>
                                                            <div className={"flex gap-3"}>
                                                                <Form.Item
                                                                    key={key}
                                                                    {...restField}
                                                                    name={[name, 'userId']}
                                                                    rules={[{
                                                                        required: true,
                                                                        message: 'Chưa chọn sinh viên'
                                                                    }]}
                                                                    className={"flex-grow"}
                                                                >
                                                                    <UserSelect/>
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
                                    <Form.Item label={"Phòng"}
                                               rules={[{
                                                   required: true,
                                                   message: 'Chưa chọn phòng'
                                               }]}>
                                        <Input/>
                                    </Form.Item>
                                </>
                            )}
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
                                <InputNumber className={"!w-full"} placeholder={"Nhập giá tiền"}/>
                            </Form.Item>
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