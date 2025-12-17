import { Button, Card, Carousel, Layout, Menu } from "antd";
import {
    AppstoreOutlined,
    HomeOutlined,
    InfoCircleOutlined,
    LoginOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import React, { useRef } from "react";
import { Content, Footer, Header } from "antd/es/layout/layout.js";
import ktx1 from "../assets/images/dormimg1.png";
import ktx2 from "../assets/images/dormimg2.png";
import ktx3 from "../assets/images/dormimg3.png";
import banner1 from "../assets/images/banner1.png";
import banner2 from "../assets/images/banner2.png";
import {UserPlus} from "lucide-react";

export function GuestPage() {
    const infoRef = useRef(null); // Thêm ref cho phần Giới thiệu

    const handleMenuClick = (key) => {
        if (key === "2" && infoRef.current) {
            infoRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <Layout className="min-h-screen">
            <Header className="flex justify-between items-center !bg-white shadow px-6">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-xl text-orange-500">Ký Túc Xá</span>
                </div>
                <Menu
                    mode="horizontal"
                    className="hidden md:flex flex-grow justify-center border-0"
                    onClick={({ key }) => handleMenuClick(key)}
                    items={[
                        { key: "1", label: "Trang Chủ", icon: <HomeOutlined /> },
                        { key: "2", label: "Giới Thiệu", icon: <InfoCircleOutlined /> },
                        //{ key: "3", label: "Dịch Vụ", icon: <AppstoreOutlined /> },
                    ]}
                />
                <div className="flex gap-2">
                    <Link to={"/login"}><Button type="default" icon={<LoginOutlined />}>Đăng Nhập</Button></Link>
                    {/*<Link to={"/register"}><Button type="default" icon={<UserPlus size={14} />}>Đăng ký</Button></Link>*/}
                </div>
            </Header>

            <Content className="p-6 bg-gray-50">
                <div className="text-center py-10">
                    <h1 className="text-4xl font-bold text-orange-500 mb-4">
                        Chào mừng đến với Ký Túc Xá
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Quản lý chỗ ở, khám phá cơ sở vật chất ký túc xá và cập nhật những
                        tin tức mới nhất.
                    </p>
                    <div className="mt-6">
                        {/*<Button size="large">Xem Tin Tức</Button>*/}
                    </div>
                </div>

                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card title="Thông Tin Ký Túc Xá" className="shadow-md rounded-xl">
                        <p>
                            Tìm hiểu về cơ sở vật chất, phòng ở và dịch vụ được thiết kế để
                            mang lại môi trường sống thoải mái cho sinh viên.
                        </p>
                    </Card>
                    <Card title="Thông Báo" className="shadow-md rounded-xl">
                        <p>
                            Luôn cập nhật các tin tức, nội quy ký túc xá và các sự kiện sắp
                            tới.
                        </p>
                    </Card>
                    <Card title="Liên Hệ" className="shadow-md rounded-xl">
                        <p>
                            Cần hỗ trợ? Hãy liên hệ với ban quản lý ký túc xá để được giúp
                            đỡ.
                        </p>
                    </Card>
                </div>

                <Carousel
                    arrows
                    dots
                    autoplay
                    className="max-w-4xl mx-auto mb-10 rounded-xl overflow-hidden shadow"
                >
                    <div>
                        <img
                            src={banner1}
                            alt="Ký túc xá"
                            className="w-full h-[400px] object-cover"
                        />
                    </div>
                    <div>
                        <img
                            src={banner2}
                            alt="Sinh viên"
                            className="w-full h-[400px] object-cover"
                        />
                    </div>
                </Carousel>
            </Content>

            {/* PHẦN GIỚI THIỆU */}
            <section ref={infoRef} className="max-w-6xl mx-auto py-12 space-y-10">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-orange-500 mb-4">
                        Thông tin Ký túc xá Đại học
                    </h2>
                    <p className="text-gray-600">
                        Để biết thêm chi tiết về KTX, các bạn có thể truy cập vào file PDF
                        để tìm hiểu thêm.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-gray-700 mb-3">
                            Trường Đại học X là một trong những ngôi trường nổi tiếng đào tạo
                            đa ngành với chất lượng đào tạo đạt chuẩn quốc tế. Nhà trường
                            quan tâm cả đời sống sinh viên bằng việc đầu tư khu Ký túc xá hiện
                            đại, sạch sẽ và đầy đủ tiện nghi.
                        </p>
                        <p className="text-gray-700">
                            KTX được xem như ngôi nhà thứ hai của sinh viên, giúp tạo không
                            gian học tập và sinh hoạt thoải mái, an toàn.
                        </p>
                    </div>
                    <img src={ktx1} alt="Ký túc xá" />
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-center">
                    <img src={ktx2} alt="Ký túc xá" />
                    <div>
                        <p className="text-orange-500 font-semibold">
                            Ký túc xá là chỗ ở dành riêng cho sinh viên của Đại học .
                        </p>
                        <p className="text-gray-700 mt-2">
                            Với vị trí thuận lợi, sinh viên dễ dàng di chuyển giữa khu học và
                            khu ở, tiết kiệm chi phí và có môi trường sinh hoạt, học tập hiện
                            đại.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-orange-500 font-semibold">
                            Thiết kế hiện đại, thoáng mát và đầy đủ tiện nghi
                        </p>
                        <p className="text-gray-700 mt-2">
                            Mỗi phòng có wifi, máy giặt sấy, máy bán nước, điều hòa, giường
                            tầng, bàn học, tủ đựng đồ, nhà vệ sinh riêng... đảm bảo sinh viên
                            cảm thấy như ở nhà.
                        </p>
                    </div>
                    <img src={ktx3} alt="Ký túc xá" />
                </div>
            </section>

            <Footer className="text-center bg-white shadow-inner">
                <p className="text-gray-500">
                    © {new Date().getFullYear()} Hệ Thống Quản Lý Ký Túc Xá. All Rights
                    Reserved.
                </p>
            </Footer>
        </Layout>
    );
}

