import {AppLayout} from "../../../components/layout/AppLayout.jsx";
import {Alert, Button, Card, Form, InputNumber, Tabs} from "antd";
import {useApi} from "../../../hooks/useApi.js";
import React, {useEffect, useState} from "react";
import SkeletonButton from "antd/es/skeleton/Button.js";

const {TabPane} = Tabs;

const mockDorm = "de451d96-cef9-415b-be2f-c9520694b480";

function RoomDisplay({data, setSelect}) {
    const onClick = () => {
        console.log(data);
        setSelect(data)
    }

    return <>
        <Button disabled={data.roomNumber !== "C105"} onClick={onClick}>{data.roomNumber}</Button>
    </>
}

function FloorDisplay({ floor, data, setSelect }) {
    return <Card title={"Tầng " + floor}>
        <div className={"flex flex-wrap gap-2"}>
            {data.map(room => <RoomDisplay key={room.id} data={room} setSelect={setSelect}/>)}
        </div>
    </Card>
}

function RoomList({data, select, setSelect}) {
    useEffect(() => {
        if (select) {
            setIsOpen(true);
        }
    }, [select])

    const floors = Object.groupBy(data, ({floor}) => floor);
    return <>
        <div className={"flex flex-col gap-2"}>
            {Object.entries(floors).map((floor, index) => <FloorDisplay setSelect={setSelect} key={index} floor={floor[0]} data={floor[1]} />)}
        </div>
    </>
}

function RoomSkeleton() {
    return <>
        <div className={"flex flex-col gap-2"}>
            <Card title={"    "}>
                <div className={"flex flex-wrap gap-2"}>
                    <SkeletonButton active />
                    <SkeletonButton active />
                    <SkeletonButton active />
                    <SkeletonButton active />
                    <SkeletonButton active />
                </div>
            </Card>
            <Card title={"    "}>
                <div className={"flex flex-wrap gap-2"}>
                    <SkeletonButton active />
                    <SkeletonButton active />
                    <SkeletonButton active />
                    <SkeletonButton active />
                    <SkeletonButton active />
                </div>
            </Card>
            <Card title={"    "}>
                <div className={"flex flex-wrap gap-2"}>
                    <SkeletonButton active />
                    <SkeletonButton active />
                    <SkeletonButton active />
                    <SkeletonButton active />
                    <SkeletonButton active />
                </div>
            </Card>
        </div>
    </>
}

function CreateBillForm({ data, setSelect }) {
    const [form] = Form.useForm();

    return <>
        <Card title={`Phòng ${data.roomNumber}`}>
            <Tabs type={"card"} defaultActiveKey={"FA25"}>
                <TabPane tab={"SU25"} key={"SU25"} />
                <TabPane tab={"FA25"} key={"FA25"}>
                    <Form
                        form={form}
                        name="unit-price-form"
                        initialValues={{
                            kw_value: 0,
                            m3_value: 0,
                            price: 0.00,
                        }}
                    >
                        <Form.Item
                            layout="vertical"
                            name="kw"
                            label="Số điện (kW)"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input the energy value!',
                                },
                            ]}
                        >
                            <InputNumber
                                addonAfter="kW"
                            />
                        </Form.Item>
                        <Form.Item
                            layout="vertical"
                            name="m3"
                            label="Khối (m3)"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input the volume value!',
                                },
                            ]}
                        >
                            <InputNumber
                                addonAfter={<span>m&sup3;</span>}
                            />
                        </Form.Item>
                        <Form.Item
                            layout="vertical"
                            name="price"
                            label="Giá"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input the price!',
                                },
                            ]}
                        >
                            <InputNumber
                                addonAfter="VND" // Add the currency symbol as a prefix
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} // Format as currency
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')} // Parse back to number
                            />
                        </Form.Item>
                        <Form.Item>
                            <div className={"flex gap-2"}>
                                <Button type={"primary"} onClick={() => setSelect(null)}>Cập nhật</Button>
                                <Button onClick={() => setSelect(null)}>Hủy</Button>
                            </div>
                        </Form.Item>
                    </Form>
                </TabPane>
            </Tabs>
        </Card>
    </>
}

export function GuardElectricWaterPage() {
    const {get, data, error, isError, isComplete} = useApi();

    const [select, setSelect] = useState(null);

    useEffect(() => {
        get(`/dorms/${mockDorm}/rooms`);
    }, [get]);

    const content = !select ? <>
        {isError && <Alert showIcon className={"!mb-3 !w-75"} type={"error"} message={error} />}
        {data && <RoomList select={select} setSelect={setSelect} data={data} />}
        {!data && <RoomSkeleton />}
    </> : <>
        <CreateBillForm setSelect={setSelect} data={select} />
    </>

    return <>
        <AppLayout>
            <Card className={"h-full overflow-auto"} title={"Hóa đơn điện nước Dorm C"}>
                {content}
            </Card>
        </AppLayout>
    </>
}