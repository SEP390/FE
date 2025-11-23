import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {Alert, Button, Form} from "antd";
import {DateRangeSelect} from "../../../components/DateRangeSelect.jsx";
import {createApiStore} from "../../../util/createApiStore.js";
import {useViewEffect} from "../../../hooks/useViewEffect.js";
import {useEffect} from "react";
import {useUpdateEffect} from "../../../hooks/useUpdateEffect.js";
import dayjs from "dayjs";
import {formatTime} from "../../../util/formatTime.js";

const getCurrentTimeConfigApi = createApiStore("GET", "/time-config/current")
const updateTimeConfigApi = createApiStore("POST", "/time-config")

export default function TimeConfigManager() {
    const currentTimeConfig = getCurrentTimeConfigApi(state => state.data)
    const currentTimeConfigError = getCurrentTimeConfigApi(state => state.error)
    const getCurrentTimeConfig = getCurrentTimeConfigApi(state => state.fetch)
    const updateTimeConfig = updateTimeConfigApi(state => state.mutate)

    const [form] = Form.useForm()

    useEffect(() => {
        getCurrentTimeConfig().then()
    }, [getCurrentTimeConfig])

    useUpdateEffect(updateTimeConfigApi)

    useEffect(() => {
        if (form && currentTimeConfig) {
            const {startBookingDate, endBookingDate, startExtendDate, endExtendDate} = currentTimeConfig
            form.resetFields()
            form.setFieldsValue({
                booking: [dayjs(startBookingDate), dayjs(endBookingDate)],
                extend: [dayjs(startExtendDate), dayjs(endExtendDate)]
            })
        }
    }, [currentTimeConfig, form]);

    const onFinish = async (value) => {
        const startBookingDate = value.booking[0].format('YYYY-MM-DD')
        const endBookingDate = value.booking[1].format('YYYY-MM-DD')
        const startExtendDate = value.extend[0].format('YYYY-MM-DD')
        const endExtendDate = value.extend[1].format('YYYY-MM-DD')
        const payload = {
            startBookingDate, endBookingDate, startExtendDate, endExtendDate,
        }
        await updateTimeConfig(payload)
        await getCurrentTimeConfig()
    }

    return <LayoutManager>
        <div className={"flex flex-col gap-3"}>
            <div className={"section"}>
                <div className={"font-medium text-lg"}>Quản lý thời gian đặt phòng</div>
            </div>
            <div className={"section"}>
                {currentTimeConfigError === "TIME_CONFIG_NOT_FOUND" && (
                    <>
                        <div className={"md:w-80 mb-3"}>
                            <Alert type={"error"} showIcon message={"Hiện tại chưa có dữ liệu, tạo bằng form bên dưới"} />
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
                            {currentTimeConfig && (
                                <>
                                    <span>Lần cuối cập nhật: {formatTime(currentTimeConfig.createTime)}</span>
                                </>
                            )}
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </div>
    </LayoutManager>
}