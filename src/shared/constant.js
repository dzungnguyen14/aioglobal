import { Platform } from "react-native";

const HTTP = Platform.OS === 'android' ? 'http://' : 'https://';
const API_HOST = HTTP + 'app.aioglobal.org/api/mobile';
const API_SOCIAL_HOST = 'http://mxh.aioglobal.org/api';
const USER_TOKEN_KEY = 'USER_TOKEN_KEY';
const WALLET_STORAGE_TOKEN_KEY = 'WALLET_STORAGE_TOKEN_KEY';
const USER_LANG = 'USER_LANG';
const EXPO_PUSH_TOKEN_KEY = 'EXPO_PUSH_TOKEN_KEY';
const VOIP_TOKEN_KEY = 'VOIP_TOKEN_KEY';
const DEVICE_GUID_KEY = 'DEVICE_GUID_KEY';
const SESSION_LOGIN_AT_KEY = 'SESSION_LOGIN_AT_KEY';
const FCM_DATA = 'FCM_DATA';
const USER_TERMS_AGREED = 'USER_TERMS_AGREED';
export {
    API_HOST,
    API_SOCIAL_HOST,
    USER_TOKEN_KEY,
    USER_LANG,
    EXPO_PUSH_TOKEN_KEY,
    VOIP_TOKEN_KEY,
    DEVICE_GUID_KEY,
    SESSION_LOGIN_AT_KEY,
    WALLET_STORAGE_TOKEN_KEY,
    FCM_DATA,
    USER_TERMS_AGREED
}
export const ZOOM_API_HOST = 'https://zoom-api.aioglobal.org';