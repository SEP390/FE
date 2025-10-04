import React, { useState } from "react";
import { Card, Radio, Checkbox, Button, message } from "antd";

function Survey() {
    const [formData, setFormData] = useState({
        sleepTime: "",
        drinkAlcohol: "",
        currentAbility: [],
    });

    const handleRadioChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (name, value, checked) => {
        setFormData((prev) => ({
            ...prev,
            [name]: checked
                ? [...prev[name], value]
                : prev[name].filter((item) => item !== value),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Survey Data:", formData);
        message.success("Cảm ơn bạn đã tham gia khảo sát!");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white flex items-center justify-center py-16 px-6">
            <Card
                className="w-full max-w-3xl border border-gray-200 rounded-2xl shadow-xl bg-white"
                title={
                    <h2
                        className="text-center text-3xl font-semibold text-gray-800"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                        📝 Khảo sát thói quen hằng ngày
                    </h2>
                }
                headStyle={{
                    backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                    padding: "24px",
                }}
                bodyStyle={{ padding: "40px" }}
            >
                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Câu hỏi 1 */}
                    <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-sm transition-shadow duration-200">
                        <label
                            className="block text-gray-800 font-medium text-lg mb-5"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                            🕒 Bạn thường đi ngủ lúc mấy giờ?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-6">
                            <Radio
                                checked={formData.sleepTime === "before10"}
                                onChange={() => handleRadioChange("sleepTime", "before10")}
                            >
                                Trước 22h
                            </Radio>
                            <Radio
                                checked={formData.sleepTime === "around10"}
                                onChange={() => handleRadioChange("sleepTime", "around10")}
                            >
                                22h - 00h
                            </Radio>
                            <Radio
                                checked={formData.sleepTime === "after00"}
                                onChange={() => handleRadioChange("sleepTime", "after00")}
                            >
                                Sau 00h
                            </Radio>
                        </div>
                    </div>

                    {/* Câu hỏi 2 */}
                    <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-sm transition-shadow duration-200">
                        <label
                            className="block text-gray-800 font-medium text-lg mb-5"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                            🍺 Bạn có uống rượu/bia không?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                            <Radio
                                checked={formData.drinkAlcohol === "yes"}
                                onChange={() => handleRadioChange("drinkAlcohol", "yes")}
                            >
                                Có
                            </Radio>
                            <Radio
                                checked={formData.drinkAlcohol === "no"}
                                onChange={() => handleRadioChange("drinkAlcohol", "no")}
                            >
                                Không
                            </Radio>
                        </div>
                    </div>

                    {/* Câu hỏi 3 */}
                    <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-sm transition-shadow duration-200">
                        <label
                            className="block text-gray-800 font-medium text-lg mb-5"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                            🚶‍♂️ Khả năng đi lại của bạn hiện tại thế nào?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                            <Checkbox
                                checked={formData.currentAbility.includes("normal")}
                                onChange={(e) =>
                                    handleCheckboxChange("currentAbility", "normal", e.target.checked)
                                }
                            >
                                Hoạt động bình thường
                            </Checkbox>
                            <Checkbox
                                checked={formData.currentAbility.includes("difficulty")}
                                onChange={(e) =>
                                    handleCheckboxChange("currentAbility", "difficulty", e.target.checked)
                                }
                            >
                                Gặp khó khăn khi đi lại
                            </Checkbox>
                        </div>
                    </div>

                    {/* Nút Submit */}
                    <div className="text-center">
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="bg-blue-600 border-none hover:bg-blue-700 transition-colors duration-300 text-white font-semibold rounded-xl shadow-md"
                            style={{ fontFamily: "Poppins, sans-serif" }}
                        >
                            Gửi khảo sát
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

export default Survey;
