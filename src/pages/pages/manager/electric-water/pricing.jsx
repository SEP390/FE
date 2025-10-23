import {AppLayout} from "../../../../components/layout/AppLayout.jsx";
import {Button, Card, Form, InputNumber} from "antd";
import {useApi} from "../../../../hooks/useApi.js";
import {useEffect, useState} from "react";
import {formatTime} from "../../../../util/formatTime.js";

function ElectricWaterForm({ children, onFinish, initialValues, disable = false }) {
    const [form] = Form.useForm();
    return <>
        <Form onFinish={onFinish} initialValues={initialValues} form={form} layout={"vertical"}>
            <FormItems disable={disable} />
            {children}
        </Form>
    </>
}

function FormItems({ disable }) {
    return <>
        <Form.Item name={"electricPrice"} label={"Số tiền / 1 kW điện"}>
            <InputNumber disabled={disable} addonAfter={"VNĐ"} />
        </Form.Item>
        <Form.Item name={"waterPrice"} label={"Số tiền / 1 m3 nước"}>
            <InputNumber disabled={disable} addonAfter={"VNĐ"} />
        </Form.Item>
    </>
}

function EditPage({ pricing, setEdit, fetchData}) {
    const {post, data, error} = useApi();

    const createPricing = (value) => {
        post("/electric-water-pricing", value)
    }

    useEffect(() => {
        if (data) {
            fetchData();
            setEdit(false);
        }
    }, [data]);

    return <ElectricWaterForm onFinish={createPricing} initialValues={pricing}>
        <div className={"flex gap-3"}>
            <Button htmlType={"submit"}>Cập nhật</Button>
            <Button onClick={() => setEdit(false)}>Hủy</Button>
        </div>
    </ElectricWaterForm>
}

function ReadPage({ pricing, setEdit }) {
    return <ElectricWaterForm disable={true} initialValues={pricing}>
        <div className={"flex gap-3"}>
            <Button onClick={() => setEdit(true)}>Sửa</Button>
        </div>
    </ElectricWaterForm>
}

export default function ManageElectricWaterPricing() {
    const {get, data, error, isSuccess} = useApi();

    const [edit, setEdit] = useState(false);

    const fetchData = () => {
        get("/electric-water-pricing/current");
    }

    useEffect(() => {
        fetchData();
    }, []);

    return <>
        <AppLayout>
            <Card title={"Quản lý giá điện nước"}>
                {data && <div>Lần cuối cập nhật: {formatTime(data.startDate)}</div>}
                {data && !edit && <ReadPage pricing={data} setEdit={setEdit} />}
                {isSuccess && edit && <EditPage pricing={data} setEdit={setEdit} fetchData={fetchData} />}
            </Card>
        </AppLayout>
    </>
}