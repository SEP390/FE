import { AppLayout } from "../../../components/layout/AppLayout.jsx";
import { useEffect, useState } from "react";
import { useApi } from "../../../hooks/useApi.js"; // Adjust path if needed, matching BookingPage
import { Spin, Typography, Card, Row, Col, Divider } from "antd";

const { Title, Text } = Typography;

export function StudentInformationPage() {
    const { get, data, isComplete, isSuccess } = useApi();
    const { get: getRoom, data: roomData, isSuccess: isRoomSuccess } = useApi();
    const [student, setStudent] = useState(null);

    useEffect(() => {
        get("/users/profile");
    }, [get]);

    useEffect(() => {
        getRoom("/rooms/current");
    }, [getRoom]);

    useEffect(() => {
        if (isSuccess && data) {
            const userData = data; // Assuming BaseResponse structure with 'data' field
            const formattedDob = userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : 'N/A';
            const formattedGender = userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1).toLowerCase() : 'N/A';
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

    return (
        <Spin spinning={!isComplete}>
            <AppLayout>
                <div className="p-6">
                    {isSuccess && student ? (
                        <>
                            <Title level={3}>Student Information</Title>
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