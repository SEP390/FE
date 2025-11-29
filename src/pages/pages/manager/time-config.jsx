import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {Alert, App, Button, Form} from "antd";
import {DateRangeSelect} from "../../../components/DateRangeSelect.jsx";
import {useEffect} from "react";
import dayjs from "dayjs";
import {formatTime} from "../../../util/formatTime.js";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";

export default function TimeConfigManager() {
    const queryClient = useQueryClient()
    const {data: current, error: currentError} = useQuery({
        queryKey: ["current-time-config"],
        queryFn: () => axiosClient.get("/time-config/current").then(res => res.data),
        retry: false,
    })
    const {notification} = App.useApp()
    const {mutate} = useMutation({
        mutationFn: (val) => axiosClient.post("/time-config", val).then(res => res.data),
        onSuccess: () => {
            notification.success({message: "Cập nhật thành công"})
            queryClient.invalidateQueries({
                queryKey: ["current-time-config"]
            })
        }
    })

    const [form] = Form.useForm()

    useEffect(() => {
        if (form && current) {
            const {startBookingDate, endBookingDate, startExtendDate, endExtendDate} = current
            form.resetFields()
            form.setFieldsValue({
                booking: [dayjs(startBookingDate), dayjs(endBookingDate)],
                extend: [dayjs(startExtendDate), dayjs(endExtendDate)]
            })
        }
    }, [current, form]);

    const onFinish = async (value) => {
        const startBookingDate = value.booking[0].format('YYYY-MM-DD')
        const endBookingDate = value.booking[1].format('YYYY-MM-DD')
        const startExtendDate = value.extend[0].format('YYYY-MM-DD')
        const endExtendDate = value.extend[1].format('YYYY-MM-DD')
        const payload = {
            startBookingDate, endBookingDate, startExtendDate, endExtendDate,
        }
        mutate(payload)
    }

    return <RequireRole role={"MANAGER"}><LayoutManager>
        <div className={"flex flex-col gap-3"}>
            <div className={"section"}>
                <div className={"font-medium text-lg"}>Quản lý thời gian đặt phòng</div>
            </div>
            <div className={"section"}>
                {currentError?.response?.data?.message === "TIME_CONFIG_NOT_FOUND" && (
                    <>
                        <div className={"md:w-80 mb-3"}>
                            <Alert type={"error"} showIcon
                                   message={"Hiện tại chưa có dữ liệu, tạo bằng form bên dưới"}/>
                        </div>
                    </>
                )}
                <Form onFinish={onFinish} form={form} layout={"vertical"} labelCol={5}>
                    <Form.Item name={"booking"} rules={[
                        {required: true, message: "Chọn thời gian đặt phòng"},
                    ]} label={"Thời gian đặt phòng"}>
                        <DateRangeSelect/>
                    </Form.Item>
                    <Form.Item name={"extend"} rules={[
                        {required: true, message: "Chọn thời gian gia hạn"},
                    ]} label={"Thời gian gia hạn"}>
                        <DateRangeSelect/>
                    </Form.Item>
                    <Form.Item>
                        <div className={"flex gap-5"}>
                            <Button type="primary" htmlType="submit">Cập nhật</Button>
                            {current && (
                                <>
                                    <span>Lần cuối cập nhật: {formatTime(current.createTime)}</span>
                                </>
                            )}
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </div>
    </LayoutManager></RequireRole>
}