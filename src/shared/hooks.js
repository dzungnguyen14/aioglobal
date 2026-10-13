import { useEffect, useMemo, useState } from "react"
import { LANG } from "../constants/lang"
import { clearItem, getItem, getLangFromStore, setItem } from "./utils";
import { USER_LANG, USER_TOKEN_KEY, WALLET_STORAGE_TOKEN_KEY } from "./constant";
import { reloadAppAsync } from "expo";
import * as Device from 'expo-device';

export const useLang = () => {
    const [value, setValue] = useState('vn');
    const lang = useMemo(() => {
        return LANG[value];
    }, [value]);

    useEffect(() => {
        const loadingLanguage = async () => {
            const lang = await getLangFromStore();
            setValue(lang);
        }
        loadingLanguage();
        return () => { };
    }, []);

    const changeLanguage = async (language) => {
        setValue(language);
        await setItem(USER_LANG, language);
        reloadAppAsync();
    }

    return {
        value,
        lang,
        changeLanguage
    }
}

export const useProfile = () => {
    const [value, setValue] = useState({});

    useEffect(() => {
        getItem(USER_TOKEN_KEY).then(res => {
            try {
                const profile = JSON.parse(res);
                setValue(profile);
            }
            catch {
            }
        });
        
    }, []);

    const setProfile = async (info) => {
        try {
            setValue(info);
            await setItem(USER_TOKEN_KEY, JSON.stringify(info));
        } catch (Error) {
            console.error(Error);
        }
    }

    const clearProfile = async () => {
        clearItem(USER_TOKEN_KEY);
        clearItem(WALLET_STORAGE_TOKEN_KEY);
        setValue({});
    }
    return {
        profile : value,
        setProfile,
        clearProfile,
    }

    
}

export const useGetDeviceInfo = () => {
    const [value, setValue] = useState({});
    const deviceInfo = useMemo(() => {
        return {
            uuid: Device.uuid,
            name: Device.name,
            version: Device.version,
            platform: Device.platform,
            osVersion: Device.osVersion,
            deviceType: Device.deviceType,
            deviceName: Device.deviceName,
            model: Device.modelName,
        };
    }, [value]);

    useEffect(() => {
        setValue(deviceInfo);
    }, []);

    return deviceInfo;
}

export const debounce = ((func, delay) => {
    let timeoutId;
    return function (...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
});