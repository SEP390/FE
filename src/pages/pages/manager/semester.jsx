import React, {useEffect, useState} from 'react';
import {create} from 'zustand';
import {App, Button, Card, DatePicker, Form, Input, Popconfirm, Space, Table,} from 'antd';
import {CalendarDays, Pencil, Plus, Save, Trash, XCircle,} from 'lucide-react';
import dayjs from 'dayjs';
import {LayoutManager} from "../../../components/layout/LayoutManager.jsx";
import axiosClient from "../../../api/axiosClient/axiosClient.js";

const errors = {
    "SEMESTER_NAME_EXISTED": "Kỳ đã tồn tại"
}

function getErrorMessage(err) {
    if (err.response.data?.message != null) {
        const key = err.response.data.message;
        return errors[key] || key;
    }
    return err.message;
}

async function fetchData(set, method, url, data) {
    console.log(method, url, data)
    set({loading: true});
    try {
        const res = await axiosClient({method, url, data})
        if (res.status === 200) {
            console.log(res.data)
            return res.data;
        }
    } catch (error) {
        console.log(error)
        set({error: getErrorMessage(error)})
    } finally {
        set({loading: false});
    }
}

const useSemesterStore = create((set) => ({
    semesters: [],
    loading: false,
    error: null,
    fetchSemesters: async () => {
        const data = await fetchData(set, "GET", "/semesters", null)
        set({semesters: data.content || []})
    },
    createSemester: (semester) => fetchData(set, "POST", "/semesters", semester),
    updateSemester: (id, data) => fetchData(set, "POST", `/semesters/${id}`, data),
    deleteSemester: (id) => fetchData(set, "DELETE", `/semesters/${id}`, null),
}));

const EditableCell = ({
                          editing,
                          dataIndex,
                          title,
                          inputType,
                          record,
                          index,
                          children,
                          ...restProps
                      }) => {
    const getInput = () => {
        if (inputType === 'date') {
            return (
                <DatePicker
                    className="w-full"
                    format="YYYY-MM-DD"
                    suffixIcon={<CalendarDays size={16} className="text-gray-400"/>}
                />
            );
        }
        return <Input/>;
    };

    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{margin: 0}}
                    rules={[
                        {
                            required: true,
                            message: `${title} không được trống!`,
                        },
                    ]}
                >
                    {getInput()}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

const SemesterPage = () => {
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const {
        semesters,
        loading,
        fetchSemesters,
        createSemester,
        updateSemester,
        error,
        deleteSemester
    } = useSemesterStore();

    const {notification} = App.useApp();

    useEffect(() => {
        fetchSemesters();
    }, [fetchSemesters]);

    useEffect(() => {
        if (error) notification.error({message: "Có lỗi xảy ra", description: error});
    }, [error, notification]);

    const isEditing = (record) => record.id === editingKey;

    const edit = (record) => {
        // Convert ISO strings to dayjs objects for the DatePicker
        form.setFieldsValue({
            ...record,
            startDate: record.startDate ? dayjs(record.startDate) : null,
            endDate: record.endDate ? dayjs(record.endDate) : null,
        });
        setEditingKey(record.id);
    };

    const cancel = () => {
        // If we were adding a new row, remove it from the table on cancel
        if (editingKey.startsWith('new_')) {
            useSemesterStore.setState((state) => ({
                semesters: state.semesters.filter((s) => s.id !== editingKey),
            }));
        }
        setEditingKey('');
    };

    const deleteRow = async (id) => {
        await deleteSemester(id)
        await fetchSemesters()
    }

    const save = async (id) => {
        try {
            const row = await form.validateFields();
            console.log(row)
            const data = {
                name: row.name,
                startDate: row.startDate.format('YYYY-MM-DD'),
                endDate: row.endDate.format('YYYY-MM-DD'),
            };

            console.log(id, data)

            const isNew = id.toString().startsWith('new_');

            if (isNew) {
                await createSemester(data);
            } else {
                await updateSemester(id, data);
            }
            setEditingKey('');
            await fetchSemesters();
        } catch (errInfo) {
        }
    };

    const handleAdd = () => {
        // Check if already adding
        if (editingKey.startsWith('new_')) {
            return;
        }

        const newId = `new_${Date.now()}`; // Temporary ID
        const newRecord = {
            id: newId,
            name: '',
            startDate: null,
            endDate: null,
        };

        // Add new blank row to the top of the local state
        useSemesterStore.setState((state) => ({
            semesters: [newRecord, ...state.semesters],
        }));

        // Set the form fields and enter edit mode
        form.setFieldsValue(newRecord);
        setEditingKey(newId);
    };

    const columns = [
        {
            title: 'Kỳ',
            dataIndex: 'name',
            editable: true,
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            editable: true,
            inputType: 'date',
            render: (text) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
            sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            editable: true,
            inputType: 'date',
            render: (text) => (text ? dayjs(text).format('YYYY-MM-DD') : ''),
            sorter: (a, b) => new Date(a.endDate) - new Date(b.endDate),
        },
        {
            title: 'Hành động',
            dataIndex: 'actions',
            width: 120,
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space>
                        <Popconfirm
                            title="Xác nhận lưu?"
                            onConfirm={() => save(record.id)}
                        >
                            <Button
                                type="primary"
                                shape="circle"
                                icon={<Save size={16}/>}
                                title="Lưu"
                            />
                        </Popconfirm>
                        <Button
                            shape="circle"
                            onClick={cancel}
                            icon={<XCircle size={16}/>}
                            title="Hủy"
                        />
                    </Space>
                ) : (
                    <Space>
                        <Button
                            type="text"
                            disabled={editingKey !== ''}
                            onClick={() => edit(record)}
                            icon={<Pencil size={16}/>}
                            className="flex items-center justify-center"
                            title="Edit"
                        />
                        <Popconfirm
                            title="Xác nhận xóa?"
                            onConfirm={() => deleteRow(record.id)}
                        >
                            <Button
                                variant={"filled"}
                                color={"danger"}
                                shape="circle"
                                icon={<Trash size={16}/>}
                                title="Xóa"
                            />
                        </Popconfirm>
                    </Space>)
            },
        },
    ];

    // Merge columns with editing logic
    const mergedColumns = columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: col.inputType === 'date' ? 'date' : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return (
        <LayoutManager>
            <Card title={"Quản lý kỳ"} className="h-full mx-auto bg-white p-6 rounded-lg shadow-md overflow-auto">
                <div className="flex justify-end items-center mb-3">
                    <Button
                        type="primary"
                        onClick={handleAdd}
                        disabled={editingKey !== ''}
                        icon={<Plus size={16}/>}
                        className="flex items-center"
                    >
                        Thêm
                    </Button>
                </div>

                <Form form={form} component={false}>
                    <Table
                        components={{
                            body: {
                                cell: EditableCell,
                            },
                        }}
                        bordered
                        dataSource={semesters}
                        columns={mergedColumns}
                        rowClassName="editable-row"
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            onChange: cancel,
                            pageSize: 10,
                        }}
                    />
                </Form>
            </Card>

        </LayoutManager>
    );
};

export default SemesterPage;