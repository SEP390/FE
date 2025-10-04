import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Trả về dạng thống nhất { ok, data, message }
export const authApi = async (payload) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth`, payload);
    // Giả sử backend trả { token, fullName, ... }
    return { ok: true, data: res.data, message: "OK" };
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Request failed";
    return { ok: false, data: null, message };
  }
};