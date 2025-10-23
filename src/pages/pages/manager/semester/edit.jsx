import {AppLayout} from "../../../../components/layout/AppLayout.jsx";
import {NotificationProvider} from "../../../../providers/NotificationProvider.jsx";
import {Button, Card, DatePicker, Form, Input} from "antd";
import {ChevronLeft} from "lucide-react";
import {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useApi} from "../../../../hooks/useApi.js";
import {useNotif} from "../../../../hooks/useNotif.js";
import dayjs from "dayjs";

function EditForm({ semester }) {
    const [form] = Form.useForm();

    const {put, data, error} = useApi()

    form.validateFields((err, values) => {
        if (err) {
            return;
        }
    })

    const notif = useNotif();

    const navigate = useNavigate()

    const onFinish = (value) => {
        console.log(value)
        const startDate = value.startDate ? value.startDate.format('YYYY-MM-DD') : "";
        const endDate = value.endDate ? value.endDate.format('YYYY-MM-DD') : "";
        const name = value.name ? value.name : "";
        console.log(name, startDate, endDate)

        put("/semesters", {
            id: semester.id, name, startDate, endDate
        })
    }

    useEffect(() => {
        data && navigate("/pages/manager/semester/")
    }, [data]);

    useEffect(() => {
        error && notif.error({ message: "Lỗi", description: error })
    }, [error]);

    return <Form initialValues={{
        name: semester.name,
        startDate: dayjs(semester.startDate),
        endDate: dayjs(semester.endDate),
    }} onFinish={onFinish} form={form} layout={"vertical"}>
        <Form.Item name={"name"} label="Tên" rules={[
            {required: true, message:"Tên không được trống"},
        ]}>
            <Input className={"!w-75"}/>
        </Form.Item>
        <Form.Item name={"startDate"} label="Ngày bắt đầu" rules={[
            {required: true, message:"Ngày bắt đầu không được trống"},
        ]}>
            <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name={"endDate"} label="Ngày kết thúc" rules={[
            {required: true, message:"Ngày kết thúc không được trống"},
        ]}>
            <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item>
            <div>
                <Button htmlType={"submit"}>Cập nhật</Button>
            </div>
        </Form.Item>
    </Form>
}

export default function EditSemester() {
    const {get, data, error} = useApi();
    const notif = useNotif();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate()
    const id = searchParams.get("id");

    useEffect(() => {
        get("/semesters/" + id);
    }, [id]);

    useEffect(() => {
        error && notif.error({ message: "Lỗi", description: error })
    }, [error]);

    return <>
        <NotificationProvider>
            <AppLayout>
                <Card title={<>
                    <div className={"flex gap-2"}>
                        <Button onClick={() => navigate("/pages/manager/semester")} size={"small"}><ChevronLeft size={14}/></Button>
                        <div>Sửa Kỳ </div>
                    </div>
                </>}>
                    {data && <EditForm semester={data}/>}
                </Card>
            </AppLayout>
        </NotificationProvider>
    </>
}