import {RequireRole} from "../../../components/authorize/RequireRole.jsx";
import {PageHeader} from "../../../components/PageHeader.jsx";
import {App, Button, Form, InputNumber, Table} from "antd";
import {Bed, Pen, Plus, Save} from "lucide-react";
import React, {createContext, useContext, useEffect} from "react";
import {create} from "zustand";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import {formatDate} from "../../../util/formatTime.js";
import PriceInput from "../../../components/PriceInput.jsx";
import {CloseOutlined} from "@ant-design/icons";
import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {formatPrice} from "../../../util/formatPrice.js";

const FormContext = createContext(null);

const useEditableStore = create((set, get) => ({
    page: 0,
    onChange: ({current}) => set({page: current - 1, editable: []}),
    editable: [],
    edit: (id) => set((state) => ({...state, editable: [...state.editable, id]})),
    isEditable: (id) => get().editable.indexOf(id) !== -1,
    cancel: (id) => set(state => ({...state, editable: state.editable.filter(item => item !== id)})),
    cancelAll: () => set({editable: []}),
    add: () => set(state => ({...state, editable: [...state.editable, `new_${new Date().getTime()}`]}))
}))


function SubmitButton() {
    const form = useContext(FormContext);
    return <Button icon={<Save size={14}/>} onClick={() => form.submit()}></Button>
}

function CancelButton({id}) {
    const cancel = useEditableStore(state => state.cancel)
    return <Button onClick={() => cancel(id)} type={"default"} variant={"outlined"} icon={<CloseOutlined/>}></Button>
}

function EditButton({id}) {
    const edit = useEditableStore(state => state.edit)
    return <Button onClick={() => edit(id)} type={"default"} variant={"outlined"} icon={<Pen size={16}/>}></Button>
}


function FormRow({record, ...props}) {
    const {editable, cancel} = useEditableStore()
    const id = props["data-row-key"];
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const {notification} = App.useApp()
    const {mutate: updatePricing} = useMutation({
        mutationFn: ({id, value}) => axiosClient.post(`/pricing/${id}`, value).then(res => res.data),
        onSuccess: (data) => {
            cancel(id)
            console.log(data)
            notification.success({message: `Cập nhật giá phòng thành công`})
            queryClient.invalidateQueries({
                queryKey: ["room-pricing"]
            })
        },
        onError: (err) => {
            notification.error({message: err?.response?.data?.message})
        }
    })
    const {mutate: createPricing} = useMutation({
        mutationFn: ({value}) => axiosClient.post("/pricing", value).then(res => res.data),
        onSuccess: (data) => {
            cancel(id)
            console.log(data)
            notification.success({message: `Tạo giá phòng thành công`})
            queryClient.invalidateQueries({
                queryKey: ["room-pricing"]
            })
        },
        onError: (err) => {
            notification.error({message: err?.response?.data?.message})
        }
    })
    const onFinish = (value) => {
        if (id.startsWith("new_")) {
            createPricing({value})
        } else {
            updatePricing({id, value})
        }
    }
    useEffect(() => {
        if (record && form && id && !id.startsWith("new_") && editable.indexOf(id) !== -1) {
            form.setFieldsValue({...record})
        }
    }, [editable, form, id, record]);
    return <Form form={form} onFinish={onFinish} component={false}>
        <FormContext.Provider value={form}>
            <tr {...props}/>
        </FormContext.Provider>
    </Form>
}

export default function RoomPricingManage() {
    const {add, page, editable, isEditable, onChange} = useEditableStore()

    const {data} = useQuery({
        queryKey: ["room-pricing"],
        queryFn: () => axiosClient.get("/pricing").then(res => res.data)
    })

    console.log(editable)
    const dataSource = editable.filter(item => item.startsWith("new_")).map(item => ({id: item})).concat(data ? data : [])
    console.log(dataSource)

    return <RequireRole role={"MANAGER"}>
        <LayoutManager>
            <div className={'flex flex-col gap-3'}>
                <PageHeader title={"Quản lý giá phòng"}/>

                <div className={"section flex justify-between items-end"}>
                    <div>
                        <div className={"font-medium text-lg mb-3"}>Bộ lọc</div>
                    </div>
                    <div>
                        <Button onClick={() => add()} icon={<Plus size={14}/>}>Thêm</Button>
                    </div>
                </div>
                <div className={"section"}>
                    <Table onRow={record => ({record})} rowKey={"id"} components={{body: {row: FormRow}}} bordered
                           dataSource={dataSource}
                           columns={[
                               {
                                   title: "Số giường",
                                   dataIndex: "totalSlot",
                                   render: (val, row) => {
                                       if (isEditable(row.id)) return <Form.Item rules={[
                                           {required: true, message: "Nhập số giường"}
                                       ]} name={"totalSlot"} className={"!m-0"}>
                                           <InputNumber suffix={<Bed size={14} />} className={"!w-30"}/>
                                       </Form.Item>
                                       return <span
                                           className={"flex items-center gap-1"}><span>{val}</span><Bed size={14}/></span>
                                   }
                               },
                               {
                                   title: "Giá",
                                   dataIndex: "price",
                                   render: (val, row) => {
                                       if (isEditable(row.id)) return <Form.Item rules={[
                                           {required: true, message: "Nhập giá"}
                                       ]} name={"price"} className={"!m-0"}>
                                           <PriceInput className={"!w-40"}/>
                                       </Form.Item>
                                       return <span>{formatPrice(val)}</span>;
                                   }
                               },
                               {
                                   title: "Hành động",
                                   render: (val, row) => (
                                       <>
                                           <div className={"flex gap-2"}>
                                               {!isEditable(row.id) && <EditButton id={row.id}/>}
                                               {isEditable(row.id) && <SubmitButton/>}
                                               {isEditable(row.id) && <CancelButton id={row.id}/>}
                                           </div>
                                       </>
                                   )
                               }
                           ]} onChange={onChange}/>
                </div>
            </div>
        </LayoutManager>
    </RequireRole>
}