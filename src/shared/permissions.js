import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
import { Alert, AppState, Linking, PermissionsAndroid, Platform } from 'react-native';

// Storage keys for cached permissions
const PERMISSION_KEYS = {
    CAMERA: 'PERMISSION_CAMERA',
    MICROPHONE: 'PERMISSION_MICROPHONE',
    CAMERA_ASKED: 'PERMISSION_CAMERA_ASKED',
    MICROPHONE_ASKED: 'PERMISSION_MICROPHONE_ASKED',
};

/**
 * Permission status types
 */
export const PERMISSION_STATUS = {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
    RESTRICTED: 'restricted',
};

/**
 * Save permission status to secure storage
 */
const savePermissionStatus = async (key, status) => {
    try {
        await SecureStore.setItemAsync(key, status);
    } catch (error) {
        console.error('Error saving permission status:', error);
    }
};

/**
 * Get cached permission status from secure storage
 */
const getCachedPermissionStatus = async (key) => {
    try {
        const status = await SecureStore.getItemAsync(key);
        return status || PERMISSION_STATUS.UNDETERMINED;
    } catch (error) {
        console.error('Error getting cached permission status:', error);
        return PERMISSION_STATUS.UNDETERMINED;
    }
};

/**
 * Check if user has been asked for permission before
 */
const hasBeenAsked = async (key) => {
    try {
        const asked = await SecureStore.getItemAsync(key);
        return asked === 'true';
    } catch (error) {
        return false;
    }
};

/**
 * Mark that user has been asked for permission
 */
const markAsAsked = async (key) => {
    try {
        await SecureStore.setItemAsync(key, 'true');
    } catch (error) {
        console.error('Error marking permission as asked:', error);
    }
};

/**
 * Request camera permission
 * @param {Object} lang - Language object for localized messages
 * @returns {Promise<string>} Permission status
 */
export const requestCameraPermission = async (lang = {}) => {
    try {
        // Check cached status first
        const cachedStatus = await getCachedPermissionStatus(PERMISSION_KEYS.CAMERA);
        
        // If we have a cached granted permission, verify it's still valid
        if (cachedStatus === PERMISSION_STATUS.GRANTED) {
            const { status } = await Camera.getCameraPermissionsAsync();
            if (status === 'granted') {
                return PERMISSION_STATUS.GRANTED;
            }
        }

        // Check current permission status
        const { status: currentStatus } = await Camera.getCameraPermissionsAsync();
        
        // If already granted, cache it and return
        if (currentStatus === 'granted') {
            await savePermissionStatus(PERMISSION_KEYS.CAMERA, PERMISSION_STATUS.GRANTED);
            return PERMISSION_STATUS.GRANTED;
        }

        // Check if permission was previously denied
        const wasAsked = await hasBeenAsked(PERMISSION_KEYS.CAMERA_ASKED);
        
        if (currentStatus === 'denied' && wasAsked) {
            // Permission was denied before, show settings alert
            Alert.alert(
                lang.permission_required || 'Permission Required',
                lang.camera_permission_denied || 'Camera permission is required for video calls. Please enable it in your device settings.',
                [
                    {
                        text: lang.cancel || 'Cancel',
                        style: 'cancel'
                    },
                    {
                        text: lang.open_settings || 'Open Settings',
                        onPress: () => {
                            if (Platform.OS === 'ios') {
                                Linking.openURL('app-settings:');
                            } else {
                                Linking.openSettings();
                            }
                        }
                    }
                ]
            );
            return PERMISSION_STATUS.DENIED;
        }

        // Request permission
        const { status: requestedStatus } = await Camera.requestCameraPermissionsAsync();
        await markAsAsked(PERMISSION_KEYS.CAMERA_ASKED);
        
        // Cache the result
        await savePermissionStatus(PERMISSION_KEYS.CAMERA, requestedStatus);
        
        return requestedStatus;
    } catch (error) {
        console.error('Error requesting camera permission:', error);
        return PERMISSION_STATUS.DENIED;
    }
};

/**
 * Request microphone permission
 * @param {Object} lang - Language object for localized messages
 * @returns {Promise<string>} Permission status
 */
export const requestMicrophonePermission = async (lang = {}) => {
    try {
        // Check cached status first
        const cachedStatus = await getCachedPermissionStatus(PERMISSION_KEYS.MICROPHONE);
        
        // If we have a cached granted permission, verify it's still valid
        if (cachedStatus === PERMISSION_STATUS.GRANTED) {
            const { status } = await Audio.getPermissionsAsync();
            if (status === 'granted') {
                return PERMISSION_STATUS.GRANTED;
            }
        }

        // Check current permission status
        const { status: currentStatus } = await Audio.getPermissionsAsync();
        
        // If already granted, cache it and return
        if (currentStatus === 'granted') {
            await savePermissionStatus(PERMISSION_KEYS.MICROPHONE, PERMISSION_STATUS.GRANTED);
            return PERMISSION_STATUS.GRANTED;
        }

        // Check if permission was previously denied
        const wasAsked = await hasBeenAsked(PERMISSION_KEYS.MICROPHONE_ASKED);
        
        if (currentStatus === 'denied' && wasAsked) {
            // Permission was denied before, show settings alert
            Alert.alert(
                lang.permission_required || 'Permission Required',
                lang.microphone_permission_denied || 'Microphone permission is required for voice/video calls. Please enable it in your device settings.',
                [
                    {
                        text: lang.cancel || 'Cancel',
                        style: 'cancel'
                    },
                    {
                        text: lang.open_settings || 'Open Settings',
                        onPress: () => {
                            if (Platform.OS === 'ios') {
                                Linking.openURL('app-settings:');
                            } else {
                                Linking.openSettings();
                            }
                        }
                    }
                ]
            );
            return PERMISSION_STATUS.DENIED;
        }

        // Request permission
        const { status: requestedStatus } = await Audio.requestPermissionsAsync();
        await markAsAsked(PERMISSION_KEYS.MICROPHONE_ASKED);
        
        // Cache the result
        await savePermissionStatus(PERMISSION_KEYS.MICROPHONE, requestedStatus);
        
        return requestedStatus;
    } catch (error) {
        console.error('Error requesting microphone permission:', error);
        return PERMISSION_STATUS.DENIED;
    }
};

/**
 * Request both camera and microphone permissions
 * @param {Object} lang - Language object for localized messages
 * @returns {Promise<Object>} Object with camera and microphone permission statuses
 */
export const requestMediaPermissions = async (lang = {}) => {
    try {
        const [cameraStatus, microphoneStatus] = await Promise.all([
            requestCameraPermission(lang),
            requestMicrophonePermission(lang)
        ]);

        return {
            camera: cameraStatus,
            microphone: microphoneStatus,
            allGranted: cameraStatus === PERMISSION_STATUS.GRANTED && 
                       microphoneStatus === PERMISSION_STATUS.GRANTED
        };
    } catch (error) {
        console.error('Error requesting media permissions:', error);
        return {
            camera: PERMISSION_STATUS.DENIED,
            microphone: PERMISSION_STATUS.DENIED,
            allGranted: false
        };
    }
};

/**
 * Check if all media permissions are granted (without requesting)
 * @returns {Promise<Object>} Object with permission statuses
 */
export const checkMediaPermissions = async () => {
    try {
        const [cameraPermission, microphonePermission] = await Promise.all([
            Camera.getCameraPermissionsAsync(),
            Audio.getPermissionsAsync()
        ]);

        return {
            camera: cameraPermission.status,
            microphone: microphonePermission.status,
            allGranted: cameraPermission.status === 'granted' && 
                       microphonePermission.status === 'granted'
        };
    } catch (error) {
        console.error('Error checking media permissions:', error);
        return {
            camera: PERMISSION_STATUS.DENIED,
            microphone: PERMISSION_STATUS.DENIED,
            allGranted: false
        };
    }
};

/**
 * Clear cached permission statuses (useful for debugging or reset)
 */
export const clearPermissionCache = async () => {
    try {
        await Promise.all([
            SecureStore.deleteItemAsync(PERMISSION_KEYS.CAMERA),
            SecureStore.deleteItemAsync(PERMISSION_KEYS.MICROPHONE),
            SecureStore.deleteItemAsync(PERMISSION_KEYS.CAMERA_ASKED),
            SecureStore.deleteItemAsync(PERMISSION_KEYS.MICROPHONE_ASKED)
        ]);
    } catch (error) {
        console.error('Error clearing permission cache:', error);
    }
};

/**
 * Get detailed permission info including cached status
 */
export const getPermissionInfo = async () => {
    try {
        const [cachedCamera, cachedMic, currentPerms] = await Promise.all([
            getCachedPermissionStatus(PERMISSION_KEYS.CAMERA),
            getCachedPermissionStatus(PERMISSION_KEYS.MICROPHONE),
            checkMediaPermissions()
        ]);

        return {
            cached: {
                camera: cachedCamera,
                microphone: cachedMic
            },
            current: currentPerms,
            needsUpdate: cachedCamera !== currentPerms.camera || 
                        cachedMic !== currentPerms.microphone
        };
    } catch (error) {
        console.error('Error getting permission info:', error);
        return null;
    }
};


const CALL_PERMISSIONS_ANDROID = [
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
];

// The runtime permission dialog needs a foreground Activity. After answering from the
// CallKeep UI the app may still be coming up (or waiting behind the lock screen).
const waitForAppActive = (timeoutMs) => new Promise((resolve) => {
    if (AppState.currentState === 'active') {
        resolve(true);
        return;
    }
    let timer = null;
    const subscription = AppState.addEventListener('change', (nextState) => {
        if (nextState !== 'active') return;
        clearTimeout(timer);
        subscription.remove();
        resolve(true);
    });
    timer = setTimeout(() => {
        subscription.remove();
        resolve(false);
    }, timeoutMs);
});

/**
 * Make sure camera and microphone are granted before joining a call answered on Android.
 * Asks for whatever is missing and explains (with a shortcut to Settings when the user chose
 * "Don't ask again") when it is refused.
 * @param {Object} lang - Language object for localized messages
 * @returns {Promise<boolean>} true when both permissions are granted
 */
export const ensureCallPermissionsAndroid = async (lang = {}) => {
    if (Platform.OS !== 'android') return true;
    try {
        const granted = await Promise.all(CALL_PERMISSIONS_ANDROID.map((permission) => PermissionsAndroid.check(permission)));
        if (granted.every(Boolean)) return true;

        await waitForAppActive(30000);
        const result = await PermissionsAndroid.requestMultiple(CALL_PERMISSIONS_ANDROID);
        const statuses = CALL_PERMISSIONS_ANDROID.map((permission) => result[permission]);
        if (statuses.every((status) => status === PermissionsAndroid.RESULTS.GRANTED)) return true;

        const blocked = statuses.includes(PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN);
        Alert.alert(
            lang.permission_required || 'Permission Required',
            lang.call_permission_denied || 'Camera and microphone access is required to join the call.',
            blocked
                ? [
                    { text: lang.cancel || 'Cancel', style: 'cancel' },
                    { text: lang.open_settings || 'Open Settings', onPress: () => Linking.openSettings() },
                ]
                : [{ text: 'OK' }]
        );
        return false;
    } catch (error) {
        console.error('Error requesting call permissions:', error);
        return false;
    }
};
