import React, { useEffect, useMemo, useState, useRef } from 'react';
import { AppLayout } from '../../components/layout/AppLayout.jsx';
import { Card, Typography, List, Divider, Spin, Alert, Modal, Skeleton, message, Tag, Button } from 'antd';
import { NewsDetailModal } from '../../components/news/NewsDetailModal.jsx';
import { useNavigate } from 'react-router-dom';
import { useSemester } from '../../hooks/useSemester.js';
import { useApi } from '../../hooks/useApi.js';
import { BellOutlined, CloseOutlined } from '@ant-design/icons';

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

    // Latest request state
    const [latestRequest, setLatestRequest] = useState(null);
    const [requestNotificationVisible, setRequestNotificationVisible] = useState(true);
    const { get: getRequests, data: requestsData, isSuccess: isRequestsSuccess } = useApi();
    const prevLatestRequestRef = useRef(null);

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

    // Fetch requests and get latest request from today
    useEffect(() => {
        getRequests("/requests");
    }, [getRequests]);

    // Process requests data to find latest request from today
    useEffect(() => {
        if (isRequestsSuccess && requestsData) {
            let dataArray = [];

            if (Array.isArray(requestsData)) {
                dataArray = requestsData;
            } else if (requestsData.data && Array.isArray(requestsData.data)) {
                dataArray = requestsData.data;
            } else if (requestsData.data && requestsData.data.data && Array.isArray(requestsData.data.data)) {
                dataArray = requestsData.data.data;
            }

            if (dataArray.length > 0) {
                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                // Filter requests from today
                const todayRequests = dataArray.filter(item => {
                    if (!item.createTime) return false;
                    const requestDate = new Date(item.createTime);
                    return requestDate >= todayStart;
                });

                if (todayRequests.length > 0) {
                    // Sort by createTime descending to get latest
                    todayRequests.sort((a, b) => {
                        const dateA = new Date(a.createTime);
                        const dateB = new Date(b.createTime);
                        return dateB - dateA;
                    });

                    const latest = todayRequests[0];
                    const newLatestRequest = {
                        requestId: latest.requestId,
                        requestType: latest.requestType,
                        status: latest.responseStatus || latest.status,
                        createTime: latest.createTime,
                        semesterName: latest.semesterName
                    };

                    // If it's a different request or status changed, show notification
                    const prevRequest = prevLatestRequestRef.current;
                    if (!prevRequest ||
                        prevRequest.requestId !== newLatestRequest.requestId ||
                        prevRequest.status !== newLatestRequest.status) {
                        setRequestNotificationVisible(true);
                    }

                    prevLatestRequestRef.current = newLatestRequest;
                    setLatestRequest(newLatestRequest);
                } else {
                    prevLatestRequestRef.current = null;
                    setLatestRequest(null);
                }
            } else {
                prevLatestRequestRef.current = null;
                setLatestRequest(null);
            }
        }
    }, [isRequestsSuccess, requestsData]);

    // Poll for latest request updates every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            getRequests("/requests");
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [getRequests]);

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

    // Format request type
    const formatRequestType = (type) => {
        const typeMap = {
            CHECKOUT: "Trả phòng",
            SECURITY_INCIDENT: "Sự cố an ninh",
            METER_READING_DISCREPANCY: "Chênh lệch đồng hồ",
            MAINTENANCE: "Bảo trì",
            COMPLAINT: "Khiếu nại",
            OTHER: "Khác"
        };
        return typeMap[type] || type;
    };

    // Format status
    const formatStatus = (status) => {
        const statusMap = {
            PENDING: "Đang xử lý",
            PROCESSING: "Đang xử lý",
            APPROVED: "Đã duyệt",
            REJECTED: "Từ chối",
            COMPLETED: "Hoàn thành",
            CANCELLED: "Đã hủy",
            CHECKED: "Đang xử lý"
        };
        return statusMap[status] || status;
    };

    // Status color
    const statusColor = (status) => {
        const displayStatus = status === "CHECKED" ? "PENDING" : status;
        if (displayStatus === "APPROVED" || displayStatus === "COMPLETED") return "green";
        if (displayStatus === "PENDING" || displayStatus === "PROCESSING") return "blue";
        if (displayStatus === "REJECTED" || displayStatus === "CANCELLED") return "red";
        return "default";
    };

    return (
        <AppLayout>
            {/* Latest Request Notification - Fixed in corner */}
            {latestRequest && requestNotificationVisible && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1000,
                        maxWidth: '350px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        borderRadius: '8px'
                    }}
                >
                    <Card
                        size="small"
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>
                                    <BellOutlined style={{ marginRight: 8, color: '#004aad' }} />
                                    Yêu cầu mới nhất hôm nay
                                </span>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={() => setRequestNotificationVisible(false)}
                                    style={{ padding: 0, minWidth: 'auto' }}
                                />
                            </div>
                        }
                        headStyle={{ background: '#004aad', color: 'white', padding: '8px 12px' }}
                        bodyStyle={{ padding: '12px' }}
                    >
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Loại: </Text>
                            <Text>{formatRequestType(latestRequest.requestType)}</Text>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>Trạng thái: </Text>
                            <Tag color={statusColor(latestRequest.status)}>
                                {formatStatus(latestRequest.status)}
                            </Tag>
                        </div>
                        {latestRequest.semesterName && (
                            <div style={{ marginBottom: 8 }}>
                                <Text strong>Học kỳ: </Text>
                                <Text>{latestRequest.semesterName}</Text>
                            </div>
                        )}
                        {latestRequest.createTime && (
                            <div style={{ marginBottom: 12, fontSize: '12px', color: '#999' }}>
                                {new Date(latestRequest.createTime).toLocaleString('vi-VN')}
                            </div>
                        )}
                        <Button
                            type="primary"
                            size="small"
                            block
                            onClick={() => {
                                navigate(`/resident-request-detail/${latestRequest.requestId}`);
                            }}
                            style={{ backgroundColor: '#004aad' }}
                        >
                            Xem chi tiết
                        </Button>
                    </Card>
                </div>
            )}

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