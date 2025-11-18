import React, { useState } from 'react';
import { Layout, Card, Form, Input, InputNumber, Button, Select, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { SideBarManager } from '../../../components/layout/SideBarManger';
import { useApi } from '../../../hooks/useApi';

const { TextArea } = Input;
const { Header, Content } = Layout;
const { Title } = Typography;

export function ViolationInvoiceCreate() {
  const [collapsed, setCollapsed] = useState(false);
  const activeKey = 'manager-invoices';

  const [form] = Form.useForm();
  const [created, setCreated] = useState(null);

  const onFinish = (values) => {
    // For now just show created invoice data locally
    setCreated(values);
    form.resetFields();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideBarManager collapsed={collapsed} active={activeKey} />
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
          <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>Tạo hóa đơn vi phạm</Title>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Card>
            <Link to="/manager/invoices"><Button style={{ marginBottom: 16 }}>Quay lại danh sách</Button></Link>

            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item name="student" label="Sinh viên vi phạm" rules={[{ required: true, message: 'Vui lòng nhập sinh viên' }]}>
                <Input placeholder="Họ tên hoặc mã sinh viên" />
              </Form.Item>

              <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}>
                <Select>
                  <Select.Option value="Noise">Gây ồn</Select.Option>
                  <Select.Option value="Damage">Phá hoại tài sản</Select.Option>
                  <Select.Option value="Other">Khác</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item name="content" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item name="amount" label="Giá (VND)" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">Tạo hóa đơn</Button>
              </Form.Item>
            </Form>

            {created && (
              <div style={{ marginTop: 20 }}>
                <h3>Hóa đơn đã tạo (preview)</h3>
                <pre>{JSON.stringify(created, null, 2)}</pre>
              </div>
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}
