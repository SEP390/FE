import { AppLayout } from "../../../components/layout/AppLayout.jsx";
import { useEffect, useState } from "react";
import { useApi } from "../../../hooks/useApi.js";
import { Spin, Typography, Card, Row, Col, Divider, Avatar, Upload, message } from "antd";
import { UserOutlined, CameraOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export function StudentInformationPage() {
    const { get: getProfile, data: profileData, isSuccess: isProfileSuccess, isComplete: isProfileComplete } = useApi();
    const { get: getRoom, data: roomData, isSuccess: isRoomSuccess, isComplete: isRoomComplete } = useApi();
    const [student, setStudent] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Chỉ cần gọi /users/profile - nó đã trả đủ thông tin
    useEffect(() => {
        getProfile("/users/profile");
        getRoom("/rooms/current");
    }, []);

    // Xử lý dữ liệu từ /users/profile

    useEffect(() => {
        if (isProfileSuccess && profileData) {
            console.log("📌 Profile data:", profileData);

            const formattedDob = profileData.dob
                ? new Date(profileData.dob).toISOString().split('T')[0]
                : 'N/A';

            const formattedGender = profileData.gender
                ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1).toLowerCase()
                : 'N/A';

            setAvatarUrl(profileData.image || null);

            setStudent({
                name: profileData.fullName || profileData.username || 'N/A',
                dob: formattedDob,
                gender: formattedGender,
                mail: profileData.email || 'N/A',
                phoneNumber: profileData.phongNum || 'N/A',  // ✅ SỬA: phongNum thay vì phoneNumber
                StudentId: profileData.studentId || 'N/A',    // ✅ SỬA: studentId (chữ s thường)
                slotName: profileData.slotName || 'N/A',
            });
        }
    }, [isProfileSuccess, profileData]);

    // Xử lý upload avatar
    const handleAvatarUpload = async (file) => {
        setUploading(true);

        try {
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
                setAvatarUrl(newAvatarUrl);
                message.success('Upload ảnh thành công! (Chưa lưu vào profile - cần API update)');
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

        return false;
    };

    const isLoading = !isProfileComplete || !isRoomComplete || uploading;

    return (
        <Spin spinning={isLoading}>
            <AppLayout>
                <div className="p-6">
                    {isProfileSuccess && student ? (
                        <>
                            <Title level={3}>Thông Tin Sinh Viên</Title>

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
                                        <Title level={4} style={{ color: "#004aad", marginBottom: 24 }}>
                                            {student.name}
                                        </Title>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-32">
                                                    <Text strong style={{ color: "#666" }}>Ngày sinh:</Text>
                                                </div>
                                                <Text style={{ fontSize: "15px" }}>{student.dob}</Text>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-32">
                                                    <Text strong style={{ color: "#666" }}>Giới tính:</Text>
                                                </div>
                                                <Text style={{ fontSize: "15px" }}>{student.gender}</Text>
                                            </div>

                                            <Divider style={{ margin: "16px 0" }} />

                                            <div className="flex items-center gap-3">
                                                <div className="w-32">
                                                    <Text strong style={{ color: "#666" }}>Email:</Text>
                                                </div>
                                                <a
                                                    href={`mailto:${student.mail}`}
                                                    style={{
                                                        color: "#1890ff",
                                                        fontSize: "15px",
                                                        textDecoration: "none"
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                                                    onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                                                >
                                                    {student.mail}
                                                </a>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-32">
                                                    <Text strong style={{ color: "#666" }}>Số điện thoại:</Text>
                                                </div>
                                                <Text style={{ fontSize: "15px" }}>{student.phoneNumber}</Text>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-32">
                                                    <Text strong style={{ color: "#666" }}>Mã sinh viên:</Text>
                                                </div>
                                                <Text style={{ fontSize: "15px", fontWeight: 500 }}>{student.StudentId}</Text>
                                            </div>
                                        </div>
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
                                        <Title level={4} style={{ marginBottom: 24 }}>Thông Tin Thêm</Title>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-28">
                                                    <Text strong style={{ color: "#666" }}>Ký túc xá:</Text>
                                                </div>
                                                <Text style={{ fontSize: "15px" }}>
                                                    {isRoomSuccess && roomData?.dorm?.dormName ? roomData.dorm.dormName : 'N/A'}
                                                </Text>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-28">
                                                    <Text strong style={{ color: "#666" }}>Phòng:</Text>
                                                </div>
                                                <Text style={{ fontSize: "15px" }}>
                                                    {isRoomSuccess && roomData?.roomNumber ? roomData.roomNumber : 'N/A'}
                                                </Text>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-28">
                                                    <Text strong style={{ color: "#666" }}>Giường:</Text>
                                                </div>
                                                <Text style={{ fontSize: "15px" }}>
                                                    {student?.slotName || 'N/A'}
                                                </Text>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    ) : (
                        <Title level={3}>Không có thông tin sinh viên</Title>
                    )}
                </div>
            </AppLayout>
        </Spin>
    );
}