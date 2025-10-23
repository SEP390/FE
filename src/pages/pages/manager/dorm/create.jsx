import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Row, Col, notification, Table, Tag, Divider, Spin } from 'antd';
import {Plus, Building2, Search, Zap, ChevronLeft} from 'lucide-react';
import {AppLayout} from "../../../../components/layout/AppLayout.jsx";
import {useNavigate} from "react-router-dom";

const { Title, Text } = Typography;
const { Item: FormItem, List: FormList } = Form;

// --- Mock API Functions ---
// In a real app, these would be 'fetch' calls to your backend
const MOCK_API = {
    createDorm: (data) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('API: Creating Dorm with data:', data);
                const newDorm = { ...data, uuid: `dorm-${Math.random().toString(36).substring(2, 9)}`, createdAt: new Date().toISOString() };
                resolve({ success: true, data: newDorm });
            }, 1000); // Simulate network delay
        });
    },
    getDorm: (uuid) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(`API: Fetching Dorm with UUID: ${uuid}`);
                if (uuid.startsWith('dorm-')) {
                    // Mock successful response for demonstration
                    resolve({
                        success: true,
                        data: {
                            uuid: uuid,
                            dormName: `Central Hall ${uuid.split('-')[1].toUpperCase()}`,
                            totalFloor: 5,
                            totalRoom: 150,
                            rooms: [
                                { roomNumber: '101', totalSlot: 4, floor: 1 },
                                { roomNumber: '205', totalSlot: 2, floor: 2 },
                                { roomNumber: '302', totalSlot: 3, floor: 3 },
                            ],
                        },
                    });
                } else if (uuid === 'error-test') {
                    reject(new Error('Network error or server issue'));
                } else {
                    resolve({ success: false, message: 'Dorm not found' });
                }
            }, 1500); // Simulate network delay
        });
    },
};
// --- End Mock API Functions ---

const DormPage = () => {
    const navigate = useNavigate();
    const back = () => navigate("/pages/manager/dorm");

    const [createForm] = Form.useForm();
    const [searchUuid, setSearchUuid] = useState('');
    const [dormData, setDormData] = useState(null);
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    // --- Create Dorm Logic ---
    const onCreateDorm = async (values) => {
        setLoadingCreate(true);
        try {
            const response = await MOCK_API.createDorm(values);
            if (response.success) {
                notification.success({
                    message: 'Dorm Created Successfully',
                    description: `Dorm: ${values.dormName} has been created with UUID: ${response.data.uuid}`,
                });
                createForm.resetFields();
            } else {
                notification.error({
                    message: 'Creation Failed',
                    description: 'Failed to create dorm. Please check the data.',
                });
            }
        } catch (error) {
            console.error('Create Dorm Error:', error);
            notification.error({
                message: 'An Error Occurred',
                description: error.message || 'Could not connect to the server.',
            });
        } finally {
            setLoadingCreate(false);
        }
    };

    // --- Search Dorm Logic ---
    const onSearchDorm = async () => {
        if (!searchUuid) {
            notification.warning({ message: 'Missing UUID', description: 'Please enter a Dorm UUID to search.' });
            return;
        }

        setLoadingSearch(true);
        setDormData(null);
        try {
            const response = await MOCK_API.getDorm(searchUuid);
            if (response.success) {
                setDormData(response.data);
                notification.success({ message: 'Dorm Found', description: `Displaying data for Dorm: ${searchUuid}` });
            } else {
                notification.info({ message: 'Dorm Not Found', description: `No dorm found with UUID: ${searchUuid}` });
                setDormData(null);
            }
        } catch (error) {
            console.error('Search Dorm Error:', error);
            notification.error({
                message: 'An Error Occurred',
                description: error.message || 'Could not fetch dorm data.',
            });
            setDormData(null);
        } finally {
            setLoadingSearch(false);
        }
    };

    // --- Room Table Configuration ---
    const roomColumns = [
        {
            title: 'Room Number',
            dataIndex: 'roomNumber',
            key: 'roomNumber',
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Floor',
            dataIndex: 'floor',
            key: 'floor',
            sorter: (a, b) => a.floor - b.floor,
        },
        {
            title: 'Total Slot',
            dataIndex: 'totalSlot',
            key: 'totalSlot',
            align: 'center',
        },
    ];

    return (
        <AppLayout>
            <Card
                title={<span className={"flex items-center gap-3"}><Button onClick={back} type={"text"}><ChevronLeft/></Button> Tạo Dorm</span>}
                bordered={false}
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={onCreateDorm}
                    initialValues={{ totalFloor: 1, totalRoom: 1, rooms: [{ roomNumber: '101', totalSlot: 4, floor: 1 }] }}
                >
                    <FormItem
                        name="dormName"
                        label={<Text strong>Dorm Name</Text>}
                        rules={[{ required: true, message: 'Please input the Dorm name!' }]}
                    >
                        <Input placeholder="e.g., North Tower" />
                    </FormItem>

                    <Row gutter={16}>
                        <Col span={12}>
                            <FormItem
                                name="totalFloor"
                                label={<Text strong>Total Floors</Text>}
                                rules={[{ required: true, message: 'Input floor count!' }]}
                            >
                                <Input type="number" min={1} placeholder="e.g., 5" />
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem
                                name="totalRoom"
                                label={<Text strong>Total Rooms</Text>}
                                rules={[{ required: true, message: 'Input room count!' }]}
                            >
                                <Input type="number" min={1} placeholder="e.g., 100" />
                            </FormItem>
                        </Col>
                    </Row>

                    <Divider orientation="left" className="!mt-2 !mb-4">
                        <Text strong>Rooms Detail</Text>
                    </Divider>

                    <FormList name="rooms">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, fieldKey, ...restField }) => (
                                    <Card
                                        key={key}
                                        className="mb-3 bg-gray-50 border-dashed border-gray-300"
                                        size="small"
                                        extra={
                                            <Button
                                                type="text"
                                                danger
                                                onClick={() => remove(name)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Remove
                                            </Button>
                                        }
                                    >
                                        <Row gutter={16} align="bottom">
                                            <Col span={8}>
                                                <FormItem
                                                    {...restField}
                                                    name={[name, 'roomNumber']}
                                                    fieldKey={[fieldKey, 'roomNumber']}
                                                    label="Room No."
                                                    rules={[{ required: true, message: 'Room No. is required' }]}
                                                    className="!mb-0"
                                                >
                                                    <Input placeholder="e.g., 101" />
                                                </FormItem>
                                            </Col>
                                            <Col span={8}>
                                                <FormItem
                                                    {...restField}
                                                    name={[name, 'floor']}
                                                    fieldKey={[fieldKey, 'floor']}
                                                    label="Floor"
                                                    rules={[{ required: true, message: 'Floor is required' }]}
                                                    className="!mb-0"
                                                >
                                                    <Input type="number" min={1} placeholder="e.g., 1" />
                                                </FormItem>
                                            </Col>
                                            <Col span={8}>
                                                <FormItem
                                                    {...restField}
                                                    name={[name, 'totalSlot']}
                                                    fieldKey={[fieldKey, 'totalSlot']}
                                                    label="Slots"
                                                    rules={[{ required: true, message: 'Slots are required' }]}
                                                    className="!mb-0"
                                                >
                                                    <Input type="number" min={1} placeholder="e.g., 4" />
                                                </FormItem>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                                <FormItem className="mt-4">
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<Plus />}
                                    >
                                        Add Room
                                    </Button>
                                </FormItem>
                            </>
                        )}
                    </FormList>

                    <FormItem className="mt-6">
                        <Button type="primary" htmlType="submit" block loading={loadingCreate} icon={<Zap />}>
                            Create Dorm
                        </Button>
                    </FormItem>
                </Form>
            </Card>
        </AppLayout>
    );
};

export default DormPage;