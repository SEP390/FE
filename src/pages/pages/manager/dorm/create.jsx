import {AppLayout} from "../../../../components/layout/AppLayout.jsx";
import {Button, Card, Form, Input, InputNumber, Modal} from "antd";
import React, {useState} from "react";
import {ChevronLeft, Plus, Trash} from "lucide-react";
import {useNavigate} from "react-router-dom";

function AddRoomModal({open, setOpen, floor, addRoom}) {
    const onCreate = (value) => {
        console.log("submit");
        addRoom(value);
        setOpen(false)
    }
    const [form] = Form.useForm();

    console.log(floor)

    return <>
        <Modal open={open}
               title={"Thêm phòng"}
               onCancel={() => setOpen(false)}
               onOk={() => setOpen(false)}
               footer={null}>
            <Form layout={"vertical"}
                  form={form}
                  onFinish={onCreate}
                  initialValues={{floor, totalSlot: 1}}>
                <Form.Item
                    name={"floor"}
                    label="Tầng"
                    required
                    initialValue={floor}
                    tooltip="This is a required field">
                    <InputNumber value={floor} disabled/>
                </Form.Item>
                <Form.Item
                    name={"roomNumber"}
                    label="Tên phòng"
                    required tooltip="This is a required field"
                    rules={[{ required: true, message: 'Nhập tên phòng' }]}>
                    <Input/>
                </Form.Item>
                <Form.Item
                    name={"totalSlot"}
                    label="Số slot"
                    required
                    tooltip="This is a required field"
                    rules={[{ required: true, message: 'Nhập tên phòng' }]}>
                    <InputNumber min={1} max={10}/>
                </Form.Item>
                <Form.Item>
                    <Button htmlType={"submit"}>Lưu</Button>
                </Form.Item>
            </Form>
        </Modal>
    </>
}

export default function CreateDorm() {
    const navigate = useNavigate();
    const [open, setOpen] = useState()
    const back = () => navigate("/pages/manager/dorm");

    const [totalFloor, setTotalFloor] = useState(1)
    const [dormName, setDormName] = useState("")
    const [dormNameError, setDormNameError] = useState(false);
    const [floor, setFloor] = useState(1)

    const [rooms, setRooms] = useState([])

    const addRoom = (room) => {
        console.log("addRoom")
        setRooms(rooms => [...rooms, room])
    }

    const trash = () => setTotalFloor(f => f > 1 ? f - 1 : f);

    const onDormName = (value) => {
        setDormName(value);
        setDormNameError(null);
    };

    const save = () => {
        if (dormName === "") {
            setDormNameError(true)
        }
    }

    const roomGroup = Object.groupBy(rooms, r => r.floor);
    console.log("roomGroup", roomGroup);

    return <AppLayout>
        <AddRoomModal open={open} setOpen={setOpen} floor={floor} addRoom={addRoom}/>
        <Card title={<span className={"flex items-center gap-3"}><Button onClick={back}
                                                                         type={"text"}><ChevronLeft/></Button> Tạo Dorm</span>}
              className={"h-full overflow-auto"}>
            <div className={"flex mb-3 gap-3"}>
                <Input onChange={onDormName} status={dormNameError ? "error" : ""} rootClassName={"!w-40"}
                       placeholder={"Tên Dorm"}/>
                <Button onClick={() => setTotalFloor(f => f + 1)} type={"dashed"}><Plus size={14}/>Thêm tầng</Button>
                <Button onClick={save} color={"primary"} variant={"solid"}>Lưu</Button>
            </div>
            <div className={"flex flex-col gap-3"}>
                {[...Array(totalFloor).keys().map(f => f + 1)].map(f => <>
                    <Card title={<div className={"flex items-center"}>
                        <span>Tầng {f}</span>
                        <div className={"ml-auto"}>{f === totalFloor && f > 1 &&
                            <Button onClick={() => trash()} color={"danger"} variant={"outlined"} size={"small"}><Trash
                                size={14}/></Button>}</div>
                    </div>}>
                        <div className={"flex items-center gap-2"}>
                            {roomGroup && roomGroup[f] && roomGroup[f].map(r => <Button>{r.roomNumber}</Button>)}
                            <Button size={"small"} onClick={() => {
                                setFloor(f)
                                setOpen(true)
                            }} type={"dashed"}><Plus size={14}/></Button>
                        </div>
                    </Card>
                </>)}
            </div>
        </Card>
    </AppLayout>
}