import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal, 
    TouchableOpacity, 
    Dimensions,
    Animated,
    Vibration,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../shared/hooks';
import { useNavigation } from '@react-navigation/native';
import { useGlobal } from '../../state/global';
import { forgotPassword } from './fetcher';
import { getBiometricType, isBiometricEnabled, loginWithBiometric } from './authService';

const { width } = Dimensions.get('window');

const PinLoginPopup = ({ visible, onSuccess, onForgotPin, onCancel, mode = 'login', hideForgot = false }) => {
    const { state } = useGlobal();
    const { profile } = state;
    const navigation = useNavigation();
    const { lang } = useLang();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const shakeAnimation = useRef(new Animated.Value(0)).current;
    const inputRefs = useRef([]);
    const [seconds, setSeconds] = useState(0);
    const [allowForgotPin, setAllowForgotPin] = useState(true);
    const [loading, setLoading] = useState(true);
    const SECONDS_TO_ALLOW_FORGOT_PIN = 120;

    // mode can be 'login', 'create', or 'verify'
    const isCreateMode = mode === 'create';
    const isVerifyMode = mode === 'verify';
    const isLoginMode = mode === 'login';

    const handleBiometricAuth = async () => {
        const pinCode = await loginWithBiometric();
        if (pinCode) {
            console.log(pinCode);
            onSuccess(pinCode);
        } else {
            Alert.alert("Lỗi", "Xác thực bằng sinh trắc học thất bại");
        }
    }

    useEffect(() => {
        const checkBiometricEnabled = async () => {
            const enabled = await isBiometricEnabled();
            if(enabled && (isLoginMode || isVerifyMode)) {
                handleBiometricAuth();
            }
            setLoading(false);
        }
        checkBiometricEnabled();
    }, []);

    useEffect(() => {
        if (!allowForgotPin && seconds > 0) {
            const timer = setInterval(() => {
                setSeconds(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else {
            setAllowForgotPin(true);
        }
    }, [allowForgotPin, seconds]);

    useEffect(() => {
        if (visible) {
            setPin('');
            setError('');
        }
    }, [visible]);

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
        Vibration.vibrate(100);
    };

    const handlePinComplete = (enteredPin) => {
        // All modes now directly call onSuccess
        onSuccess(enteredPin);
    };

    const handleNumberPress = (number) => {
        if (pin.length < 6) {
            const newPin = pin + number;
            setPin(newPin);
            
            if (newPin.length === 6) {
                handlePinComplete(newPin);
            }
        }
    };
    const handleClear = () => {
        setPin('');
        setError('');
    };
    const handleDelete = () => {
        setPin(pin.slice(0, -1));
        setError('');
    };

    const handleCancel = () => {
        setPin('');
        setError('');
        onCancel();
    };

    const getTitle = () => {
        if (isCreateMode) {
            return 'Tạo mã PIN';
        } else if (isVerifyMode) {
            return 'Xác thực mã PIN';
        }
        return 'Nhập mã PIN';
    };

    const getSubtitle = () => {
        if (isCreateMode) {
            return 'Tạo mã PIN 6 số để bảo vệ ví của bạn';
        } else if (isVerifyMode) {
            return 'Nhập mã PIN để xác thực giao dịch';
        }
        return 'Nhập mã PIN để truy cập ví điện tử';
    };

    const handleForgotPin = async () => {

        let urlencoded = new URLSearchParams();
        urlencoded.append("email", profile.email);
        const response = await forgotPassword(urlencoded);
        if (response.success) {
            Alert.alert("Thành công", "Mã PIN đã được gửi đến email của bạn");
            setAllowForgotPin(false);
            setSeconds(SECONDS_TO_ALLOW_FORGOT_PIN);
        } else {
            Alert.alert("Lỗi", response.msg);
        }
    }

    if(loading) return <></>
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="lock-closed" size={40} color="#667eea" />
                        </View>
                        <Text style={styles.title}>{getTitle()}</Text>
                        <Text style={styles.subtitle}>{getSubtitle()}</Text>
                    </View>

                    {/* PIN Display */}
                    <Animated.View
                        style={[
                            styles.pinContainer,
                            { transform: [{ translateX: shakeAnimation }] }
                        ]}
                    >
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                            <View
                                key={index}
                                style={[
                                    styles.pinDot,
                                    pin.length > index && styles.pinDotFilled,
                                    error && styles.pinDotError
                                ]}
                            >
                                {pin.length > index && (
                                    <View style={styles.pinDotInner} />
                                )}
                            </View>
                        ))}
                    </Animated.View>

                    {/* Error Message */}
                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : (
                        <View style={styles.errorPlaceholder} />
                    )}

                    {/* Number Pad */}
                    <View style={styles.numberPad}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                            <TouchableOpacity
                                key={number}
                                style={styles.numberButton}
                                onPress={() => handleNumberPress(number.toString())}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.numberText}>{number}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity style={styles.numberButton} onPress={handleClear} >
                            <Ionicons name="trash-outline" size={28} color="#333" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.numberButton}
                            onPress={() => handleNumberPress('0')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.numberText}>0</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.numberButton}
                            onPress={handleDelete}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="backspace-outline" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>
                    {!hideForgot && (
                        <TouchableOpacity
                            disabled={!allowForgotPin}
                            style={styles.forgotPinButton}
                            onPress={handleForgotPin}
                        >
                            <Text style={[styles.forgotPinButtonText, allowForgotPin ? styles.forgotPinButtonTextEnabled : styles.forgotPinButtonTextDisabled]}>Quên mật khẩu {seconds > 0 ? `(${seconds}s)` : ''}</Text>
                        </TouchableOpacity>
                    )}
                    {/* Cancel Button */}
                    <TouchableOpacity
                        style={[styles.cancelButton]}
                        onPress={handleCancel}
                    >
                        <Text style={[styles.cancelButtonText, , { color: '#667eea' }]}>Hủy</Text>
                    </TouchableOpacity>
                    {/* { Forgot Pin Button } */}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.9,
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#667eea20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        marginBottom: 8,
    },
    pinDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinDotFilled: {
        borderColor: '#667eea',
        backgroundColor: '#667eea',
    },
    pinDotError: {
        borderColor: '#F44336',
        backgroundColor: '#F44336',
    },
    pinDotInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    errorText: {
        color: '#F44336',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        minHeight: 20,
    },
    errorPlaceholder: {
        height: 20,
        marginBottom: 16,
    },
    numberPad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 300,
        marginBottom: 16,
    },
    numberButton: {
        width: '30%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: '1.5%',
        borderRadius: 50,
        backgroundColor: '#f5f5f5',
    },
    numberText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#333',
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '600',
    },
    forgotPinButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        marginBottom: 20
    },
    forgotPinButtonText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '600',
    },
    forgotPinButtonTextEnabled: {
        color: '#667eea',
    },
    forgotPinButtonTextDisabled: {
        color: '#999',
    },
});

export default PinLoginPopup;

