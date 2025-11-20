import {LayoutManager} from "../../../../components/layout/LayoutManager.jsx";
import {useApi} from "../../../../hooks/useApi.js";
import {useCallback, useEffect} from "react";
import useErrorNotification from "../../../../hooks/useErrorNotification.js";
import {formatPrice} from "../../../../util/formatPrice.js";
import {Button, Form, InputNumber} from "antd";
import useSuccessNotification from "../../../../hooks/useSuccessNotification.js";
import {create} from 'zustand'

const useUpdateStore = create((set, get) => ({
    refresh: 0,
    forceUpdate: () => set({
        refresh: get().refresh + 1,
    })
}))

function ItemLabel({label, value}) {
    return <div className={"p-5 rounded-lg border border-gray-200 bg-white flex flex-col justify-center items-center"}>
        <div className={"font-medium text-lg"}>{value}</div>
        <div className={"text-gray-500"}>{label}</div>
    </div>
}

function CurrentPrice() {
    const {refresh} = useUpdateStore();
    const {get, data, error} = useApi();

    const fetchCurrentPrice = useCallback(() => {
        get("/ew/price");
    }, [get])

    useErrorNotification(error)

    useEffect(() => {
        fetchCurrentPrice()
    }, [fetchCurrentPrice, refresh]);

    return <div className={"flex gap-3 *:flex-grow"}>
        <ItemLabel value={formatPrice(data?.electricPrice)} label={"Giá điện hiện tại"}/>
        <ItemLabel value={formatPrice(data?.waterPrice)} label={"Giá nước hiện tại"}/>
        <ItemLabel value={data?.maxElectricIndex + " kW"} label={"Số điện vượt quá"}/>
        <ItemLabel value={data?.maxWaterIndex + " m3"} label={"Số nước vượt quá"}/>
    </div>
}

function UpdatePriceForm() {
    const {forceUpdate} = useUpdateStore();
    const [form] = Form.useForm();

    const {post, data, error} = useApi();

    useErrorNotification(error)
    useSuccessNotification({data, message: "Cập nhật thành công"})

    const onFinish = (value) => {
        post("/ew/price", value);
    }

    useEffect(() => {
        if (data) {
            forceUpdate()
        }
    }, [data, forceUpdate]);

    return <div className={"flex-grow bg-white rounded-lg border border-gray-200 p-5"}>
        <div className={"font-medium mb-3"}>Cập nhật giá mới</div>
        <Form
            form={form}
            name="basic"
            labelCol={{span: 8}}
            className={"w-130"}
            onFinish={onFinish}
        >
            <Form.Item
                label="Giá điện"
                name="electricPrice"
                rules={[{required: true, message: 'Bạn phải nhập nội dung'}]}
            >
                <InputNumber className={"!w-full"} placeholder={"Giá điện"}/>
            </Form.Item>
            <Form.Item
                label="Giá nước"
                name="waterPrice"
                rules={[{required: true, message: 'Bạn phải nhập nội dung'}]}
            >
                <InputNumber className={"!w-full"} placeholder={"Giá nước"}/>
            </Form.Item>
            <Form.Item
                label="Số điện miễn phí"
                name="maxElectricIndex"
                rules={[{required: true, message: 'Bạn phải nhập nội dung'}]}
            >
                <InputNumber className={"!w-full"} placeholder={"Số điện miễn phí"}/>
            </Form.Item>
            <Form.Item
                label="Số nước miễn phí"
                name="maxWaterIndex"
                rules={[{required: true, message: 'Bạn phải nhập nội dung'}]}
            >
                <InputNumber className={"!w-full"} placeholder={"Số nước miễn phí"}/>
            </Form.Item>
            <Form.Item label={null}>
                <Button type="primary" htmlType="submit">
                    Tạo
                </Button>
            </Form.Item>
        </Form>
    </div>
}

export default function ManageEWPrice() {
    return <LayoutManager>
        <div className={"flex flex-col gap-5"}>
            <CurrentPrice/>
            <UpdatePriceForm/>
        </div>
    </LayoutManager>
}