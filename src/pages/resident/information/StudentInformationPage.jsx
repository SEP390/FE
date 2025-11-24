import { AppLayout } from "../../../components/layout/AppLayout.jsx";
import { useEffect, useState } from "react";
import { useApi } from "../../../hooks/useApi.js";
import { Spin, Typography, Card, Row, Col, Divider, Avatar, Upload, message } from "antd";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;

export function StudentInformationPage() {
    const { get, data, isComplete, isSuccess } = useApi();
    const { get: getRoom, data: roomData, isSuccess: isRoomSuccess } = useApi();
    const [student, setStudent] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        get("/users/profile");
    }, [get]);

    useEffect(() => {
        getRoom("/rooms/current");
    }, [getRoom]);

    useEffect(() => {
        if (isSuccess && data) {
            const userData = data;
            const formattedDob = userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : 'N/A';
            const formattedGender = userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1).toLowerCase() : 'N/A';

            // Set avatar URL từ data
            setAvatarUrl(userData.avatarUrl || null);

            setStudent({
                name: userData.username || 'N/A',
                dob: formattedDob,
                gender: formattedGender,
                mail: userData.email || 'N/A',
                bed: userData.slotName || 'N/A',
                StudentId: userData.studentId || 'N/A',
            });
        }
    }, [isSuccess, data]);

    // Hàm xử lý upload avatar
    const handleAvatarUpload = async (file) => {
        setUploading(true);

        try {
            // Bước 1: Upload ảnh lên server
            const formData = new FormData();
            formData.append('image', file);

            const uploadResponse = await fetch('http://localhost:8080/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const uploadResult = await uploadResponse.json();

            if (uploadResult.status === 201 && uploadResult.data) {
                const newAvatarUrl = uploadResult.data;

                // Tạm thời chỉ update UI, chưa lưu vào DB
                setAvatarUrl(newAvatarUrl);
                message.success('Upload ảnh thành công! (Chưa lưu vào profile - cần API update)');

                // TODO: Đợi backend thêm API PUT/PATCH /api/users/profile
                console.log('Avatar URL:', newAvatarUrl);
            } else {
                message.error('Upload ảnh thất bại!');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            message.error('Có lỗi xảy ra khi upload avatar!');
        } finally {
            setUploading(false);
        }

        // Ngăn upload mặc định của antd
        return false;
    };

    return (
        <Spin spinning={!isComplete || uploading}>
            <AppLayout>
                <div className="p-6">
                    {isSuccess && student ? (
                        <>
                            <Title level={3}>Student Information</Title>

                            {/* Avatar Section */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <Avatar
                                        size={120}
                                        src={avatarUrl}
                                        icon={!avatarUrl && <UserOutlined />}
                                        style={{
                                            border: '4px solid #004aad',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                        }}
                                    />
                                    <Upload
                                        showUploadList={false}
                                        beforeUpload={handleAvatarUpload}
                                        accept="image/*"
                                    >
                                        <div
                                            className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition"
                                            style={{
                                                width: 36,
                                                height: 36,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <CameraOutlined style={{ color: 'white', fontSize: 18 }} />
                                        </div>
                                    </Upload>
                                </div>
                            </div>

                            <Row gutter={[16, 16]}>
                                {/* Cột trái: Thông tin cơ bản */}
                                <Col xs={24} md={12}>
                                    <Card
                                        bordered
                                        style={{
                                            borderRadius: 12,
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        <Title level={4} style={{ color: "#004aad", marginBottom: 16 }}>
                                            {student.name}
                                        </Title>
                                        <Text>
                                            {student.dob} - {student.gender}
                                        </Text>
                                        <br />
                                        <Text strong>Mail: </Text>
                                        <a href={`mailto:${student.mail}`}>{student.mail}</a>
                                        <br />
                                        <Text strong>Student ID: </Text>
                                        <Text>{student.StudentId}</Text>
                                    </Card>
                                </Col>

                                {/* Cột phải: More information */}
                                <Col xs={24} md={12}>
                                    <Card
                                        bordered
                                        style={{
                                            borderRadius: 12,
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        <Title level={4}>More Information</Title>
                                        <Divider />
                                        <div className="space-y-2">
                                            <div>
                                                <Text strong>Dorm: </Text>
                                                <Text>{isRoomSuccess && roomData?.dorm?.dormName ? roomData.dorm.dormName : 'N/A'}</Text>
                                            </div>
                                            <div>
                                                <Text strong>Room: </Text>
                                                <Text>{isRoomSuccess && roomData?.roomNumber ? roomData.roomNumber : 'N/A'}</Text>
                                            </div>
                                            <div>
                                                <Text strong>Slot: </Text>
                                                <Text>{student?.bed || 'N/A'}</Text>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    ) : (
                        <Title level={3}>No Student Information Available</Title>
                    )}
                </div>
            </AppLayout>
        </Spin>
    );
}