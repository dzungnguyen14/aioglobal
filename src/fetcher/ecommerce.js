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

const createAuthHeader = (token, isFormData = false) => ({
    ...headers,
    Authorization: `Bearer ${token}`,
    ...(isFormData && { 'Content-Type': 'multipart/form-data' })
});

const makeRequest = async (method, url, data = {}, token = null, timeout = 0, isFormData = false) => {
    try {
        const config = {
            headers: token ? createAuthHeader(token, isFormData) : headers
        };
        if (timeout) config.timeout = timeout;
        const response = method === 'get'
            ? await axios.get(url, config)
            : await axios.post(url, data, config);
        
        return response.data;
    } catch (error) {
        return handleAxiosError(error);
    }
};

export const fetchCategory = (token) =>
    makeRequest('post', `${API_HOST}/shop/category`, {}, token);

export const fetchProducts = (data, token) =>
    makeRequest('post', `${API_HOST}/shop/products`, data, token);

export const fetchEcommerceHistory = (params, token) =>
    makeRequest('post', `${API_HOST}/shop/history`, params, token);

export const fetchCart = (params, token) =>
    makeRequest('post', `${API_HOST}/shop/cart`, params, token);

export const fetchPaymentConfigs = (token) =>
    makeRequest('post', `${API_HOST}/shop/configs`, {}, token);

export const fetchCalculateFare = (params, token) =>
    makeRequest('post', `${API_HOST}/shop/fare`, params, token);

export const fetchCheckAuth = (params, token) =>
    makeRequest('post', `${API_HOST}/shop/check_auth`, params, token);

export const fetchProductDetail = (params, token) =>
    makeRequest('post', `${API_HOST}/shop/product_detail`, params, token);

export const createEcommerceOrder = (params, token) =>
    makeRequest('post', `${API_HOST}/shop/order`, params, token);