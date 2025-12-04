import React, {createContext, useContext, useEffect} from 'react';
import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import {PageHeader} from "../../../components/PageHeader.jsx";
import {SemesterFilter} from "../../../components/SemesterSelect.jsx";
import {App, Button, Form, Input, Popconfirm, Table, Tag} from "antd";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import axiosClient from "../../../api/axiosClient/axiosClient.js";
import {create} from "zustand";
import {formatDate} from "../../../util/formatTime.js";
import {DateRangeSelect} from "../../../components/DateRangeSelect.jsx";
import {CloseOutlined} from "@ant-design/icons";
import {Pen, Plus, Save, Trash} from "lucide-react";
import dayjs from "dayjs";
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";

const FormContext = createContext(null);

const useEditableStore = create((set, get) => ({
    page: 0,
    search: null,
    setSearch: (search) => set({search}),
    onChange: ({current}) => set({page: current - 1, editable: []}),
    editable: [],
    edit: (id) => set((state) => ({...state, editable: [...state.editable, id]})),
    isEditable: (id) => get().editable.indexOf(id) !== -1,
    cancel: (id) => set(state => ({...state, editable: state.editable.filter(item => item !== id)})),
    cancelAll: () => set({editable: []}),
    add: () => set(state => ({...state, editable: [...state.editable, `new_${new Date().getTime()}`]}))
}))

function DeleteButton({id}) {
    const queryClient = useQueryClient();
    const {notification} = App.useApp()
    const {mutate} = useMutation({
        mutationFn: ({ id }) => axiosClient.delete(`/semesters/${id}`).then(res => res.data),
        onSuccess: (data) => {
            console.log(data)
            notification.success({ message: `Xóa thành công`})
            queryClient.invalidateQueries({
                queryKey: ["semesters"]
            })
        },
        onError: (err) => {
            notification.error({message: "Không thể xóa, kỳ đang trong sử dụng"})
        }
    })
    return <Popconfirm title="Xác nhận xóa?" onConfirm={() => mutate({id})}>
        <Button icon={<Trash size={14}/>}></Button>
    </Popconfirm>
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
    const {mutate: updateSemester} = useMutation({
        mutationFn: ({ id, value }) => axiosClient.post(`/semesters/${id}`, value).then(res => res.data),
        onSuccess: (data) => {
            cancel(id)
            console.log(data)
            notification.success({ message: `Cập nhật thành công`})
            queryClient.invalidateQueries({
                queryKey: ["semesters"]
            })
        },
        onError: (err) => {
            notification.error({message: err?.response?.data?.message})
        }
    })
    const {mutate: createSemester} = useMutation({
        mutationFn: ({ value }) => axiosClient.post("/semesters", value).then(res => res.data),
        onSuccess: (data) => {
            cancel(id)
            console.log(data)
            notification.success({ message: `Tạo kỳ thành công`})
            queryClient.invalidateQueries({
                queryKey: ["semesters"]
            })
        },
        onError: (err) => {
            notification.error({message: err?.response?.data?.message})
        }
    })
    const onFinish = (val) => {
        const value = {
            name: val.name,
            startDate: val.range && val.range[0].format("YYYY-MM-DD"),
            endDate: val.range && val.range[1].format("YYYY-MM-DD"),
        }
        if (id.startsWith("new_")) {
            createSemester({ value })
        } else {
            updateSemester({ id, value })
        }
    }
    useEffect(() => {
        if (record && form && id && !id.startsWith("new_") && editable.indexOf(id) !== -1) {
            form.setFieldsValue({
                name: record.name,
                range: [
                    dayjs(record.startDate),
                    dayjs(record.endDate)
                ]
            })
        }
    }, [editable, form, id, record]);
    return <Form form={form} onFinish={onFinish} component={false}>
        <FormContext.Provider value={form}>
            <tr {...props}/>
        </FormContext.Provider>
    </Form>
}

function SubmitButton() {
    const form = useContext(FormContext);
    return <Button icon={<Save size={14}/>} onClick={() => form.submit()}></Button>
}

const SemesterPage = () => {
    const {search, setSearch, page, onChange, edit, cancel, isEditable, add, editable} = useEditableStore()
    const {data} = useQuery({
        queryKey: ["semesters", page, search],
        queryFn: () => axiosClient.get("/semesters", {
            params: {
                page, size: 5, sort: "startDate,DESC", id: search
            },
        }).then(res => res.data)
    })

    const dataSource = editable.filter(item => item.startsWith("new_")).map(item => ({ id: item })).concat(data ? data.content : [])
    return (
        <RequireRole role={"MANAGER"}><LayoutManager>
            <div className={"flex gap-3 flex-col"}>
                <PageHeader title={"Quản lý kỳ"}/>
                <div className={"section flex justify-between items-end"}>
                    <div>
                        <div className={"font-medium text-lg mb-3"}>Bộ lọc</div>
                        <div className={"flex gap-3 flex-wrap"}>
                            <SemesterFilter onChange={setSearch}/>
                        </div>
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
                                   title: "Kỳ",
                                   dataIndex: "name",
                                   render: (val, row) => {
                                       if (isEditable(row.id)) return <Form.Item rules={[
                                           { required: true, message: "Nhập tên kỳ"}
                                       ]} name={"name"} className={"!m-0"}>
                                           <Input className={"!w-20"}/>
                                       </Form.Item>
                                       return <Tag>{val}</Tag>
                                   }
                               },
                               {
                                   title: "Khoảng thời gian",
                                   render: (val, row) => {
                                       if (isEditable(row.id)) return <Form.Item rules={[
                                           {required: true, message: "Nhập khoảng thời gian"}
                                       ]} name={"range"}
                                                                                 className={"!m-0"}><DateRangeSelect
                                           format={"DD/MM/YYYY"}/>
                                       </Form.Item>
                                       return `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`;
                                   }
                               },
                               {
                                   title: "Hành động",
                                   render: (val, row) => (
                                       <>
                                           <div className={"flex gap-2"}>
                                               {!isEditable(row.id) && <EditButton id={row.id}/>}
                                               {!isEditable(row.id) && <DeleteButton id={row.id}/>}
                                               {isEditable(row.id) && <SubmitButton />}
                                               {isEditable(row.id) && <CancelButton id={row.id}/>}
                                           </div>
                                       </>
                                   )
                               }
                           ]} pagination={{
                        showTotal: (total) => <span>Tổng cộng <span className={"font-medium"}>{total}</span> bản ghi</span>,
                        current: page + 1,
                        pageSize: 5,
                        total: data?.page?.totalElements,
                    }} onChange={onChange}/>
                </div>
            </div>
        </LayoutManager></RequireRole>
    );
};

export default SemesterPage;