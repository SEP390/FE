import { Button, Card, Carousel, Layout, Menu, Collapse } from "antd";
import {
    AppstoreOutlined,
    HomeOutlined,
    InfoCircleOutlined,
    LoginOutlined,
    QuestionCircleOutlined,
    PhoneOutlined,
    NotificationOutlined,
    SafetyOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import React, { useRef } from "react";
import { Content, Footer, Header } from "antd/es/layout/layout.js";
import ktx1 from "../assets/images/dormimg1.png";
import ktx2 from "../assets/images/dormimg2.png";
import ktx3 from "../assets/images/dormimg3.png";
import banner1 from "../assets/images/banner1.png";
import banner2 from "../assets/images/banner2.png";
import {UserPlus, Building2, Bell, Headset} from "lucide-react";

const { Panel } = Collapse;

export function GuestPage() {
    const infoRef = useRef(null);
    const faqRef = useRef(null);

    const handleMenuClick = (key) => {
        if (key === "2" && infoRef.current) {
            infoRef.current.scrollIntoView({ behavior: "smooth" });
        }
        if (key === "3" && faqRef.current) {
            faqRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const faqData = [
        {
            question: "1. Khi ở KTX cần lưu ý điều gì?",
            answer: (
                <div className="space-y-3">
                    <p>Ký túc xá có một số điều cần lưu ý khi ở như sau:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Không được nuôi vật nuôi, thú cưng (chó, mèo,...).</li>
                        <li>Không được uống rượu, bia, chơi cờ bạc, sử dụng các chất kích thích và chất cấm.</li>
                        <li>Không được nấu ăn trong ký túc xá.</li>
                        <li>Không được đưa người lạ không ở trong ký túc xá vào phòng sau giờ giới nghiêm.</li>
                        <li>Giờ giới nghiêm trong ký túc xá là sau 10 giờ 30 phút tối.</li>
                        <li>Giữ gìn vệ sinh chung và đổ rác trước 9 giờ sáng.</li>
                    </ul>
                    <p className="text-orange-600 font-medium">Tất cả các lỗi vi phạm đều bị trừ dựa trên điểm uy tín dựa trên mức độ lỗi vi phạm.</p>
                </div>
            )
        },
        {
            question: "2. Thời hạn lưu trú và thông tin phòng ở (FPTU HN)",
            answer: (
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-orange-500 mb-2">Thời hạn lưu trú các kỳ:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Kỳ Spring: Tháng 1 – tháng 4</li>
                            <li>Kỳ Summer: Tháng 5 – tháng 8</li>
                            <li>Kỳ Fall: Tháng 9 – tháng 12</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-orange-500 mb-2">Phụ trội Điện nước/kỳ:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Định mức miễn phí: 200 số Điện & 12 số nước</li>
                            <li>Dùng vượt định mức: Nộp phí phụ trội</li>
                            <li>Đơn giá: 2,500đ/số điện, 10,000đ/số nước</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-orange-500 mb-2">Thông tin phòng ở:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Kích thước giường: 2000X900mm (Dom CDFH), 1930x900mm (Dom AB)</li>
                            <li>CSVC cung cấp: Giường tầng, tủ đồ, tủ giày, bàn học (tùy loại phòng), giá phơi quần áo</li>
                            <li>Thiết bị: Đèn chiếu sáng, điều hòa, bình nóng lạnh</li>
                            <li>Dịch vụ nhà trường cung cấp: ăn uống, tiện ích (giặt là, cắt tóc, siêu thị, phòng gym): phí SV tự túc</li>
                            <li>Internet: KTX không trực tiếp cung cấp. Hỗ trợ hạ tầng cho các nhà mạng FPT telecom, Viettel cung cấp dịch vụ cho SV</li>
                            <li>Điểm tiếp nhận đăng ký mạng: Phòng trực Dom C hoặc liên hệ hotline đặt tại sảnh các Dom</li>
                            <li>Đồ dùng cá nhân: sinh viên tự trang bị như chăn, màn, ga, gối, đệm,....</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            question: "3. Điểm uy tín là gì?",
            answer: (
                <div className="space-y-2">
                    <p><strong>Điểm uy tín (Credibility in FPT Dormitory - CFD score)</strong> là một trong những yếu tố để tạo ra môi trường KTX văn minh và lành mạnh hơn.</p>
                    <p>Điểm uy tín là tiêu chí để đánh giá ý thức của sinh viên khi sử dụng dịch vụ ký túc xá. Điểm uy tín thay đổi dựa theo những hành vi, hoạt động và sự đóng góp của sinh viên trong suốt thời gian ở ký túc xá.</p>
                    <p>Điểm uy tín sẽ được tăng, giảm tương ứng theo các quy định đã được đề ra trong nội quy KTX.</p>
                    <p className="text-orange-600 font-medium">Điểm uy tín là một trong những tiêu chí được dùng để xét duyệt xem sinh viên có được sử dụng ký túc xá trong kỳ hay không.</p>
                </div>
            )
        },
        {
            question: "4. Làm thế nào để gửi yêu cầu tới Ban Quản lý KTX?",
            answer: (
                <div className="space-y-2">
                    <p className="font-medium">Các bước thực hiện:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Vào chức năng <strong>My request</strong>.</li>
                        <li>Bấm vào nút <strong>Create new request</strong> → Chọn loại yêu cầu (Type request) thích hợp.</li>
                        <li>Điền nội dung của yêu cầu ở phần <strong>Content</strong>.</li>
                        <li>Bấm vào nút <strong>Create request</strong>.</li>
                    </ol>
                </div>
            )
        },
        {
            question: "5. Làm thế nào để báo cáo sửa chữa đồ dùng trong phòng?",
            answer: (
                <div className="space-y-2">
                    <p className="font-medium">Các bước thực hiện:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Vào chức năng <strong>My request</strong>.</li>
                        <li>Bấm vào nút <strong>Create new request</strong> → Chọn <strong>Báo cáo vấn đề kỹ thuật</strong> ở mục Type request.</li>
                        <li>Hệ thống sẽ dẫn tới trang <a href="https://cim.fpt.edu.vn/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://cim.fpt.edu.vn/</a></li>
                        <li>Điền những thông tin cần thiết và gửi ảnh tình trạng thiết bị (trên hệ thống CIM).</li>
                        <li>Bấm vào nút <strong>Create</strong> (trên hệ thống CIM).</li>
                    </ol>
                </div>
            )
        },
        {
            question: "6. Thông tin liên lạc của bảo vệ và y tế là gì?",
            answer: (
                <div className="space-y-2">
                    <p className="font-semibold text-orange-500">Thông tin liên lạc của phòng bảo vệ và phòng y tế (24/7):</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Phòng bảo vệ: <strong>(024) 668 05913</strong></li>
                        <li>Phòng y tế: <strong>(024) 668 05917</strong></li>
                    </ul>
                    <p className="text-gray-600 italic mt-3">Thông tin chi tiết và cụ thể hơn, sinh viên cần Đăng nhập và xem thêm ở trang Home.</p>
                </div>
            )
        }
    ];

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
                        { key: "3", label: "FAQ", icon: <QuestionCircleOutlined /> },
                    ]}
                />
                <div className="flex gap-2">
                    <Link to={"/login"}><Button type="default" icon={<LoginOutlined />}>Đăng Nhập</Button></Link>
                    {/*<Link to={"/register"}><Button type="default" icon={<UserPlus size={14} />}>Đăng ký</Button></Link>*/}
                </div>
            </Header>

            <Content className="p-8 bg-gray-50">
                <div className="text-center py-12">
                    <h1 className="text-5xl font-bold text-orange-500 mb-6">
                        Chào mừng đến với Ký Túc Xá
                    </h1>
                    <p className="text-gray-600 text-xl max-w-3xl mx-auto">
                        Quản lý chỗ ở, khám phá cơ sở vật chất ký túc xá và cập nhật những
                        tin tức mới nhất.
                    </p>
                    <div className="mt-8">
                        {/*<Button size="large">Xem Tin Tức</Button>*/}
                    </div>
                </div>

                <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <Card
                        className="shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 border-0"
                        bodyStyle={{padding: '32px'}}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-5">
                                <Building2 className="text-orange-500" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Thông Tin Ký Túc Xá</h3>
                            <p className="text-gray-600 text-base leading-relaxed">
                                Tìm hiểu về cơ sở vật chất, phòng ở và dịch vụ được thiết kế để
                                mang lại môi trường sống thoải mái cho sinh viên.
                            </p>
                        </div>
                    </Card>

                    <Card
                        className="shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 border-0"
                        bodyStyle={{padding: '32px'}}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-5">
                                <Bell className="text-blue-500" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Thông Báo</h3>
                            <p className="text-gray-600 text-base leading-relaxed">
                                Luôn cập nhật các tin tức, nội quy ký túc xá và các sự kiện sắp
                                tới để không bỏ lỡ thông tin quan trọng.
                            </p>
                        </div>
                    </Card>

                    <Card
                        className="shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300 border-0"
                        bodyStyle={{padding: '32px'}}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
                                <Headset className="text-green-500" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Liên Hệ Hỗ Trợ</h3>
                            <p className="text-gray-600 text-base leading-relaxed">
                                Cần hỗ trợ? Hãy liên hệ với ban quản lý ký túc xá để được giúp
                                đỡ nhanh chóng và hiệu quả.
                            </p>
                        </div>
                    </Card>
                </div>

                <Carousel
                    arrows
                    dots
                    autoplay
                    className="max-w-5xl mx-auto mb-12 rounded-xl overflow-hidden shadow-lg"
                >
                    <div>
                        <img
                            src={banner1}
                            alt="Ký túc xá"
                            className="w-full h-[500px] object-cover"
                        />
                    </div>
                    <div>
                        <img
                            src={banner2}
                            alt="Sinh viên"
                            className="w-full h-[500px] object-cover"
                        />
                    </div>
                </Carousel>
            </Content>

            {/* PHẦN GIỚI THIỆU */}
            <section ref={infoRef} className="max-w-6xl mx-auto py-16 space-y-12 px-6">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-orange-500 mb-5">
                        Thông tin Ký túc xá Đại học
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Để biết thêm chi tiết về KTX, các bạn có thể truy cập vào file PDF
                        để tìm hiểu thêm.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <p className="text-gray-700 mb-4 text-base leading-relaxed">
                            Trường Đại học X là một trong những ngôi trường nổi tiếng đào tạo
                            đa ngành với chất lượng đào tạo đạt chuẩn quốc tế. Nhà trường
                            quan tâm cả đời sống sinh viên bằng việc đầu tư khu Ký túc xá hiện
                            đại, sạch sẽ và đầy đủ tiện nghi.
                        </p>
                        <p className="text-gray-700 text-base leading-relaxed">
                            KTX được xem như ngôi nhà thứ hai của sinh viên, giúp tạo không
                            gian học tập và sinh hoạt thoải mái, an toàn.
                        </p>
                    </div>
                    <img src={ktx1} alt="Ký túc xá" className="rounded-lg shadow-md w-full" />
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <img src={ktx2} alt="Ký túc xá" className="rounded-lg shadow-md w-full" />
                    <div>
                        <p className="text-orange-500 font-semibold text-lg mb-3">
                            Ký túc xá là chỗ ở dành riêng cho sinh viên của Đại học.
                        </p>
                        <p className="text-gray-700 text-base leading-relaxed">
                            Với vị trí thuận lợi, sinh viên dễ dàng di chuyển giữa khu học và
                            khu ở, tiết kiệm chi phí và có môi trường sinh hoạt, học tập hiện
                            đại.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <p className="text-orange-500 font-semibold text-lg mb-3">
                            Thiết kế hiện đại, thoáng mát và đầy đủ tiện nghi
                        </p>
                        <p className="text-gray-700 text-base leading-relaxed">
                            Mỗi phòng có wifi, máy giặt sấy, máy bán nước, điều hòa, giường
                            tầng, bàn học, tủ đựng đồ, nhà vệ sinh riêng... đảm bảo sinh viên
                            cảm thấy như ở nhà.
                        </p>
                    </div>
                    <img src={ktx3} alt="Ký túc xá" className="rounded-lg shadow-md w-full" />
                </div>
            </section>

            {/* PHẦN FAQ */}
            <section ref={faqRef} className="bg-gray-50 py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-bold text-orange-500 mb-5">
                            Câu hỏi thường gặp (FAQ)
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Tìm câu trả lời cho những thắc mắc phổ biến về ký túc xá
                        </p>
                    </div>

                    <Collapse
                        accordion
                        className="bg-transparent"
                        bordered={false}
                        expandIconPosition="end"
                    >
                        {faqData.map((faq, index) => (
                            <Panel
                                header={<span className="font-semibold text-lg">{faq.question}</span>}
                                key={index}
                                className="mb-4 bg-white rounded-lg shadow-md"
                            >
                                <div className="text-gray-700 pl-4 text-base">
                                    {faq.answer}
                                </div>
                            </Panel>
                        ))}
                    </Collapse>

                    <div className="mt-10 text-center bg-white rounded-lg shadow-md p-8">
                        <p className="text-gray-600 mb-5 text-lg">
                            Có câu hỏi khác? Hãy đăng nhập để được hỗ trợ thêm!
                        </p>
                        <Link to="/login">
                            <Button type="primary" size="large" className="bg-orange-500 hover:bg-orange-600 border-0 h-12 px-8 text-base">
                                Đăng nhập ngay
                            </Button>
                        </Link>
                    </div>
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