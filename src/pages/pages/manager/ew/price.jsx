import {LayoutManager} from "../../../../components/layout/LayoutManager.jsx";
import {useEffect} from "react";
import {formatPrice} from "../../../../util/formatPrice.js";
import {Alert, App, Button, Form, InputNumber} from "antd";
import PriceInput from "../../../../components/PriceInput.jsx";
import {createApiStore} from "../../../../util/createApiStore.js";
import {GoBack} from "../../../../components/GoBack.jsx";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axiosClient from "../../../../api/axiosClient/axiosClient.js";
import useErrorNotification from "../../../../hooks/useErrorNotification.js";
import {formatTime} from "../../../../util/formatTime.js";

const getCurrentPriceApi = createApiStore("GET", "/ew/price");
const updatePriceApi = createApiStore("POST", "/ew/price");

function ItemLabel({label, value, prefix}) {
    return <div className={"p-5 rounded-lg border border-gray-200 bg-white flex flex-col justify-center items-center"}>
        <div className={"font-medium text-lg flex gap-1"}>{value}{prefix}</div>
        <div className={"text-gray-500"}>{label}</div>
    </div>
}

function CurrentPrice() {
    const {data} = useQuery({
        queryKey: ["ew-price"],
        queryFn: () => axiosClient.get("/ew/price").then(res => res.data),
        retry: false
    })

    return <div className={"flex gap-3 *:flex-grow flex-wrap"}>
        <ItemLabel value={data?.electricPrice ? formatPrice(data?.electricPrice) : 0} label={"Giá điện hiện tại"}/>
        <ItemLabel value={data?.waterPrice ? formatPrice(data?.waterPrice) : 0} label={"Giá nước hiện tại"}/>
        <ItemLabel value={data?.maxElectricIndex ? data.maxElectricIndex : 0} label={"Số điện miễn phí"}
                   prefix={<span>kWG</span>}/>
        <ItemLabel value={data?.maxWaterIndex ? data.maxWaterIndex : 0} label={"Số nước miễn phí"}
                   prefix={<span>m<sup>3</sup></span>}/>
    </div>
}

function UpdatePriceForm() {
    const queryClient = useQueryClient();

    const {data: currentPrice, error: currentPriceError} = useQuery({
        queryKey: ["ew-price"],
        queryFn: () => axiosClient.get("/ew/price").then(res => res.data),
        retry: false,
    })

    console.log(currentPriceError)

    const {notification} = App.useApp();

    const {mutate, error, isLoading} = useMutation({
        mutationKey: ["update-ew-price"],
        mutationFn: (data) => axiosClient.post("/ew/price", data),
        onSuccess: () => {
            notification.success({message: "Cập nhập thành công!"});
            queryClient.invalidateQueries({
                queryKey: ["ew-price"],
            })
        },

    })

    const [form] = Form.useForm();

    useErrorNotification(error)

    useEffect(() => {
        form && form.setFieldsValue(currentPrice)
    }, [currentPrice, form]);

    const onFinish = (value) => {
        mutate(value);
    }

    const currentPriceErrorCode = currentPriceError?.response?.data?.message || currentPriceError?.message;

    return <div className={"flex-grow bg-white rounded-lg border border-gray-200 p-5"}>
        <div className={"font-medium mb-3"}>Cập nhật giá mới</div>
        {currentPriceErrorCode === "PRICE_NOT_FOUND" && (
            <>
                <div className={"mb-3"}>
                    <Alert showIcon type="error" message={"Chưa có dữ liệu"} />
                </div>
            </>
        )}
        <Form
            form={form}
            name="basic"
            labelCol={{span: 7}}
            className={"md:w-130"}
            disabled={isLoading}
            onFinish={onFinish}
        >
            <Form.Item
                label="Giá điện"
                name="electricPrice"
                rules={[{required: true, message: 'Bạn phải nhập nội dung'}]}
            >
                <PriceInput placeholder={"Nhập giá điện"}/>
            </Form.Item>
            <Form.Item
                label="Giá nước"
                name="waterPrice"
                rules={[{required: true, message: 'Bạn phải nhập nội dung'}]}
            >
                <PriceInput placeholder={"Nhập giá nước"}/>
            </Form.Item>
            <Form.Item
                label="Số điện miễn phí"
                name="maxElectricIndex"
                rules={[{required: true, message: 'Bạn phải nhập nội dung'}]}
            >
                <InputNumber suffix={"kW"} className={"!w-full"} placeholder={"Số điện miễn phí"}/>
            </Form.Item>
            <Form.Item
                label="Số nước miễn phí"
                name="maxWaterIndex"
                rules={[{required: true, message: 'Bạn phải nhập nội dung'}]}
            >
                <InputNumber suffix={<span>m<sup>3</sup></span>} className={"!w-full"}
                             placeholder={"Số nước miễn phí"}/>
            </Form.Item>
            <Form.Item label={null}>
                <Button loading={isLoading} type="primary" htmlType="submit">
                    Cập nhật
                </Button>
            </Form.Item>
            {currentPrice?.createTime && (
                <>
                    <Form.Item label={null}>
                        <span className={"ml-3"}>Lần cập nhật gần nhất: {formatTime(currentPrice.createTime)}</span>
                    </Form.Item>
                </>
            )}
        </Form>
    </div>
}

export default function ManageEWPrice() {
    return <LayoutManager>
        <div className={"flex flex-col gap-3"}>
            <div className={"section flex items-center gap-3"}>
                <GoBack url={"/pages/manager/ew"}/>
                <div className={"text-lg font-medium"}>Quản lý giá điện nước</div>
            </div>
            <CurrentPrice/>
            <UpdatePriceForm/>
        </div>
    </LayoutManager>
}