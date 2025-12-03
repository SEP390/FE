import React, { useEffect, useState } from 'react';
import {Modal, Button, Table, Form, InputNumber, Space, Tag, Tooltip, App} from 'antd';
import { EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../../../api/axiosClient/axiosClient.js';
import {RequireRole} from "../../../components/authorize/RequireRole.jsx";

export const RoomPricingModal = ({ open, onCancel, onDataChange }) => {
    const [pricings, setPricings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State cho Modal con (Form nhập liệu)
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const {message}=App.useApp();

    // Hàm load dữ liệu
    const fetchPricings = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/pricing');
            if (response && response.data) {
                // Sắp xếp theo số giường tăng dần
                const sortedData = response.data.sort((a, b) => a.totalSlot - b.totalSlot);
                setPricings(sortedData);
            }
        } catch (error) {
            message.error("Không thể tải danh sách giá!");
        } finally {
            setLoading(false);
        }
    };

    // Gọi load dữ liệu khi mở Modal
    useEffect(() => {
        if (open) fetchPricings();
    }, [open]);

    // Xử lý mở form Thêm mới
    const handleAddNew = () => {
        setEditingRecord(null);
        form.resetFields();
        setIsFormVisible(true);
    };

    // Xử lý mở form Sửa
    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue({
            totalSlot: record.totalSlot,
            price: record.price
        });
        setIsFormVisible(true);
    };

    // Xử lý Submit Form
    const handleFormSubmit = async (values) => {
        setIsSubmitting(true);
        try {
            if (editingRecord) {
                // API Update
                await axiosClient.post(`/pricing/${editingRecord.id}`, {
                    totalSlot: editingRecord.totalSlot,
                    price: values.price
                });
                message.success("Cập nhật giá thành công!");
            } else {
                // API Create
                const exists = pricings.some(p => p.totalSlot === values.totalSlot);
                if (exists) {
                    message.warning(`Loại phòng ${values.totalSlot} giường đã tồn tại!`);
                    setIsSubmitting(false);
                    return;
                }
                await axiosClient.post('/pricing', values);
                message.success(`Đã thêm loại phòng ${values.totalSlot} giường!`);
            }

            // Đóng form và load lại dữ liệu
            setIsFormVisible(false);
            fetchPricings();
            if (onDataChange) onDataChange();
        } catch (error) {
            console.error("Lỗi submit:", error);
            message.error("Thao tác thất bại: " + (error.response?.data?.message || "Lỗi server"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            title: 'Loại phòng',
            dataIndex: 'totalSlot',
            key: 'totalSlot',
            render: (val) => <Tag color="blue" style={{ fontSize: '14px' }}>{val} Giường</Tag>,
        },
        {
            title: 'Đơn giá (VNĐ)',
            dataIndex: 'price',
            key: 'price',
            render: (val) => (
                // Ở Bảng hiển thị (Table) thì vẫn format cho đẹp, vì chỗ này chỉ xem không sửa
                <span style={{ fontWeight: 'bold', color: 'green', fontSize: '15px' }}>
                    {val ? val.toLocaleString('vi-VN') : 0} ₫
                </span>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Tooltip title="Sửa giá tiền">
                    <Button
                        type="text"
                        icon={<EditOutlined style={{ color: '#1890ff' }} />}
                        onClick={() => handleEdit(record)}
                    />
                </Tooltip>
            )
        }
    ];

    return (
        <RequireRole role = "MANAGER">
        <>
            <Modal
                title="Quản lý bảng giá phòng"
                open={open}
                onCancel={onCancel}
                footer={[<Button key="close" onClick={onCancel}>Đóng</Button>]}
                width={700}
                destroyOnClose
            >
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{color: '#666'}}>Danh sách giá hiện tại:</span>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={fetchPricings} loading={loading} />
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>Thêm mới</Button>
                    </Space>
                </div>
                <Table columns={columns} dataSource={pricings} rowKey="id" loading={loading} pagination={false} bordered size="small" scroll={{ y: 400 }} />
            </Modal>

            <Modal
                title={editingRecord ? "Cập nhật giá tiền" : "Thêm loại phòng mới"}
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onOk={form.submit}
                confirmLoading={isSubmitting}
                width={400}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                    <Form.Item
                        name="totalSlot"
                        label="Số giường (Sức chứa)"
                        rules={[{ required: true, message: 'Nhập số giường!' }]}
                    >
                        <InputNumber style={{ width: '100%' }} placeholder="VD: 4, 6, 8" disabled={!!editingRecord} />
                    </Form.Item>

                    {editingRecord && (
                        <div style={{color: 'orange', fontSize: '12px', marginBottom: 10}}>
                            * Không thể sửa số giường của loại đã có.
                        </div>
                    )}

                    <Form.Item
                        name="price"
                        label="Giá tiền (VNĐ/kỳ)"
                        rules={[
                            { required: true, message: 'Nhập giá tiền!' },
                            { type: 'number', message: 'Vui lòng nhập số hợp lệ!' } // Validate bắt buộc phải là số
                        ]}
                    >
                        {/* --- CHỈNH SỬA: NHẬP SỐ THÔ (RAW INPUT) --- */}
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="VD: 3000000"
                            controls={false} // Tắt mũi tên tăng giảm
                            min={0}
                            addonAfter="VND"
                            // Đã xóa formatter và parser -> Nhập 1000 là 1000, không tự nhảy số
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
        </RequireRole>
    );
};