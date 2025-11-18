import {LayoutManager} from "../../../../components/layout/LayoutManager.jsx";
import {Button, Form, Input, InputNumber, Select} from "antd";
import {ChevronLeft} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useApi} from "../../../../hooks/useApi.js";
import {useEffect, useState} from "react";
import useErrorNotification from "../../../../hooks/useErrorNotification.js";

function BackButton() {
    const navigate = useNavigate();
    return <Button type={"text"} onClick={() => navigate("/pages/manager/invoice")} icon={<ChevronLeft size={14}/>}>Quay
        lại</Button>
}

function UserCodeSelect() {
    const {get, data} = useApi();
    const [search, setSearch] = useState("");

    useEffect(() => {
        get("/residents/search", {
            userCode: search
        })
    }, [get, search]);

    const onChange = (value) => {
        console.log(value)
    }
    return <Select options={data ? data.content.map(item => ({
        label: `${item.userCode} - ${item.fullName}`,
        value: item.id,
    })) : []} showSearch onSearch={setSearch} placeholder={"Chọn sinh viên"} onChange={onChange}/>
}

export default function ManagerCreateInvoice() {
    const {post, data, error, isLoading} = useApi()
    const onFinish = (value) => {
        post("/invoices", value)
    }
    useErrorNotification(error)
    const [form] = Form.useForm()
    return <LayoutManager>
        <div className={"rounded-lg h-full flex flex-col gap-3"}>
            <div className={"p-5 bg-white rounded-lg border border-gray-200 flex gap-3 items-center flex-wrap"}>
                <BackButton/>
                <div className={"font-medium text-lg"}>Tạo hóa đơn</div>
            </div>
            <div className={"p-5 bg-white rounded-lg border border-gray-200 flex gap-3 items-center flex-wrap"}>
                <Form
                    form={form}
                    name="basic"
                    labelCol={{span: 5}}
                    className={"w-130"}
                    onFinish={onFinish}
                    onFinishFailed={null}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Sinh viên"
                        name="userCode"
                        rules={[{required: true, message: 'Bạn phải chọn sinh viên'}]}
                    >
                        <UserCodeSelect/>
                    </Form.Item>
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
                </Form>
            </div>
        </div>
    </LayoutManager>
}