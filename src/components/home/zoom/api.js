import { API_HOST } from "../../../shared/constant";
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

const createAuthHeader = (token) => ({
    ...headers,
    Authorization: `Bearer ${token}`
});

export const makeRequest = async (method, url, data = {}, token = null, timeout = 0) => {
    try {
        const config = {
            headers: token ? createAuthHeader(token) : headers
        };
        if (timeout) config.timeout = timeout;

        const response = method === 'get'
            ? await axios.get(url, config)
            : await axios.post(url, data, config);
        return response.data;
    } catch (error) {
        console.error("Zoom API error", error);
        return handleAxiosError(error);
    }
};

export const fetchContacts = (token) =>
    makeRequest('post', `${API_HOST}/zoom/get_contacts`, {}, token);

export const searchContacts = (data, token) =>
    makeRequest('post', `${API_HOST}/zoom/search_contact`, data, token);

export const addContact = (data, token) =>
    makeRequest('post', `${API_HOST}/zoom/add_contact`, data, token);

export const joinChat = (data, token) =>
    makeRequest('post', `${API_HOST}/zoom/join_chat`, data, token);

export const sendMessage = (data, token) =>
    makeRequest('post', `${API_HOST}/zoom/send_message`, data, token);

export const getMessages = (data, token) =>
    makeRequest('post', `${API_HOST}/zoom/get_message_by_contact`, data, token);

export const endCall = (data, token) =>
    makeRequest('post', `${API_HOST}/zoom/end_call`, data, token);

export const initRoom = (data, token) =>
    makeRequest('post', `${API_HOST}/zoom/init_room`, data, token);

export const joinRoom = (data, token) =>
    makeRequest('post', `${API_HOST}/zoom/join_room`, data, token); 

export const answerCall = (data, token) =>
    makeRequest('post', `${API_HOST}/zoom/answer_call`, data, token);

export const getWebviewURL = (data, token) =>
    makeRequest('post', `${API_HOST}/zoom/get_webview_url`, data, token);

export const postTyping = (data, token) =>
    makeRequest('post', `${API_HOST}/zoom/typing`, data, token);

export const fetchFavorites = (token) =>
    makeRequest('post', `${API_HOST}/zoom/get_favorites`, {}, token);

export const toggleFavorite = (data, token) =>
    makeRequest('post', `${API_HOST}/zoom/toggle_favorite`, data, token);

export const onFindChatSocial = (param, token) => {
    return makeRequest('post', `${API_HOST}/zoom/find_chat_social`, param, token);
};
// New API Server


