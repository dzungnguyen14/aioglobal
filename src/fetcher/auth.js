import { API_HOST } from "../shared/constant";
import axios from "axios";
import { handleAxiosError } from "./error";
import "./retry";

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



export const login = async (data) => {
    try {
        const response = await axios.post(API_HOST + "/auth/login", data, {
            headers,
            timeout: 10000,
            // Login has no side effect if sent twice, so a stale-connection failure is retried once.
            retryOnNetworkError: true
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