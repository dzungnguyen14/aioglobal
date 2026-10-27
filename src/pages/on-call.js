import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Vibration, Dimensions, ActivityIndicator } from "react-native";
import { useLang } from "../shared/hooks";
import styles from "../styles/global";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef, useMemo } from "react";
import { joinRoom, getWebviewURL, answerCall } from "../components/home/zoom/api";
import { reportCallEnded } from "../components/call/voip";
import { CustomImage } from "../components/images";
import { ZOOM_API_HOST } from "../shared/constant";
import IframeScreen from "../components/webview";
import { useGlobal } from "../state/global";
import LottieView from 'lottie-react-native';
import RingingLottie from '../../assets/ringing.json';  
import RingingMP3 from '../../assets/ringing.mp3';
import { Audio } from 'expo-av';
import { requestMediaPermissions, checkMediaPermissions } from '../shared/permissions';
import { TabRoute } from "./home";

const SECONDS_RINGING = 10;
const ONE_SECOND_IN_MS = 1000;
const ENTERING_TIME_IN_MS = 8000;
// Pattern rung: rung 1s, dừng 0.5s, lặp lại
const PATTERN = [0, ONE_SECOND_IN_MS, 200];

const CALL_STATUS = {
    CONNECTING: 'connecting',
    ONGOING: 'ongoing',
    ENDED: 'ended'
}

function OnCallScreen({ navigation, route }) {
    const animation = useRef(null);
    const { state, dispatch } = useGlobal();
    const { profile } = state;
    const { lang } = useLang();
    const { IS_END_CALL } = state;
    const { room_id, meeting_id, incoming, counterpart } = route.params;
    const [callStatus, setCallStatus] = useState(CALL_STATUS.CONNECTING); // connecting, ongoing, ended
    const [callDuration, setCallDuration] = useState(0);
    console.log('counterpart', route.params);
    const callee = useMemo(() => {
        if (counterpart) {
            return {
                _id: counterpart._id,
                firstName: counterpart.firstName,
                lastName: counterpart.lastName,
                picture: counterpart.picture,
            };
        }
        return {
            firstName: '',
            lastName: '',
        };
    }, [counterpart]);


    const [isComing, setIsComing] = useState(incoming ? incoming : false);

    const [inCall, setInCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraMuted, setIsCameraMuted] = useState(false);
    const [iframeURL, setIframeURL] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const soundRef = useRef(null);

    const [showIframe, setShowIframe] = useState(false);
    const [permissionsChecked, setPermissionsChecked] = useState(false);
    const [permissionsGranted, setPermissionsGranted] = useState(false);

    const resetInitiate = () => {
        setIframeURL('');
        setCallDuration(0);
        setCallStatus(CALL_STATUS.CONNECTING);
        setInCall(false);
        setShowIframe(false);
    }
    useEffect(() => {
        resetInitiate();
        checkPermissions();
    }, []);

    // Check and request permissions
    const checkPermissions = async () => {
        try {
            // First check if permissions are already granted (from cache)
            const currentPermissions = await checkMediaPermissions();
            
            if (currentPermissions.allGranted) {
                setPermissionsGranted(true);
                setPermissionsChecked(true);
            } else {
                // Request permissions if not granted
                const result = await requestMediaPermissions(lang);
                setPermissionsGranted(result.allGranted);
                setPermissionsChecked(true);
                
                if (!result.allGranted) {
                    Alert.alert(
                        lang.permission_required || 'Permission Required',
                        lang.camera_permission_denied || 'Camera and microphone permissions are required for video calls.',
                        [
                            {
                                text: lang.cancel || 'Cancel',
                                onPress: () => handleEndCall(),
                                style: 'cancel'
                            }
                        ]
                    );
                }
            }
        } catch (error) {
            console.error('Error checking permissions:', error);
            setPermissionsChecked(true);
            setPermissionsGranted(false);
        }
    };

    const playRingtone = async () => {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
              });
              
            const { sound } = await Audio.Sound.createAsync(
                RingingMP3,
                {
                    shouldPlay: true,
                    isLooping: true,
                }
            );
            soundRef.current = sound;
            await sound.playAsync();
        } catch (error) {
            console.error('Lỗi phát nhạc chuông:', error);
        }
    };

    // Hàm stop nhạc chuông
    const stopRingtone = async () => {
        if (soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
            soundRef.current = null;
        }
    };

    const vibrateWhenCallin = () => {
        // Vibration.vibrate(PATTERN, true)
        // playRingtone();
        // setIsComing(true);

        // setTimeout(() => {
        //     Vibration.cancel();
        //     stopRingtone();
        //     setIsComing(false);
        // }, SECONDS_RINGING * ONE_SECOND_IN_MS);
    }

    const stopVibrate = () => {
        Vibration.cancel();
        stopRingtone();
    }



    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            resetInitiate();
        });
        return unsubscribe;
    }, [navigation]);




    useEffect(() => {
        if (isComing) {
            setTimeout(() => {
                vibrateWhenCallin();
            }, 2000);
        } else {
            stopVibrate();
        }
        return () => {
            stopVibrate();
        }
    }, [isComing])

    const getURL = async () => {
        if (room_id && meeting_id) {
            const { livekit, url } = await getWebviewURL({ room_id, meeting_id }, profile.token);
            if (livekit) {
                console.warn("Navigate to LiveKit", livekit);
                navigation.navigate('LiveKit', {
                    token: livekit.token,
                    wsURL: livekit.wsURL,
                    calleeID: callee._id,
                    meetingId: meeting_id,
                });
            } else if (url) {
                setIframeURL(url);
                console.log(Platform.OS + ' - iframeURL', url);
                setTimeout(() => {
                    setShowIframe(true);
                }, ENTERING_TIME_IN_MS);
            }
        }
    }

    useEffect(() => {
        if (IS_END_CALL) {
            handleEndCall();
            stopVibrate();
        }
    }, [IS_END_CALL])

    useEffect(() => {
        let timer;
        if (callStatus === CALL_STATUS.ONGOING && showIframe) {
            setTimeout(() => {
                timer = setInterval(() => {
                    setCallDuration(prev => prev + 1);
                }, 1000);
            }, 3000);
        }
        return () => {
            clearInterval(timer);
            setCallDuration(0);
        };
    }, [callStatus, showIframe]);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };


    const onCall = async () => {
        const response = await joinRoom({ room_id: room_id, meeting_id: meeting_id }, profile.token);
        if (response.ok) {
            setCallStatus(CALL_STATUS.ONGOING);
            setIsComing(false);
            setInCall(true);
        }
    };

    const handleEndCall = async () => {
        setIsLoading(true);
        try {
            dispatch({ type: 'SET_END_CALL', payload: false });
            await reportCallEnded({ meetingId: meeting_id, counterpartId: callee._id }, profile.token);

            setIsComing(false);
            navigation.navigate('Home', { screen: TabRoute.TabContact });
        } catch (error) {
            Alert.alert(lang.error, error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptCall = async () => {
        await answerCall({ meeting_id: meeting_id, user_id: callee._id }, profile.token);
        stopVibrate();
        setInCall(true);
        setCallStatus(CALL_STATUS.ONGOING);
        getURL();
    }
    const handleMute = () => {
        setIsMuted(!isMuted);
    }
    const handleCameraMute = () => {
        setIsCameraMuted(!isCameraMuted);
    }

    useEffect(() => {
        if (room_id && meeting_id && !incoming && profile) {
            onCall();
            getURL();
        }
    }, [room_id, meeting_id, profile]);

    // Show loading while checking permissions
    if (!permissionsChecked) {
        return (
            <View style={[styles.container, { backgroundColor: '#1976D2', justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>
                    {lang.requesting_permissions || 'Checking permissions...'}
                </Text>
            </View>
        );
    }
    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, {
                    // backgroundColor: '#1976D2'
                }]}>
                {iframeURL && callStatus === CALL_STATUS.ONGOING && permissionsGranted && (
                    <View style={{ position: 'absolute', left: 0, top: 0, height: showIframe ? Dimensions.get('screen').height : 0, width: showIframe ? Dimensions.get('screen').width : 0 }}>
                        <IframeScreen url={iframeURL} />
                    </View>
                )}
                {callStatus !== CALL_STATUS.ENDED && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ alignItems: 'center', marginBottom: 30 }}>
                            {callee.picture ? (
                                <CustomImage source={{ uri: ZOOM_API_HOST + '/api/images/' + callee.picture.shieldedID + '/256' }} style={{ width: 120, height: 120, borderRadius: 60 }} />
                            ) : (
                                <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#e9e9e9', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#000' }}>{callee.firstName ? callee.firstName.charAt(0) : ''} </Text>
                                </View>
                            )}
                            <Text style={{ fontSize: 24, fontWeight: 'bold', marginVertical: 10, color: '#000' }}> {callee.firstName} {callee.lastName}</Text>
                            {showIframe && (
                                <Text style={{ fontSize: 16, color: '#000' }}>
                                    {callStatus === CALL_STATUS.CONNECTING ? lang.connecting :
                                        callStatus === CALL_STATUS.ONGOING ? formatDuration(callDuration) :
                                            lang.call_ended}
                                </Text>
                            )}
                        </View>
                        {!inCall  && (
                            <View style={{ flexDirection: 'row', gap: 30 }}>
                                {isComing && (
                                    <TouchableOpacity
                                        onPress={handleAcceptCall}
                                        disabled={isLoading}
                                        style={{
                                        }}>
                                        <LottieView
                                            autoPlay
                                            ref={animation}
                                            style={{
                                                width: 100,
                                                height: 100,
                                            }}
                                            source={RingingLottie}
                                        />

                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={handleEndCall}
                                    disabled={isLoading} style={{ marginTop: 20, backgroundColor: 'red', padding: 10, height: 62, width: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons name='call' size={30} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {inCall && (
                            <View style={{ flexDirection: 'row', }}>
                                {/* <TouchableOpacity
                                    onPress={handleEndCall}
                                    disabled={isLoading} style={{ marginTop: 20, backgroundColor: 'red', padding: 10, height: 62, width: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' }}>
                                    <Ionicons name='call' size={30} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
                                </TouchableOpacity> */}
                            </View>
                        )}
                    </View>
                )}
                {callStatus === CALL_STATUS.ENDED && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ alignItems: 'center', marginBottom: 30 }}>
                            {callee.picture ? (
                                <CustomImage source={{ uri: ZOOM_API_HOST + '/api/images/' + callee.picture.shieldedID + '/256' }} style={{ width: 120, height: 120, borderRadius: 60 }} />
                            ) : (
                                <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#e9e9e9', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#fff' }}>{callee.firstName ? callee.firstName.charAt(0) : ''}</Text>
                                </View>
                            )}
                            <Text style={{ fontSize: 24, fontWeight: 'bold', marginVertical: 10 }}>{callee.firstName} {callee.lastName}</Text>
                            <Text style={{ fontSize: 18, color: '#000' }}>
                                {lang.call_ended}
                            </Text>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </>
    );
}

export default OnCallScreen;