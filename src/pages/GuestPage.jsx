import {Button, Card, Carousel, Layout, Menu} from "antd";
import {AppstoreOutlined, HomeOutlined, InfoCircleOutlined, LoginOutlined} from "@ant-design/icons";
import {Link} from "react-router-dom";
import React from "react";
import {Content, Footer, Header} from "antd/es/layout/layout.js";

export function GuestPage() {
    return <>
        <Layout className="min-h-screen">
            <Header className="flex justify-between items-center !bg-white shadow px-6">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-xl text-orange-500">
            FPT Dormitory
          </span>
                </div>
                <Menu
                    mode="horizontal"
                    className="hidden md:flex flex-grow justify-center border-0"
                    items={[{key: "1", label: "Home", icon: <HomeOutlined/>}, {
                        key: "2", label: "About", icon: <InfoCircleOutlined/>
                    }, {key: "3", label: "Services", icon: <AppstoreOutlined/>},]}
                />
                <div className="flex gap-2">
                    <Button type="default" icon={<LoginOutlined/>}>
                        <Link to={"/login"}>Login</Link>
                    </Button>
                    <Button>
                        <Link to={"/register"}>Register</Link>
                    </Button>
                </div>
            </Header>
            <Content className="p-6 bg-gray-50">
                <div className="text-center py-10">
                    <h1 className="text-4xl font-bold text-orange-500 mb-4">
                        Welcome to FPT Dormitory
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Manage your stay, explore dormitory facilities, and stay updated
                        with the latest news.
                    </p>
                    <div className="mt-6">
                        <Button size="large">View News</Button>
                    </div>
                </div>

                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card
                        title="Dormitory Info"
                        variant={"outlined"}
                        className="shadow-md rounded-xl"
                    >
                        <p>
                            Learn about our dorm facilities, rooms, and services designed to
                            provide students with a comfortable living environment.
                        </p>
                    </Card>
                    <Card
                        title="Announcements"
                        variant={"outlined"}
                        className="shadow-md rounded-xl"
                    >
                        <p>
                            Stay up to date with the latest news, dormitory regulations, and
                            upcoming events.
                        </p>
                    </Card>
                    <Card
                        title="Contact Us"
                        variant={"outlined"}
                        className="shadow-md rounded-xl"
                    >
                        <p>
                            Need help? Reach out to the dormitory management team for
                            assistance and support.
                        </p>
                    </Card>
                </div>
                <Carousel arrows dots autoplay className="max-w-4xl mx-auto mb-10 rounded-xl overflow-hidden shadow">
                    <div>
                        <img
                            src="https://lipsum.app/1000x800/888/fff"
                            alt="Dormitory"
                            className="w-full h-[400px] object-cover"
                        />
                    </div>
                    <div>
                        <img
                            src="https://lipsum.app/1000x800/888/fff"
                            alt="Students"
                            className="w-full h-[400px] object-cover"
                        />
                    </div>
                </Carousel>
            </Content>
            <Footer className="text-center bg-white shadow-inner">
                <p className="text-gray-500">
                    © {new Date().getFullYear()} FPT Dormitory Management System. All
                    rights reserved.
                </p>
            </Footer>
        </Layout>
    </>
}