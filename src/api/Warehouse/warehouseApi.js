import axiosClient from "../axiosClient/axiosClient";

const WAREHOUSE_RESOURCE = "/warehouse-items";
const TRANSACTION_RESOURCE = "/warehouse_transactions"; // ⬅️ Thêm dòng này

export const warehouseItemApi = {
    // Get all warehouse items
    getAllWarehouseItems: async () => {
        try {
            const response = await axiosClient.get(WAREHOUSE_RESOURCE);
            return response;
        } catch (error) {
            console.error('Error fetching warehouse items:', error);
            throw error;
        }
    },

    // Create new warehouse item
    createWarehouseItem: async (warehouseItemData) => {
        try {
            const response = await axiosClient.post(WAREHOUSE_RESOURCE, warehouseItemData);
            return response;
        } catch (error) {
            console.error('Error creating warehouse item:', error);
            throw error;
        }
    },

    // Update warehouse item
    updateWarehouseItem: async (id, updateData) => {
        try {
            const response = await axiosClient.put(`${WAREHOUSE_RESOURCE}/${id}`, updateData);
            return response;
        } catch (error) {
            console.error('Error updating warehouse item:', error);
            throw error;
        }
    },

    // Get warehouse item by ID
    getWarehouseItemById: async (id) => {
        try {
            const response = await axiosClient.get(`${WAREHOUSE_RESOURCE}/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching warehouse item:', error);
            throw error;
        }
    },

    // Get warehouse history
    getWarehouseHistory: async (filters = {}) => {
        try {
            const response = await axiosClient.get(`${WAREHOUSE_RESOURCE}/history`, { params: filters });
            return response;
        } catch (error) {
            console.error('Error fetching warehouse history:', error);
            throw error;
        }
    },
    // Get all warehouse transactions
    getAllWarehouseTransaction: async () => {
        try {
            const response = await axiosClient.get(TRANSACTION_RESOURCE);
            return response;
        } catch (error) {
            console.error('Error fetching warehouse transactions:', error);
            throw error;
        }
    },
    // Create warehouse transaction (import/export)
    createWarehouseTransaction: async (transactionData) => {
        try {
            // ⬇️ Thay đổi từ `${RESOURCE}/transactions` thành TRANSACTION_RESOURCE
            const response = await axiosClient.post(TRANSACTION_RESOURCE, transactionData);
            return response;
        } catch (error) {
            console.error('Error creating warehouse transaction:', error);
            throw error;
        }
    }
};

export default warehouseItemApi;