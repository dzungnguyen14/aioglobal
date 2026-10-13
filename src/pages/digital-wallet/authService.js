import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'user_token';
const BIOMETRIC_ENABLED = 'biometric_enabled';
const BIOMETRIC_TYPE = 'biometric_type';

// 👉 Bật Face ID
export async function enableBiometric(token, platform) {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (platform === 'ios') {
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) return false;
        await SecureStore.setItemAsync(BIOMETRIC_TYPE, '2');
    } else {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled || types.length === 0) return false;
        // 1: Fingerprint
        // 2: Face ID
        // 3: Iris
        await SecureStore.setItemAsync(BIOMETRIC_TYPE, types[0].toString());
    }


    await SecureStore.setItemAsync(BIOMETRIC_ENABLED, 'true');
    await SecureStore.setItemAsync(TOKEN_KEY, token);

    return true;
}
export async function getBiometricType() {
    const type = await SecureStore.getItemAsync(BIOMETRIC_TYPE);
    if (!type) return null;
    return parseInt(type);
}

// 👉 Check có bật Face ID không
export async function isBiometricEnabled() {
    return (await SecureStore.getItemAsync(BIOMETRIC_ENABLED)) === 'true';
}

// 👉 Login bằng Face ID
export async function loginWithBiometric() {
    const enabled = await isBiometricEnabled();
    if (!enabled) return null;

    const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Xác thực',
        biometricsSecurityLevel: 'strong', // 👈 CHỈ cho phép strong
    });

    if (!result.success) return null;

    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token;
}

// 👉 Logout
export async function removeBiometric() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED);
    await SecureStore.deleteItemAsync(BIOMETRIC_TYPE);
}