import React, { useMemo, useState } from 'react';
import { Layout, Card, Table, Button, Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { SideBarManager } from '../../../components/layout/SideBarManger';
import { useApi } from '../../../hooks/useApi';

// Mock rooms with outstanding electric/water balance
const rooms = [
  { id: 'A101', occupant: 'Nguyễn Văn A', debt: 120000 },
  { id: 'A102', occupant: 'Lê Thị B', debt: 0 },
  { id: 'B201', occupant: 'Trần Văn C', debt: 45000 },
  { id: 'B202', occupant: 'Phạm D', debt: 0 },
  { id: 'C301', occupant: 'Hoàng E', debt: 80000 },
];

const { Header, Content } = Layout;
const { Title } = Typography;

export function ElectricInvoiceAuto() {
  const [collapsed, setCollapsed] = useState(false);
  const activeKey = 'manager-invoices';
  const [generated, setGenerated] = useState([]);

  const dueRooms = useMemo(() => rooms.filter(r => r.debt > 0), []);

  const columns = [
    { title: 'Phòng', dataIndex: 'id', key: 'id' },
    { title: 'Người thuê', dataIndex: 'occupant', key: 'occupant' },
    { title: 'Nợ', dataIndex: 'debt', key: 'debt', render: v => v.toLocaleString() + ' VND' },
    { title: 'Trạng thái', dataIndex: 'id', key: 'status', render: (id) => (
      generated.includes(id) ? <Tag color="green">Đã tạo</Tag> : <Tag>Chưa tạo</Tag>
    ) }
  ];

  const handleAutoGenerate = () => {
    // Simulate creating invoices for all due rooms
    const ids = dueRooms.map(r => r.id);
    setGenerated(prev => Array.from(new Set(prev.concat(ids))));
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideBarManager collapsed={collapsed} active={activeKey} />
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
          <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>Tạo hóa đơn điện/ nước tự động</Title>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Link to="/manager/invoices"><Button>Quay lại danh sách</Button></Link>
              <Button type="primary" onClick={handleAutoGenerate}>Tạo tự động cho tất cả phòng đang nợ</Button>
            </Space>

            <Table dataSource={dueRooms} columns={columns} rowKey="id" />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}
