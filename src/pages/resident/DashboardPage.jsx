import React, { useEffect } from 'react';
import { AppLayout } from '../../components/layout/AppLayout.jsx';
import { Card, Typography, List, Divider, Spin, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSemester } from '../../hooks/useSemester.js';

const { Title, Text, Link } = Typography;

export function DashboardPage() {
    const navigate = useNavigate();

    // 🔥 Sử dụng hook useSemester để lấy thông tin học kỳ hiện tại
    const { currentSemester, loading: semesterLoading, error: semesterError } = useSemester();

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
                <Card
                    title={<span style={{ color: 'white' }}>News</span>}
                    headStyle={{ background: '#004aad' }}
                    className="lg:col-span-2"
                >
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
                        <Link onClick={() => navigate('/news')}>See more</Link>
                    </div>
                </Card>

                {/* Cột bên phải - Sidebar */}
                <div className="space-y-4">
                    {/* 🔥 Card hiển thị thông tin học kỳ hiện tại */}
                    <Card
                        title={<span style={{ color: 'white' }}>📚 Học kỳ hiện tại</span>}
                        headStyle={{ background: '#004aad' }}
                    >
                        {semesterLoading ? (
                            <div className="flex justify-center py-4">
                                <Spin tip="Đang tải..." />
                            </div>
                        ) : semesterError ? (
                            <Alert
                                message="Lỗi"
                                description={semesterError}
                                type="error"
                                showIcon
                            />
                        ) : currentSemester ? (
                            <div>
                                <div className="mb-3">
                                    <Text strong style={{ fontSize: '18px', color: '#004aad' }}>
                                        {currentSemester.name}
                                    </Text>
                                </div>
                                <List size="small">
                                    <List.Item>
                                        <Text type="secondary">Ngày bắt đầu:</Text>
                                        <Text strong className="ml-2">
                                            {new Date(currentSemester.startDate).toLocaleDateString('vi-VN')}
                                        </Text>
                                    </List.Item>
                                    <List.Item>
                                        <Text type="secondary">Ngày kết thúc:</Text>
                                        <Text strong className="ml-2">
                                            {new Date(currentSemester.endDate).toLocaleDateString('vi-VN')}
                                        </Text>
                                    </List.Item>
                                </List>
                            </div>
                        ) : (
                            <Text type="secondary">Không có thông tin học kỳ</Text>
                        )}
                    </Card>

                    {/* Card liên hệ */}
                    <Card
                        title={<span style={{ color: 'white' }}>📞 Thông tin liên hệ</span>}
                        headStyle={{ background: '#004aad' }}
                    >
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
            </div>
        </AppLayout>
    );
}