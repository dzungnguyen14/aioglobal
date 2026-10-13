import { API_HOST } from "../shared/constant";
import axios from "axios";

// Configure axios interceptors
axios.interceptors.request.use(request => request);

axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        return Promise.reject(error);
    }
);

const headers = {
    'Content-Type': 'application/json'
};

const handleAxiosError = (error) => ({
    success: false,
    msg: error.response?.data?.msg || JSON.stringify(error)
});

export const login = async (data) => {
    try {
        const response = await axios.post(API_HOST + "/auth/login", data, {
            headers,
            timeout: 10000
        });
        console.log("Login response:", API_HOST + "/auth/login", response.data);
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const register = async (data) => {
    try {
        const response = await axios.post(API_HOST + "/auth/register", data, {
            headers,
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const forgotPassword = async (data) => {
    try {
        const response = await axios.post(API_HOST + "/auth/forgot_password", data, { headers });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const resetPassword = async (data) => {
    try {
        const response = await axios.post(API_HOST + "/auth/reset_password", data, { headers });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const verifyOTP = async (data) => {
    try {
        const response = await axios.post(API_HOST + "/auth/verify_otp", data, { headers });
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};