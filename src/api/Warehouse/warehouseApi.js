import axiosClient from "../axiosClient/axiosClient";

const RESOURCE = "/warehouse-items";

export const warehouseItemApi = {
    // Get all warehouse items
    getAllWarehouseItems: async () => {
        try {
            const response = await axiosClient.get(RESOURCE);
            return response;
        } catch (error) {
            console.error('Error fetching warehouse items:', error);
            throw error;
        }
    },

    // Create new warehouse item
    createWarehouseItem: async (warehouseItemData) => {
        try {
            const response = await axiosClient.post(RESOURCE, warehouseItemData);
            return response;
        } catch (error) {
            console.error('Error creating warehouse item:', error);
            throw error;
        }
    },

    // Update warehouse item
    updateWarehouseItem: async (id, updateData) => {
        try {
            const response = await axiosClient.put(`${RESOURCE}/${id}`, updateData);
            return response;
        } catch (error) {
            console.error('Error updating warehouse item:', error);
            throw error;
        }
    },

    // Get warehouse item by ID
    getWarehouseItemById: async (id) => {
        try {
            const response = await axiosClient.get(`${RESOURCE}/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching warehouse item:', error);
            throw error;
        }
    },

    // Get warehouse history (you'll need to implement this endpoint in the backend)
    getWarehouseHistory: async (filters = {}) => {
        try {
            const response = await axiosClient.get(`${RESOURCE}/history`, { params: filters });
            return response;
        } catch (error) {
            console.error('Error fetching warehouse history:', error);
            throw error;
        }
    }
};

export default warehouseItemApi;
