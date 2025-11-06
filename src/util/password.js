// Nội dung cho file util/password.js

/**
 * Tạo một mật khẩu ngẫu nhiên theo yêu cầu:
 * - 4 ký tự thường
 * - 1 ký tự hoa
 * - 1 ký tự đặc biệt
 * (Tổng cộng 6 ký tự, đã được xáo trộn)
 */
export const generateRandomPassword = () => {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const specialChars = '!@#$%^&*_+-='; // Bạn có thể thêm/bớt ký tự

    // Hàm trợ giúp để lấy 1 ký tự ngẫu nhiên từ chuỗi
    const getRandomChar = (charset) => {
        return charset[Math.floor(Math.random() * charset.length)];
    };

    let passwordArray = [];

    // 1. Thêm 4 ký tự thường
    for (let i = 0; i < 4; i++) {
        passwordArray.push(getRandomChar(lowercaseChars));
    }

    // 2. Thêm 1 ký tự hoa
    passwordArray.push(getRandomChar(uppercaseChars));

    // 3. Thêm 1 ký tự đặc biệt
    passwordArray.push(getRandomChar(specialChars));

    // 4. Xáo trộn mảng
    passwordArray.sort(() => Math.random() - 0.5);

    // 5. Trả về chuỗi mật khẩu
    return passwordArray.join('');
};