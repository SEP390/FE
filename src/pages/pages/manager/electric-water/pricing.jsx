import {Button, Card, Form, InputNumber, Table} from "antd";
import {useEffect} from "react";
import {LayoutManager} from "../../../../components/layout/LayoutManager.jsx";
import {formatPrice} from "../../../../util/formatPrice.js";
import {create} from "zustand";
import axiosClient from "../../../../api/axiosClient/axiosClient.js";
import {formatTime} from "../../../../util/formatTime.js";

function PriceLabel({title, price}) {
    return <div className={"flex-grow rounded-lg border border-gray-200 p-3 flex flex-col items-center"}>
        <div className={"text-gray-500"}>{title}</div>
        <div className={"text-xl font-medium"}>{price}</div>
    </div>
}

const useEWStore = create((set) => ({
    history: [],
    current: {
        electricPrice: null,
        waterPrice: null,
    },
    formValues: {
        electricPrice: null,
        waterPrice: null,
    },
    setCurrent: (current) => set({current}),
    setFormValues: (formValues) => set({formValues}),
    fetchCurrent: async () => {
        const res = await axiosClient("/electric-water-pricing/current")
        set({current: res.data});
        set({formValues: res.data});
    },
    fetchHistory: async () => {
        const res = await axiosClient("/electric-water-pricing")
        set({history: res.data});
    },
    createPricing: async (values) => {
        const res = await axiosClient({
            method: "POST",
            url: "/electric-water-pricing",
            data: values
        })
        set({current: res.data});
        set({formValues: res.data});
    }
}))

function EWHistory() {
    const {history, fetchHistory} = useEWStore();

    useEffect(() => {
        fetchHistory().then(() => {
        });
    }, [fetchHistory]);

    return <Table bordered dataSource={history.sort((a,b) => b.startDate.localeCompare(a.startDate))} columns={[
        {
            title: "Ngày bắt đầu",
            dataIndex: "startDate",
            render: (text, record) => formatTime(text)
        },
        {
            title: "Giá điện",
            dataIndex: "electricPrice",
            render: (text, record) => formatPrice(text)
        },
        {
            title: "Giá nước",
            dataIndex: "waterPrice",
            render: (text, record) => formatPrice(text)
        },
    ]} pagination={{
        pageSize: 5
    }}/>
}

export default function ManageElectricWaterPricing() {
    const {current, fetchCurrent, formValues, createPricing, fetchHistory} = useEWStore();
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(formValues);
    }, [form, formValues]);

    useEffect(() => {
        fetchCurrent().then(() => {
        })
    }, [fetchCurrent])

    const onFinish = async (values) => {
        await createPricing(values)
        await fetchHistory(values)
    }

    return <>
        <LayoutManager active={"electric-water-pricing"}>
            <Card title={"Quản lý giá điện nước"} className={"h-full overflow-auto"}>
                <div className={"grid grid-cols-2 gap-5"}>
                    <div>
                        <div className={"flex gap-3 mb-5"}>
                            <PriceLabel title={"Giá điện"} price={formatPrice(current.electricPrice)}/>
                            <PriceLabel title={"Giá nước"} price={formatPrice(current.waterPrice)}/>
                        </div>
                        <div>
                            <div className={"font-medium mb-3"}>Cập nhật giá mới</div>
                            <Form onFinish={onFinish} form={form} layout={"vertical"}>
                                <Form.Item name={"electricPrice"} label={"Số tiền / 1 kW điện"}>
                                    <InputNumber addonAfter={"VNĐ"}/>
                                </Form.Item>
                                <Form.Item name={"waterPrice"} label={"Số tiền / 1 m3 nước"}>
                                    <InputNumber addonAfter={"VNĐ"}/>
                                </Form.Item>
                                <Button htmlType={"submit"} type={"primary"}>Cập nhật</Button>
                            </Form>
                        </div>
                    </div>
                    <div>
                        <div className={"font-medium mb-3"}>Lịch sử cập nhật</div>
                        <EWHistory/>
                    </div>
                </div>
            </Card>
        </LayoutManager>
    </>
}