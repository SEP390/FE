import React, { useMemo, useState } from 'react';
import { Layout, Card, Row, Col, Table, Input, Select, Button, Tag, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { SideBarManager } from '../../../components/layout/SideBarManger';
import { useApi } from '../../../hooks/useApi';

const { Search } = Input;
const { Option } = Select;
const { Header, Content } = Layout;
const { Title } = Typography;

// Hard-coded mock data for invoices history
const mockInvoices = [
  { id: 1, type: 'Electric/Water', term: 'Kì 1', year: 2025, title: 'Hóa đơn điện nước - Phòng A101', amount: 500000, status: 'Paid' },
  { id: 2, type: 'Violation', term: 'Kì 1', year: 2025, title: 'Phạt vi phạm - Nguyễn Văn A', amount: 200000, status: 'Unpaid' },
  { id: 3, type: 'Electric/Water', term: 'Kì 2', year: 2024, title: 'Hóa đơn điện nước - Phòng B201', amount: 350000, status: 'Paid' },
  { id: 4, type: 'Violation', term: 'Kì 2', year: 2024, title: 'Phạt vi phạm - Trần Thị B', amount: 150000, status: 'Paid' },
];

export function InvoiceManager() {
  const collapsed = false;
  const activeKey = 'manager-invoices';

  const [searchText, setSearchText] = useState('');
  const [filterTerm, setFilterTerm] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const filtered = useMemo(() => {
    return mockInvoices.filter(inv => {
      if (filterTerm !== 'All' && inv.term !== filterTerm) return false;
      if (filterYear !== 'All' && String(inv.year) !== String(filterYear)) return false;
      if (filterType !== 'All' && inv.type !== filterType) return false;
      if (searchText && !inv.title.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    });
  }, [searchText, filterTerm, filterYear, filterType]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Loại', dataIndex: 'type', key: 'type' },
    { title: 'Kì', dataIndex: 'term', key: 'term' },
    { title: 'Năm', dataIndex: 'year', key: 'year' },
    { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: v => v.toLocaleString() + ' VND' },
    {
      title: 'Trạng thái', dataIndex: 'status', key: 'status', render: s => (
        <Tag color={s === 'Paid' ? 'green' : 'volcano'}>{s}</Tag>
      )
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SideBarManager collapsed={collapsed} active={activeKey} />
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0', height: 80 }}>
          <Title level={2} style={{ margin: 0, lineHeight: '80px' }}>Quản lý hóa đơn</Title>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Card>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Search placeholder="Tìm kiếm tiêu đề..." onSearch={(v) => setSearchText(v)} allowClear enterButton />
              </Col>

              <Col xs={24} sm={12} md={4} lg={4}>
                <Select value={filterTerm} onChange={setFilterTerm} style={{ width: '100%' }}>
                  <Option value="All">Tất cả kì</Option>
                  <Option value="Kì 1">Kì 1</Option>
                  <Option value="Kì 2">Kì 2</Option>
                  <Option value="Kì Hè">Kì Hè</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={4} lg={4}>
                <Select value={filterYear} onChange={setFilterYear} style={{ width: '100%' }}>
                  <Option value="All">Tất cả năm</Option>
                  <Option value={2025}>2025</Option>
                  <Option value={2024}>2024</Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} md={4} lg={4}>
                <Select value={filterType} onChange={setFilterType} style={{ width: '100%' }}>
                  <Option value="All">Tất cả loại</Option>
                  <Option value="Electric/Water">Hóa đơn điện nước</Option>
                  <Option value="Violation">Hóa đơn vi phạm</Option>
                </Select>
              </Col>

              <Col xs={24} sm={24} md={8} lg={6} style={{ textAlign: 'right' }}>
                <Space>
                  <Link to="/manager/invoices/electric"><Button type="primary">Tạo hóa đơn điện</Button></Link>
                  <Link to="/manager/invoices/violation"><Button> Tạo hóa đơn vi phạm</Button></Link>
                </Space>
              </Col>
            </Row>

            <Table dataSource={filtered} columns={columns} rowKey="id" />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}
