import {LayoutManager} from "../../../../components/layout/LayoutManager.jsx";
import {useEffect} from "react";
import {formatPrice} from "../../../../util/formatPrice.js";
import {Button, Form, InputNumber} from "antd";
import PriceInput from "../../../../components/PriceInput.jsx";
import {createApiStore} from "../../../../util/createApiStore.js";
import {useViewEffect} from "../../../../hooks/useViewEffect.js";
import {useUpdateEffect} from "../../../../hooks/useUpdateEffect.js";
import {ChevronLeft} from "lucide-react";
import {GoBack} from "../../../../components/GoBack.jsx";

const getCurrentPriceApi = createApiStore("GET", "/ew/price");
const updatePriceApi = createApiStore("POST", "/ew/price");

function ItemLabel({label, value, prefix}) {
    return <div className={"p-5 rounded-lg border border-gray-200 bg-white flex flex-col justify-center items-center"}>
        <div className={"font-medium text-lg flex gap-1"}>{value}{prefix}</div>
        <div className={"text-gray-500"}>{label}</div>
    </div>
}

function CurrentPrice() {
    const data = getCurrentPriceApi(state => state.data);

    useViewEffect(getCurrentPriceApi)

    return <div className={"flex gap-3 *:flex-grow flex-wrap"}>
        <ItemLabel value={formatPrice(data?.electricPrice)} label={"Giá điện hiện tại"}/>
        <ItemLabel value={formatPrice(data?.waterPrice)} label={"Giá nước hiện tại"}/>
        <ItemLabel value={data?.maxElectricIndex} label={"Số điện miễn phí"} prefix={<span>kWG</span>}/>
        <ItemLabel value={data?.maxWaterIndex} label={"Số nước miễn phí"} prefix={<span>m<sup>3</sup></span>}/>
    </div>
}

function UpdatePriceForm() {
    const currentPrice = getCurrentPriceApi(state => state.data);
    const fetchCurrentPrice = getCurrentPriceApi(state => state.fetch);
    const updatePrice = updatePriceApi(state => state.mutate);
    const isLoading = updatePriceApi(state => state.isLoading);

    const [form] = Form.useForm();

    useUpdateEffect(updatePriceApi, "Cập nhật thành công", {
        "MAX_ELECTRIC_INDEX_MIN": "Số điện nước miễn phí phải > 0",
        "MAX_WATER_INDEX_MIN": "Số điện nước miễn phí phải > 0",
    })

    useEffect(() => {
        form && form.setFieldsValue(currentPrice)
    }, [currentPrice, form]);

    const onFinish = (value) => {
        updatePrice(value).then(fetchCurrentPrice)
    }

    return <div className={"flex-grow bg-white rounded-lg border border-gray-200 p-5"}>
        <div className={"font-medium mb-3"}>Cập nhật giá mới</div>
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
                <InputNumber suffix={<span>m<sup>3</sup></span>} className={"!w-full"} placeholder={"Số nước miễn phí"}/>
            </Form.Item>
            <Form.Item label={null}>
                <Button loading={isLoading} type="primary" htmlType="submit">
                    Cập nhật
                </Button>
            </Form.Item>
        </Form>
    </div>
}

export default function ManageEWPrice() {
    return <LayoutManager>
        <div className={"flex flex-col gap-3"}>
            <div className={"section flex items-center gap-3"}>
                <GoBack url={"/pages/manager/ew"} /><div className={"text-lg font-medium"}>Quản lý giá điện nước</div>
            </div>
            <CurrentPrice/>
            <UpdatePriceForm/>
        </div>
    </LayoutManager>
}