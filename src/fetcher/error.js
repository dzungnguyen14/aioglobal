import * as SecureStore from "expo-secure-store";
import { USER_LANG } from "../shared/constant";
import { LANG } from "../constants/lang";

const getGenericErrorMessage = async () => {
    let lang = 'vn';
    try {
        lang = (await SecureStore.getItemAsync(USER_LANG)) || 'vn';
    } catch (e) { }
    return (LANG[lang] || LANG.vn).generic_error;
};

// Shows the server's own message (e.g. wrong password) when there is one; otherwise a generic
// "please try again" message - never the raw axios error / stack trace.
export const handleAxiosError = async (error) => {
    console.error('API request error:', error?.config?.url, error?.code || error?.message);
    const serverMsg = error?.response?.data?.msg;
    return {
        success: false,
        msg: serverMsg || await getGenericErrorMessage()
    };
};
