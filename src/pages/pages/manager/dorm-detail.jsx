import {AppLayout} from "../../../components/layout/AppLayout.jsx";
import {Button, Card, Form, Input, InputNumber, Modal} from "antd";
import {ChevronLeft, Plus} from "lucide-react";
import {useNavigate, useSearchParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useApi} from "../../../hooks/useApi.js";

function RoomButton({data, setSelect}) {
    const onClick = () => {
        console.log(data);
        setSelect(data)
    }
    return <>
        <Button onClick={onClick}>{data.roomNumber}</Button>
    </>
}

function FloorCard({floor, data, setSelect}) {
    const [show, setShow] = useState(false);
    const showAddFloor = () => {
        setShow(true);
    }
    const hideAddFloor = () => {
        setShow(false);
    }
    return <Card className={"relative"} title={"Tầng " + floor} onMouseLeave={hideAddFloor} onMouseEnter={showAddFloor}>
        <div className={"flex flex-wrap items-center gap-2"}>
            {data.map(room => <RoomButton key={room.id} data={room} setSelect={setSelect}/>)}
            <Button size={"small"} type={"dashed"}><Plus size={14}/></Button>
        </div>
    </Card>
}

function AddRoomModal({isOpen, setIsOpen}) {
    const onCreate = () => {
        setIsOpen(false)
    }
    const [form] = Form.useForm();

    return <>
        <Modal open={isOpen}
               title={"Thêm phòng"}
               onCancel={() => setIsOpen(false)}
               onOk={() => setIsOpen(false)}
               footer={null}>
            <Form layout={"vertical"}
                  form={form}>
                <Form.Item label="Tên phòng" required tooltip="This is a required field">
                    <Input />
                </Form.Item>
                <Form.Item label="Tầng" required tooltip="This is a required field">
                    <InputNumber defaultValue={"1"} />
                </Form.Item>
                <Form.Item label="Số slot" required tooltip="This is a required field">
                    <InputNumber defaultValue={"2"} min={1} max={10} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary">Submit</Button>
                </Form.Item>
            </Form>
        </Modal>
    </>
}

export default function DormDetail() {
    const navigate = useNavigate()
    const {get, data, error} = useApi();
    const [open, setOpen] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();

    const id = searchParams.get("id");

    const back = () => {
        navigate("/pages/manager/dorm");
    }

    useEffect(() => {
        get(`/dorms/${id}`)
    }, [get, id]);

    const floors = data ? Object.groupBy(data.rooms, ({floor}) => floor) : [];

    return <AppLayout>
        <AddRoomModal isOpen={open} setIsOpen={setOpen}/>
        <Card title={<span className={"flex items-center gap-3"}><Button onClick={back}
                                                                         type={"text"}><ChevronLeft/></Button> Chi tiết {data?.dormName}</span>}
              className={"h-full overflow-auto"}>
            <div className={"mb-3"}><Button onClick={() => setOpen(true)}><Plus size={14}/>Thêm phòng</Button></div>
            <div className={"flex flex-col gap-2"}>
                {Object.entries(floors).map((floor, index) =>
                    <FloorCard key={index} floor={floor[0]} data={floor[1]}/>)}

            </div>
        </Card>
    </AppLayout>
}