import { API_HOST } from "../shared/constant";
import axios from "axios";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

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

export const makeRequest = async (method, url, data = {}, token = null, timeout = 0, isFormData = false) => {
    console.log(url);
    try {
        const config = {
            headers: token ? createAuthHeader(token, isFormData) : headers
        };
        
        // Set timeout - use longer timeout for form data uploads
        if (timeout) {
            config.timeout = timeout;
        } else if (isFormData) {
            config.timeout = 120000; // 2 minutes for file uploads
        }
        
        // Set max content length for file uploads
        if (isFormData) {
            config.maxContentLength = Infinity;
            config.maxBodyLength = Infinity;
        }
        
        const response = method === 'get'
            ? await axios.get(url, config)
            : await axios.post(url, data, config);
        
        return response.data;
    } catch (error) {
        console.error('API request error:', JSON.stringify(error)); 
        return handleAxiosError(error);
    }
};

export const makeFormRequest = async ( url, data = {}, token = null, timeout = 0) => {
    try {
        const config = {
            headers: token ? createAuthHeader(token, true) : headers
        };
        if (timeout) {
            config.timeout = timeout;
        }
        const response = await axios.post(url, data, config);
        console.log("response" , response.data);
        return response.data;
    } catch (error) {
        console.error('API request error:', error); 
        return handleAxiosError(error);
    }
};

export const deactiveAccount = (token) =>
    makeRequest('post', `${API_HOST}/app/deactive`, {}, token);

export const checkHealth = () =>
    makeRequest('get', `${API_HOST}/auth/health`);

export const fetchPin = (token) =>
    makeRequest('post', `${API_HOST}/app/otp`, {}, token);

export const fetchIcons = (token) =>
    makeRequest('post', `${API_HOST}/app/get_icons`, {}, token);

export const fetchSupplier = (token) =>
    makeRequest('post', `${API_HOST}/app/get_supplier`, {}, token);

export const fetchNotifications = (page, token) =>
    makeRequest('get', `${API_HOST}/app/get_notification?page=${page}`, {}, token);

export const readAllNotifications = (id, token) =>
    makeRequest('get', `${API_HOST}/app/read_all_notification?id=${id}`, {}, token);

export const countNotifications = (token) =>
    makeRequest('get', `${API_HOST}/app/count_notification`, {}, token);

export const fetchNewfeeds = (page, token) =>
    makeRequest('get', `${API_HOST}/app/get_newfeeds?page=${page}`, {}, token);

export const fetchVersion = (token, lang) =>
    makeRequest('get', `${API_HOST}/app/get_versions?lang=${lang}`, {}, token);

export const fetchSocialUrl = (token, lang) =>
    makeRequest('get', `${API_HOST}/app/get_social_url?lang=${lang}`, {}, token);

export const fectchContactToggle = (token, lang) =>
    makeRequest('get', `${API_HOST}/app/get_contact_toggle?lang=${lang}`, {}, token);

export const fetchShoppingUrl = (token, lang) =>
    makeRequest('get', `${API_HOST}/app/get_shopping_url?lang=${lang}`, {}, token);

export const likePost = (data, token) =>
    makeRequest('post', `${API_HOST}/app/like_post`, data, token, 10000);

export const fetchPostComments = (data, token) =>
    makeRequest('post', `${API_HOST}/app/get_comments`, data, token, 10000);

export const postComment = (data, token) =>
    makeRequest('post', `${API_HOST}/app/post_comments`, data, token, 10000);

export const fetchHistory = (token) =>
    makeRequest('get', `${API_HOST}/app/get_history`, {}, token);

export const fetchServices = ({ type, filter, platform }) =>
    makeRequest('post', `${API_HOST}/app/get_services_by_type`, {
        headers: {
            data: { type, filter: filter.join(","), platform }
        }
    });

export const fetchCard = (token) =>
    makeRequest('get', `${API_HOST}/app/get_card_info`, {}, token);

export const fetchInviteInfo = (token) =>
    makeRequest('post', `${API_HOST}/app/invite_info`, {}, token);

export const fetchIdentityPhoto = (token) =>
    makeRequest('post', `${API_HOST}/app/vneid`, {}, token);

const createFormData = (file, prefix) => {
    const formData = new FormData();
    const timestamp = new Date().getTime();
    formData.append('file', {
        uri: file,
        name: `${prefix}_${timestamp}.jpg`,
        type: 'image/jpeg'
    });
    return formData;
};

export const uploadIdentityPhoto = async (file, token) => {
    const formData = await createResizedImageFormData(file, 'vneid', 1600);
    return makeFormRequest(`${API_HOST}/app/upload_vneid`, formData, token, 60000);
};

// Resize (cạnh dài tối đa maxSize) và chuyển sang JPEG trước khi upload.
// file: asset của expo-image-picker hoặc chuỗi uri.
const createResizedImageFormData = async (file, prefix, maxSize) => {
    const asset = typeof file === 'string' ? { uri: file } : file;
    const timestamp = new Date().getTime();
    let part;
    try {
        const context = ImageManipulator.manipulate(asset.uri);
        const { width, height } = asset;
        if (width && height && Math.max(width, height) > maxSize) {
            context.resize(width >= height ? { width: maxSize } : { height: maxSize });
        }
        const image = await context.renderAsync();
        const result = await image.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
        part = { uri: result.uri, name: `${prefix}_${timestamp}.jpg`, type: 'image/jpeg' };
    } catch (error) {
        console.error('Resize image error:', error);
        part = {
            uri: asset.uri,
            name: asset.fileName || `${prefix}_${timestamp}.jpg`,
            type: asset.mimeType || 'image/jpeg'
        };
    }
    const formData = new FormData();
    formData.append('file', part);
    return formData;
};

export const uploadAvatar = async (file, token) => {
    const formData = await createResizedImageFormData(file, 'avatar', 512);
    return makeFormRequest(`${API_HOST}/app/upload_avatar`, formData, token, 60000);
};

export const uploadCover = async (file, token) => {
    const formData = await createResizedImageFormData(file, 'cover', 1600);
    return makeFormRequest(`${API_HOST}/app/upload_cover`, formData, token, 60000);
};

export const uploadPhoto = async (file, token) => {
    const formData = createFormData(file, 'app_upload');
    return makeRequest('post', `${API_HOST}/app/upload_photo`, formData, token, 10000, true);
};

export const getProfile = (token) =>
    makeRequest('post', `${API_HOST}/app/profile`, {}, token, 10000);

export const updateProfile = (data, token) => 
    makeRequest('post', `${API_HOST}/app/update_profile`, data, token, 10000);

export const fetchHistoryPoint = (token) =>
    makeRequest('post', `${API_HOST}/app/get_history_points`, {}, token);

export const updatePushToken = (data, token) =>
    makeRequest('post', `${API_HOST}/app/update_device_push_token`, data, token);

export const getPointIntructionUrl = (token) =>
    makeRequest('post', `${API_HOST}/app/get_point_intruction_url`, {}, token);

export const featureToggle = () =>
    makeRequest('post', `${API_HOST}/app/feature_toggle`);

export const getSocialsPosts = (param, token) => {
    return makeRequest('post', `${API_HOST}/social/get_posts`, param, token);
};

export const getConfigSocial = (token) =>
    makeRequest('post', `${API_HOST}/social/get_config`, {}, token);

export const fetchSocial = (url, data, token, method = 'post', isForm = false) => {
    // Don't pass timeout for form uploads - let it use the default 120s
    const timeout = isForm ? 0 : 10000;
    return makeRequest(method, url, data, token, timeout, isForm);
}

// Wallet API endpoints
export const getWalletBalance = (token) =>
    makeRequest('post', `${API_HOST}/wallet/get_balance`, {}, token);

export const getWalletTransactions = (page, token) =>
    makeRequest('get', `${API_HOST}/wallet/get_transactions?page=${page}`, {}, token);

export const depositFunds = (data, token) =>
    makeRequest('post', `${API_HOST}/wallet/deposit`, data, token, 10000);

export const withdrawFunds = (data, token) =>
    makeRequest('post', `${API_HOST}/wallet/withdraw`, data, token, 10000);

export const getPaymentMethods = (token) =>
    makeRequest('post', `${API_HOST}/wallet/get_payment_methods`, {}, token);

export const getWithdrawalMethods = (token) =>
    makeRequest('post', `${API_HOST}/wallet/get_withdrawal_methods`, {}, token);

export const validateBankAccount = (data, token) =>
    makeRequest('post', `${API_HOST}/wallet/validate_bank_account`, data, token);

export const getTransactionHistory = (data, token) =>
    makeRequest('post', `${API_HOST}/wallet/get_transaction_history`, data, token);

export const cancelTransaction = (transactionId, token) =>
    makeRequest('post', `${API_HOST}/wallet/cancel_transaction`, { transaction_id: transactionId }, token);

export const getExchangeRates = (token) =>
    makeRequest('post', `${API_HOST}/wallet/get_exchange_rates`, {}, token);