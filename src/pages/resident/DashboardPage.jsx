import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout.jsx';
import { Card, Typography, List, Divider, Spin, Alert, Modal, Skeleton, message } from 'antd';
import { NewsDetailModal } from '../../components/news/NewsDetailModal.jsx';
import { useNavigate } from 'react-router-dom';
import { useSemester } from '../../hooks/useSemester.js';

const { Title, Text, Link } = Typography;

export function DashboardPage() {
    const navigate = useNavigate();

    // 🔥 Sử dụng hook useSemester để lấy thông tin học kỳ hiện tại
    const { currentSemester, loading: semesterLoading, error: semesterError } = useSemester();
    const [news, setNews] = useState([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const [newsError, setNewsError] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedNews, setSelectedNews] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const baseUrl = useMemo(() => import.meta.env.VITE_API_URL || 'http://localhost:8080/api', []);
    const token = useMemo(() => localStorage.getItem('token'), []);

    const fetchAllNews = async () => {
        setNewsLoading(true);
        setNewsError("");
        try {
            const res = await fetch(`${baseUrl}/news`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const json = await res.json();
            const items = Array.isArray(json?.data) ? json.data : [];
            const visible = items.filter((n) => n?.status === 'VISIBLE');
            visible.sort((a, b) => {
                const aDt = new Date(a?.date ? `${a.date}T${a.time || '00:00:00'}` : 0).getTime();
                const bDt = new Date(b?.date ? `${b.date}T${b.time || '00:00:00'}` : 0).getTime();
                return bDt - aDt;
            });
            setNews(visible.slice(0, 5));
        } catch (e) {
            setNews([]);
            setNewsError('Không thể tải tin tức');
        } finally {
            setNewsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllNews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openDetail = async (item) => {
        if (!item?.newsid) return;
        setDetailLoading(true);
        setModalVisible(true);
        try {
            const res = await fetch(`${baseUrl}/news/getnewsdetail/${item.newsid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const json = await res.json();
            if (!json?.data) throw new Error('No detail');
            setSelectedNews(json.data);
        } catch (e) {
            message.error('Không thể tải chi tiết tin tức');
            setSelectedNews(item); // fallback hiển thị dữ liệu hiện có
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Phần News */}
                <Card
                    title={<span style={{ color: 'white' }}>News</span>}
                    headStyle={{ background: '#004aad' }}
                    className="lg:col-span-2"
                >
                    {newsLoading ? (
                        <Skeleton active />
                    ) : newsError ? (
                        <Alert type="error" message={newsError} />
                    ) : (
                        <List
                            dataSource={news}
                            renderItem={(item) => {
                                const dateTime = item?.date
                                    ? new Date(item.time ? `${item.date}T${item.time}` : item.date)
                                    : null;
                                return (
                                    <List.Item style={{ cursor: 'pointer' }} onClick={() => openDetail(item)}>
                                        <div>
                                            <Link strong style={{ color: '#004aad', fontSize: '16px' }}>
                                                {item.title}
                                            </Link>
                                            <br />
                                            <Text type="secondary">
                                                {item.userNames} {dateTime ? dateTime.toLocaleString() : ''}
                                            </Text>
                                        </div>
                                    </List.Item>
                                );
                            }}
                        />
                    )}
                    <div style={{ textAlign: 'center', marginTop: 8 }}>
                        <Link onClick={() => navigate('/news')}>See more</Link>
                    </div>
                    <Modal
                        open={modalVisible}
                        onCancel={() => setModalVisible(false)}
                        footer={null}
                        width={900}
                    >
                        {detailLoading ? <Skeleton active /> : <NewsDetailModal news={selectedNews} />}
                    </Modal>
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