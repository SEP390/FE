import { useState, useEffect } from 'react';
import { useApi } from './useApi';

export function useSemester() {
    const [currentSemester, setCurrentSemester] = useState(null);
    const [localError, setLocalError] = useState(null);

    // 🔥 Sử dụng đúng pattern của useApi - lấy data từ state
    const { get, data, isLoading, isError, error, isSuccess } = useApi();

    useEffect(() => {
        // Gọi API lấy semester
        get('semesters/current');
    }, []);

    // 🔥 Effect để xử lý khi có data từ API
    useEffect(() => {
        if (isSuccess && data) {
            console.log('✅ Semester data received:', data);

            // Kiểm tra cấu trúc response
            if (data.status === 200 && data.data) {
                setCurrentSemester(data.data);
                setLocalError(null);
            } else if (data.id) {
                // Trường hợp API trả về trực tiếp object semester
                setCurrentSemester(data);
                setLocalError(null);
            } else {
                setLocalError('Không tìm thấy học kỳ hiện tại');
            }
        }
    }, [isSuccess, data]);

    // 🔥 Effect để xử lý lỗi
    useEffect(() => {
        if (isError && error) {
            console.error('❌ Error fetching semester:', error);
            setLocalError(error);
            setCurrentSemester(null);
        }
    }, [isError, error]);

    return {
        currentSemester,
        loading: isLoading,
        error: localError || error
    };
}