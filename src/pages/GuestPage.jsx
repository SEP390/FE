import { Button, Card, Carousel, Layout, Menu } from "antd";
import { AppstoreOutlined, HomeOutlined, InfoCircleOutlined, LoginOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import React from "react";
import { Content, Footer, Header } from "antd/es/layout/layout.js";

export function GuestPage() {
    return (
        <>
            <Layout className="min-h-screen">
                <Header className="flex justify-between items-center !bg-white shadow px-6">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-xl text-orange-500">
                            Ký Túc Xá FPT
                        </span>
                    </div>
                    <Menu
                        mode="horizontal"
                        className="hidden md:flex flex-grow justify-center border-0"
                        items={[
                            { key: "1", label: "Trang Chủ", icon: <HomeOutlined /> },
                            { key: "2", label: "Giới Thiệu", icon: <InfoCircleOutlined /> },
                            { key: "3", label: "Dịch Vụ", icon: <AppstoreOutlined /> },
                        ]}
                    />
                    <div className="flex gap-2">
                        <Button type="default" icon={<LoginOutlined />}>
                            <Link to={"/login"}>Đăng Nhập</Link>
                        </Button>
                        <Button>
                            <Link to={"/register"}>Đăng Ký</Link>
                        </Button>
                    </div>
                </Header>
                <Content className="p-6 bg-gray-50">
                    <div className="text-center py-10">
                        <h1 className="text-4xl font-bold text-orange-500 mb-4">
                            Chào mừng đến với Ký Túc Xá FPT
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Quản lý chỗ ở, khám phá cơ sở vật chất ký túc xá và cập nhật
                            những tin tức mới nhất.
                        </p>
                        <div className="mt-6">
                            <Button size="large">Xem Tin Tức</Button>
                        </div>
                    </div>

                    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card
                            title="Thông Tin Ký Túc Xá"
                            variant={"outlined"}
                            className="shadow-md rounded-xl"
                        >
                            <p>
                                Tìm hiểu về cơ sở vật chất, phòng ở và dịch vụ được thiết kế
                                để mang lại môi trường sống thoải mái cho sinh viên.
                            </p>
                        </Card>
                        <Card
                            title="Thông Báo"
                            variant={"outlined"}
                            className="shadow-md rounded-xl"
                        >
                            <p>
                                Luôn cập nhật các tin tức, nội quy ký túc xá và các sự kiện sắp tới.
                            </p>
                        </Card>
                        <Card
                            title="Liên Hệ"
                            variant={"outlined"}
                            className="shadow-md rounded-xl"
                        >
                            <p>
                                Cần hỗ trợ? Hãy liên hệ với ban quản lý ký túc xá để được giúp đỡ.
                            </p>
                        </Card>
                    </div>
                    <Carousel arrows dots autoplay className="max-w-4xl mx-auto mb-10 rounded-xl overflow-hidden shadow">
                        <div>
                            <img
                                src="https://lipsum.app/1000x800/888/fff"
                                alt="Ký túc xá"
                                className="w-full h-[400px] object-cover"
                            />
                        </div>
                        <div>
                            <img
                                src="https://lipsum.app/1000x800/888/fff"
                                alt="Sinh viên"
                                className="w-full h-[400px] object-cover"
                            />
                        </div>
                    </Carousel>
                </Content>
                <Footer className="text-center bg-white shadow-inner">
                    <p className="text-gray-500">
                        © {new Date().getFullYear()} Hệ Thống Quản Lý Ký Túc Xá FPT. All Rights Reserved.
                    </p>
                </Footer>
            </Layout>
        </>
    );
}
