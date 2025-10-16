/**
 * @param {string} time
 * @returns {string}
 */
export function formatTime(time) {
    return Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
    }).format(new Date(time));
}