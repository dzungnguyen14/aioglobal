import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';
import {
    cacheIncomingCall,
    clearCachedCall,
    displayIncomingVideoCall,
    getCachedCall,
    isValidCallUUID,
    notifyIncomingAnswer,
    persistVoipToken,
    setAudioSessionActive,
} from './src/components/call/voip';

let RNCallKeep, messaging, Linking, registerGlobals, VoipPushNotification;
try {
    RNCallKeep = require('react-native-callkeep').default || require('react-native-callkeep');
} catch (e) {
    console.warn('RNCallKeep unavailable or failed to load:', e);
}
try {
    messaging = require('@react-native-firebase/messaging').default || require('@react-native-firebase/messaging');
} catch (e) {
    console.warn('messaging unavailable or failed to load:', e);
}
try {
    ({ Linking } = require('react-native'));
} catch (e) {
    console.warn('Linking unavailable or failed to load:', e);
}
try {
    registerGlobals = require('@livekit/react-native').registerGlobals;
} catch (e) {
    console.warn('registerGlobals unavailable or failed to load:', e);
}
try {
    VoipPushNotification = require('react-native-voip-push-notification').default
        || require('react-native-voip-push-notification');
} catch (e) {
    console.warn('VoipPushNotification unavailable or failed to load:', e);
}

const callKeepOptions = {
    ios: {
        appName: 'AIOGlobal',
        supportsVideo: true,
        maximumCallGroups: '1',
        maximumCallsPerCallGroup: '1',
        includesCallsInRecents: true,
        audioSession: {
            mode: 'AVAudioSessionModeVideoChat',
        },
    },
    android: {
        alertTitle: 'Quyền cần thiết',
        alertDescription: 'App cần quyền truy cập vào tài khoản điện thoại của bạn',
        cancelButton: 'Cancel',
        okButton: 'ok',
        additionalPermissions: [],
        foregroundService: {
            channelId: 'com.aioglobal.call',
            channelName: 'Cuộc gọi đến',
            notificationTitle: 'AIOGlobal đang chạy cuộc gọi',
            notificationIcon: 'ic_launcher',
        },
    },
};

const answerIncomingCall = ({ callUUID }) => {
    const call = getCachedCall(callUUID) || { uuid: callUUID };
    // Android doesn't open the app on answer. Bring it up so the call screen (and the
    // camera/microphone permission prompt, which needs an Activity) can be shown.
    if (Platform.OS === 'android' && RNCallKeep) {
        try {
            RNCallKeep.backToForeground();
        } catch (e) {
            console.warn('RNCallKeep.backToForeground failed:', e);
        }
    }
    notifyIncomingAnswer(call);
};

const handleCallKeepEvents = (events) => {
    if (!Array.isArray(events)) return;
    events.forEach((event) => {
        if (event?.name === 'RNCallKeepDidDisplayIncomingCall' && event.data) {
            cacheIncomingCall({
                ...event.data.payload,
                uuid: event.data.callUUID,
                callerName: event.data.localizedCallerName,
                handle: event.data.handle,
                hasVideo: event.data.hasVideo,
            });
        }
        if (event?.name === 'RNCallKeepPerformAnswerCallAction' && event.data) {
            answerIncomingCall(event.data);
        }
        if (event?.name === 'RNCallKeepDidActivateAudioSession') {
            setAudioSessionActive(true);
        }
        if (event?.name === 'RNCallKeepPerformEndCallAction' && event.data?.callUUID) {
            clearCachedCall(event.data.callUUID);
        }
    });
};

const registerCallkeep = async () => {
    if (!RNCallKeep) return;
    try {
        const accepted = await RNCallKeep.setup(callKeepOptions);
        if (!accepted && Platform.OS === 'android') {
            RNCallKeep.openPhoneAccountSettings();
        }
        RNCallKeep.setAvailable(true);
    } catch (e) {
        console.warn('Error during RNCallKeep setup:', e);
    }
};

if (RNCallKeep) {
    try {
        RNCallKeep.addEventListener('answerCall', answerIncomingCall);
        RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
            clearCachedCall(callUUID);
        });
        RNCallKeep.addEventListener('didDisplayIncomingCall', (data) => {
            cacheIncomingCall({
                ...data.payload,
                uuid: data.callUUID,
                callerName: data.localizedCallerName,
                handle: data.handle,
                hasVideo: data.hasVideo,
            });
        });
        RNCallKeep.addEventListener('didActivateAudioSession', () => setAudioSessionActive(true));
        RNCallKeep.addEventListener('didDeactivateAudioSession', () => setAudioSessionActive(false));
        RNCallKeep.addEventListener('didLoadWithEvents', handleCallKeepEvents);
    } catch (e) {
        console.warn('Error adding RNCallKeep event listeners:', e);
    }
}

const registerVoipPush = () => {
    if (Platform.OS !== 'ios' || !VoipPushNotification) return;

    const onVoipToken = (token) => {
        persistVoipToken(token).catch((error) => console.warn('persistVoipToken failed', error));
    };

    const onVoipNotification = (notification) => {
        // CallKit was already reported natively (AppDelegate). Only cache the payload when it
        // carries a valid uuid; never mint a new one or it won't match the CallKit call.
        const uuidValue = notification?.uuid || notification?.callUUID;
        if (!isValidCallUUID(uuidValue)) return;
        const call = cacheIncomingCall(notification);
        VoipPushNotification.onVoipNotificationCompleted(call.uuid);
    };

    VoipPushNotification.addEventListener('register', onVoipToken);
    VoipPushNotification.addEventListener('notification', onVoipNotification);
    VoipPushNotification.addEventListener('didLoadWithEvents', (events) => {
        if (!Array.isArray(events)) return;
        events.forEach((event) => {
            if (event.name === VoipPushNotification.RNVoipPushRemoteNotificationsRegisteredEvent) {
                onVoipToken(event.data);
            } else if (event.name === VoipPushNotification.RNVoipPushRemoteNotificationReceivedEvent) {
                onVoipNotification(event.data);
            }
        });
    });
    VoipPushNotification.registerVoipToken();
};

if (messaging && typeof messaging === 'function') {
    try {
        messaging().onMessage(async (remoteMessage) => {
            if (remoteMessage?.data?.type === 'call' && RNCallKeep) {
                displayIncomingVideoCall(RNCallKeep, remoteMessage.data);
            }
        });
        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
            if (remoteMessage?.data?.type === 'call' && RNCallKeep) {
                displayIncomingVideoCall(RNCallKeep, remoteMessage.data);
            }
        });
    } catch (e) {
        console.warn('Error setting up messaging handlers:', e);
    }
}

registerCallkeep().catch((e) => console.warn('Error in registerCallkeep():', e));
registerVoipPush();
if (typeof registerGlobals === 'function') {
    try {
        registerGlobals();
    } catch (e) {
        console.warn('Error in registerGlobals():', e);
    }
}

registerRootComponent(App);
