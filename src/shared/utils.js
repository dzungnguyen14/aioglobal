import { Alert } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { USER_LANG } from "./constant";
import { useLang } from "./hooks";
import { ImageManipulator } from "expo-image-manipulator";
export const formatToPhoneNumber = (value) => {
    const cleanedValue = value.replace(/\D/g, ''); // Remove all non-digit characters
    return cleanedValue;
}

export const hashPassword = (pass, salt) => {
    return crypto.createHash('sha256').update(pass + salt).digest('hex');
}

export const clearItem = async (key) => {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (error) {
        // Alert.alert(JSON.stringify(error));
    }
}
export const setItem = async (key, value) => {
    try {
        await SecureStore.setItemAsync(key, value);
    } catch (error) {
        // Alert.alert(JSON.stringify(error));
    }
};
export const getItem = async (key) => {
    try {
        let result = await SecureStore.getItemAsync(key);
        return result;
    } catch (error) {
        // Alert.alert(JSON.stringify(error));
    }
};

export const customNotify = (title, msg) => {
    Alert.alert(
        title, msg,
        [
            {
                text: "OK",
                style: "cancel"
            }
        ],
        { cancelable: false }
    );
}

export const getLangFromStore = async () => {
    try {
        let result = await SecureStore.getItemAsync(USER_LANG);
        return result ? result : 'vn';
    } catch (error) {
        return 'vn';
    }
}

export const defaultTheme = async () => {
    return {
        color: ''
    }
}

export const formatDateTime = (date, format = 'dd/mm/yyyy hh:mm') => {
    if(format == 'dd/mm/yyyy hh:mm:ss') {
        return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
    }
    if(format == 'dd/mm/yyyy') {
        return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    if(format == 'mm/dd/yyyy') {
        return new Date(date).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit', year: 'numeric' });
    }
    if(format == 'yyyy/mm/dd') {
        return new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export const formatDateToTime = (date, lang) => {

    if (date) {
        const now = new Date().getTime();
        const datetime = new Date(date).getTime();
        // if diff time is less than 1 hours, return minutes ago , else return days ago  
        const diffTime = Math.abs(now - datetime);
        const diffMinutes = Math.round(diffTime / (1000 * 60));
        if (diffMinutes == 0) {
            return lang.online;
        }
        if (diffMinutes < 60) {
            return `${diffMinutes} ${lang.minutes_ago}`;
        } else {
            const diffHours = Math.round(diffTime / (1000 * 60 * 60));
            if (diffHours < 24) {
                return `${diffHours} ${lang.hours_ago}`;
            } else {
                const oldDate = new Date(date);

                // Format the date to a readable string like "Mon, 15/01/2023"
                const options = { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' };

                // formate date dd/mm/yyyy
                const formattedDate = oldDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                // If the difference is more than 7 days, return the formatted date instead of days count
                if (diffDays > 7) {
                    return formattedDate;
                }
                return `${diffDays} ${lang.days_ago}`;
            }
        }
    } else {
        return "";
    }
}

export const imageCompression = async (uri) => {
    const result = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
            compress: 0.5, // giá trị từ 0 đến 1
            format: ImageManipulator.SaveFormat.JPEG,
        }
    );
    return result.uri;
}
export const parseTLV = (payload) => {
    let i = 0;
    const obj = {};
    while (i + 4 <= payload.length) {
      const tag = payload.slice(i, i + 2);
      const len = parseInt(payload.slice(i + 2, i + 4), 10);
      if (isNaN(len) || i + 4 + len > payload.length) break;
      const val = payload.slice(i + 4, i + 4 + len);
      obj[tag] = val;
      i += 4 + len;
    }
    return obj;
  }
  
  const bankMap = {
    QRIBFTTA: "ACB",
    QRIBFTTB: "BIDV",
    QRIBFTTC: "VietinBank",
    QRIBFTTH: "Techcombank",
    QRIBFTTM: "MB Bank",
    QRIBFTTP: "TPBank",
    QRIBFTTS: "Sacombank",
    QRIBFTTV: "Vietcombank",
    QRIBFTTVB: "VIB",
    QRIBFTTHD: "HDBank",
    QRIBFTTNCB: "NCB",
    QRIBFTTD: "DongA Bank",
    QRIBFTTG: "GPBank",
    QRIBFTTPV: "PVcomBank",
    QRIBFTTO: "OceanBank",
    ORCOVNVX: "OCB",
  };
  
  export const extractVietQR = (payload) => {
    if (typeof payload !== "string") return {};
  
    const level1 = parseTLV(payload);
    const merchant = level1["38"] || level1["26"] || level1["51"];
    if (!merchant) return {};
  
    const level2 = parseTLV(merchant);
    const maybeSub01 = level2["01"];
    const hasNested = maybeSub01 && /^\d{4}/.test(maybeSub01);
  
    let account = "";
    let bankCode = "";
    let bankName = "";
    let serviceType = "";
    if (hasNested) {
      const level3 = parseTLV(maybeSub01);
      account = level3["01"] || "";
  
      const raw = maybeSub01;
      const match = raw.match(/QRIBFTT[A-Z0-9]+/i);
      bankCode = (level3["08"] || level3["02"] || (match ? match[0] : "")).toUpperCase();
    } else {
      account = level2["01"] || "";
      const raw = merchant;
      const match = raw.match(/QRIBFTT[A-Z0-9]+/i);
      bankCode = (level2["08"] || level2["02"] || (match ? match[0] : "")).toUpperCase();
    }
      
    Object.keys(bankMap).forEach((key) => {
      if (payload.includes(key)) {
        bankCode = key;
        bankName = bankMap[key];
      }
    });  
    return {
      account,
      bankCode,
      bankName,
      isThreeLayer: hasNested,
      serviceType,
    };
  }

export const formatMoneyByCurrency = (amount, currency) => {
    if(currency === 'USDT') {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    } else if(currency === 'VND') {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    } else {
        return amount.toFixed(4);        
    }
  }