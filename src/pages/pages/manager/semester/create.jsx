import {Button, Card, DatePicker, Form, Input} from "antd";
import {AppLayout} from "../../../../components/layout/AppLayout.jsx";
import {ChevronLeft} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useApi} from "../../../../hooks/useApi.js";
import {useEffect} from "react";
import {NotificationProvider} from "../../../../providers/NotificationProvider.jsx";
import {useNotif} from "../../../../hooks/useNotif.js";

export default function CreateSemester() {
    const [form] = Form.useForm();

    const {post, data, error} = useApi()

    const notif = useNotif();

    const navigate = useNavigate()

    const onFinish = (value) => {
        console.log(value)
        const startDate = value.startDate ? value.startDate.format('YYYY-MM-DD') : "";
        const endDate = value.endDate ? value.endDate.format('YYYY-MM-DD') : "";
        const name = value.name ? value.name : "";
        console.log(name, startDate, endDate)

        post("/semesters", {
            name, startDate, endDate
        })
    }

    useEffect(() => {
        data && navigate("/pages/manager/semester/")
    }, [data]);

    useEffect(() => {
        error && notif.error({ message: "Lỗi", description: error })
    }, [error]);

    return <>
        <NotificationProvider>
            <AppLayout>
                <Card title={<>
                    <div className={"flex gap-2"}>
                        <Button onClick={() => navigate("/pages/manager/semester")} size={"small"}><ChevronLeft size={14}/></Button>
                        <div>Tạo Kỳ</div>
                    </div>
                </>}>
                    <Form onFinish={onFinish} form={form} layout={"vertical"}>
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
                                <Button htmlType={"submit"}>Tạo</Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Card>
            </AppLayout>
        </NotificationProvider>
    </>
}