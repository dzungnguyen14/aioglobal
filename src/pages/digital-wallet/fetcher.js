import axios from "axios";
import { API_HOST } from "../../shared/constant";
import { makeRequest } from "../../fetcher/api";

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
    'Content-Type': 'application/x-www-form-urlencoded'
};

const handleAxiosError = (error) => ({
    success: false,
    msg: error.response?.data?.msg || JSON.stringify(error)
});

const createAuthHeader = (token) => ({
    ...headers,
    Authorization: `Bearer ${token}`
});

// Convert object to URL-encoded string
const encodeFormData = (data) => {
    if (!data || Object.keys(data).length === 0) return '';
    const params = new URLSearchParams();
    Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
            params.append(key, data[key]);
        }
    });
    return params.toString();
};

const makeFormRequest = async (method, url, data = {}, token = null, timeout = 0) => {
    try {
        const config = {
            headers: token ? createAuthHeader(token) : headers
        };
        if (timeout) config.timeout = timeout;
        
        const encodedData = method === 'post' ? encodeFormData(data) : data;
        
        const response = method === 'get'
            ? await axios.get(url, config)
            : await axios.post(url, encodedData, config);
        
        return response.data;
    } catch (error) {
        console.error('API request error:', error); 
        return handleAxiosError(error);
    }
};

// Wallet API base URL
const WALLET_ENDPOINT = `https://admin.alowallet.net/api/v1`;
// API endpoints
const CHECK_ONBOARD_WALLET = `${API_HOST}/wallet/check_onboard_wallet`;
const UPDATE_ONBOARD_WALLET = `${API_HOST}/wallet/completed_onboard_wallet`;
const GET_BANK_LIST = `${API_HOST}/wallet/get_bank_list`;
// Wallet endpoints
const REGISTER_WALLET_ACCOUNT = `${WALLET_ENDPOINT}/blockchain/user/register`;
const LOGIN_WALLET_ACCOUNT = `${WALLET_ENDPOINT}/blockchain/user/login`;
const GET_LIST_TOKEN = `${WALLET_ENDPOINT}/blockchain/user/wallet/token-list`;
const GET_TOKENS = `${WALLET_ENDPOINT}/blockchain/user/token-list`;
const SYNC_TRANSACTION_BSC = `${WALLET_ENDPOINT}/blockchain/user/wallet/sync-transaction-bsc`;
const SYNC_TRANSACTION_TRX = `${WALLET_ENDPOINT}/blockchain/user/wallet/sync-transaction-trx`;
const GET_ALL_TRANSACTION = `${WALLET_ENDPOINT}/blockchain/user/wallet/transactions`;
const CREATE_ORDER_TRANSACTION = `${WALLET_ENDPOINT}/blockchain/user/create-order-by-fiat`;
const VND_RATE_EXCHANGE = `${WALLET_ENDPOINT}/blockchain/user/fiats`;
const BANK_LIST = `${WALLET_ENDPOINT}/blockchain/user/bank-list`;
const GET_USER_INFO = `${WALLET_ENDPOINT}/blockchain/user/me`;
const CHECK_IF_EXIST_EMAIL = `${WALLET_ENDPOINT}/blockchain/user/check-email-exist`;
const CHANGE_PASSWORD = `${WALLET_ENDPOINT}/blockchain/user/change-password`;
const FORGOT_PASSWORD = `${WALLET_ENDPOINT}/blockchain/user/forgot-password`;
const KYC_REQUEST = `${WALLET_ENDPOINT}/blockchain/user/kyc-request`;
const UPLOAD_FILE = `${WALLET_ENDPOINT}/blockchain/file/upload`;
const GET_ACCOUNT_INFO = `${WALLET_ENDPOINT}/blockchain/user/me`;

export const checkOnboardWallet = (token) =>
    makeRequest('post', `${CHECK_ONBOARD_WALLET}`, {}, token);

export const getBankList = (token) =>
    makeRequest('get', `${GET_BANK_LIST}`, {}, token);

export const registerWalletAccount = async (data) => {
    try {
        const response = await fetch(REGISTER_WALLET_ACCOUNT, {
            method: "POST",
            body: data.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            redirect: "follow"
        });
        return response.json();
    } catch (error) {
        console.error('API request error:', error); 
        return handleAxiosError(error);
    }
}

export const loginWalletAccount = async (data) => {
    try {
        const response = await fetch(LOGIN_WALLET_ACCOUNT, {
            method: "POST",
            body: data.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            redirect: "follow"
        });
        return response.json();
    } catch (error) {
        console.error('API request error:', error); 
        return handleAxiosError(error);
    }
}

export const createOrderTransaction = async (data, token) => {
    try {
        const response = await fetch(CREATE_ORDER_TRANSACTION, {
            method: "POST",
            body: data.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${token}`
            },
            redirect: "follow"
        });
        return response.json();
    } catch (error) {
        console.error('API request error:', error); 
        return handleAxiosError(error);
    }
}


export const getTokens = (token) =>
    makeFormRequest('get', `${GET_TOKENS}`, {}, token);
    
export const getListToken = (token) =>
    makeFormRequest('get', `${GET_LIST_TOKEN}`, {}, token);
    
export const syncTransactionBSC = ( token) =>
    makeFormRequest('get', `${SYNC_TRANSACTION_BSC}`, {}, token);
    
export const syncTransactionTRX = ( token) =>
    makeFormRequest('get', `${SYNC_TRANSACTION_TRX}`, {}, token);

export const getAllTransaction = ( token) =>
    makeFormRequest('get', `${GET_ALL_TRANSACTION}`, {}, token);

export const getUserInfo = (data, token) =>
    makeFormRequest('post', `${GET_USER_INFO}`, data, token);

export const getVNDRateExchange = (token) =>
    makeFormRequest('get', `${VND_RATE_EXCHANGE}`, {}, token);  

export const checkIfExistEmail = (email) =>
    makeRequest('get', `${CHECK_IF_EXIST_EMAIL}?email=${email}`);

export const changePassword = async (data, token) => {
    try {
        const response = await fetch(CHANGE_PASSWORD, {
            method: "POST",
            body: data.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${token}`
            },
            redirect: "follow"
        });
        return response.json();
    } catch (error) {
        console.error('API request error:', error); 
        return handleAxiosError(error);
    }
};

export const forgotPassword = async (data) => {
    try {
        const response = await fetch(FORGOT_PASSWORD, {
            method: "POST",
            body: data.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow"
        });
        return response.json();
    } catch (error) {
        console.error('API request error:', error); 
        return handleAxiosError(error);
    }
};


export const createKYCRequest = async (data, token) => {
    try {
        const response = await fetch(KYC_REQUEST, {
            method: "POST",
            body: data.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${token}`
            },
            redirect: "follow"
        });
        return response.json();
    } catch (error) {
        console.error('API request error:', error); 
        return handleAxiosError(error);
    }
};


export const uploadFile = async (data, token) => {
    try {
        // Construct headers similar to the given postman example,
        // but use the provided token and point to UPLOAD_FILE
        const myHeaders = new Headers();
        myHeaders.append("accept", "application/json");
        myHeaders.append("authorization", `Bearer ${token}`);

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: data,
            redirect: "follow"
        };

        const response = await fetch(UPLOAD_FILE, requestOptions);
        const resp = await response.json();
        return {
            success: !resp.error,
            msg: resp.mesg,
            files: resp.data.files
        }
    } catch (error) {
        console.error('API request error:', JSON.stringify(error)); 
        return handleAxiosError(error);
    }
};

export const getAccountInfo = ( token) =>
    makeFormRequest('get', `${GET_ACCOUNT_INFO}`, {}, token);
    
