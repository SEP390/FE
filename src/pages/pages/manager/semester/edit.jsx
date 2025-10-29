import {App, Button, Card, DatePicker, Form, Input} from "antd";
import {ChevronLeft} from "lucide-react";
import {useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useApi} from "../../../../hooks/useApi.js";
import dayjs from "dayjs";
import {LayoutManager} from "../../../../components/layout/LayoutManager.jsx";

function EditForm({ semester }) {
    const [form] = Form.useForm();
    const {notification} = App.useApp();
    const {put, data, error} = useApi()

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
    }, [data, navigate]);
    
    

    useEffect(() => {
        error && notification.error({ message: "Lỗi", description: error })
    }, [error, notification]);

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
    const {notification} = App.useApp();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate()
    const id = searchParams.get("id");

    useEffect(() => {
        get("/semesters/" + id);
    }, [id, get]);

    useEffect(() => {
        error && notification.error({ message: "Lỗi", description: error })
    }, [error, notification]);

    return <>
        <LayoutManager active={"semester"}>
            <Card title={<>
                <div className={"flex gap-2"}>
                    <Button onClick={() => navigate("/pages/manager/semester")} size={"small"}><ChevronLeft size={14}/></Button>
                    <div>Sửa Kỳ </div>
                </div>
            </>}>
                {data != null && <EditForm semester={data}/>}
            </Card>
        </LayoutManager>
    </>
}