import React, { useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { Card, Typography, List, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';  // 👈 Thêm dòng này

const { Title, Text, Link } = Typography;

export function DashboardPage() {
    const navigate = useNavigate(); // 👈 hook điều hướng

    const newsData = [
        {
            title: 'THÔNG BÁO VỀ VIỆC ĐĂNG KÝ PHÒNG KTX KỲ FA25',
            author: 'huongct12',
            date: '2025-08-11T18:55:36.573',
        },
        {
            title: 'THÔNG BÁO V/V CẮT ĐIỆN NGÀY 01/7/2025',
            author: 'huongct12',
            date: '2025-06-30T17:14:49.673',
        },
        {
            title: 'QUY ĐỊNH VỀ SỬ DỤNG THIẾT BỊ ĐIỆN TẠI KTX',
            author: 'huongct12',
            date: '2025-05-28T09:14:28.59',
        },
        {
            title: 'TB. VIỆC ĐẢM BẢO AN NINH AN TOÀN TRONG THỜI GIAN NGHỈ LỄ 30/4, 01/5',
            author: 'huongct12',
            date: '2025-04-27T15:00:45.9',
        },
        {
            title: 'THÔNG BÁO V/V ĐĂNG KÝ/HỦY PHÒNG KTX KỲ SUMMER 2025',
            author: 'huongct12',
            date: '2025-04-03T10:12:10.74',
        },
    ];

    return (
        <AppLayout>
            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Phần News */}
                <Card title={<span style={{ color: 'white' }}>News</span>} headStyle={{ background: '#004aad' }} className="lg:col-span-2">
                    <List
                        dataSource={newsData}
                        renderItem={(item) => (
                            <List.Item>
                                <div>
                                    <Link strong style={{ color: '#004aad', fontSize: '16px' }}>
                                        {item.title}
                                    </Link>
                                    <br />
                                    <Text type="secondary">
                                        By {item.author} {new Date(item.date).toLocaleString()}
                                    </Text>
                                </div>
                            </List.Item>
                        )}
                    />
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                        {/* 👇 Khi nhấn See more sẽ chuyển tới /news */}
                        <Link onClick={() => navigate('/news')}>See more</Link>
                    </div>
                </Card>

                    {/* Liên hệ */}
                    <Card title="📞 Thông tin liên hệ">
                        <List size="small">
                            <List.Item>
                                <Text strong>Security room:</Text> (024) 6680 5 913
                            </List.Item>
                            <List.Item>
                                <Text strong>Health station:</Text> (024) 6680 5 917
                            </List.Item>
                            <List.Item>
                                <Text strong>Student service:</Text> (024) 7308 1313
                            </List.Item>
                            <Divider />
                            <List.Item>
                                <Text strong>Dormitory management:</Text>{' '}
                                <a href="mailto:ktx@fpt.edu.vn">ktx@fpt.edu.vn</a>
                            </List.Item>
                        </List>
                    </Card>
                </div>

        </AppLayout>
    );
}
