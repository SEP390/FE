import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const surveyApi = {
 
  getAll: async (token) => {
    try {
      const res = await axios.get(`${API_URL}/surveys`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (err) {
      console.error("Error fetching surveys:", err);
      return { status: 500, message: "Error fetching surveys" };
    }
  },

 
  getById: async (id, token) => {
    try {
      const res = await axios.get(`${API_URL}/surveys/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (err) {
      console.error("Error fetching survey:", err);
      return { status: 500, message: "Error fetching survey" };
    }
  },
};