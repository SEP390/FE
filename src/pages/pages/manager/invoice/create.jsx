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
                >
                    <Form.Item
                        label="Sinh viên"
                        name="userId"
                        rules={[{required: true, message: 'Bạn phải chọn sinh viên'}]}
                    >
                        <UserSelect/>
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