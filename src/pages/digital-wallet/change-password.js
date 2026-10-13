import React, { useEffect, useState } from 'react';
import {
    Text,
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert
} from "react-native";
import styles from "../../styles/global";
import { useLang } from "../../shared/hooks";
import BackButton from "../../components/home/backButton";
import PinInput from "../../components/PinInput";
import { changePassword } from "./fetcher";
import { getItem } from '../../shared/utils';
import { WALLET_STORAGE_TOKEN_KEY } from '../../shared/constant';

function ChangePasswordScreen({ navigation, route }) {
    const { lang } = useLang();
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [accessToken, setAccessToken] = useState('');
    const [currentPin, setCurrentPin] = useState('');
    
    useEffect(() => {
        getItem(WALLET_STORAGE_TOKEN_KEY).then(res => {
            try {
                setAccessToken(res);
            }
            catch {
            }
        });
    }, []);

    const getPinTitle = () => {
        switch (step) {
            case 1:
                return lang.current_password || "Enter Current PIN";
            case 2:
                return lang.new_password || "Enter New PIN";
            default:
                return "";
        }
    };

    const onBack = () => {
        setStep(1);
        setError('');
    };

    const handleCurrentPin = async (pin) => {
        setCurrentPin(pin);
        setStep(2);
    };

    const handleChangePassword = async (pin) => {
        setIsLoading(true);

        let urlencoded = new URLSearchParams();
        urlencoded.append("current_password", currentPin);
        urlencoded.append("new_password", pin);

        const response = await changePassword(urlencoded, accessToken);
        setIsLoading(false);
        if (response.success) {
            Alert.alert("Thành công", "Mật khẩu đã được đổi thành công");
            navigation.goBack();
        } else {
            Alert.alert("Lỗi", response.message);
            setStep(1);
        }

    };
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>

            {/* Header */}
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <BackButton onBack={() => navigation.goBack()} />
                    <Text style={[styles.homeName]}>
                        {lang.change_password || "Change Password"}
                    </Text>
                </View>
            </View>

            <ScrollView
                style={changePasswordStyles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">

                {isLoading ? (
                    <View style={changePasswordStyles.loadingContainer}>
                        <ActivityIndicator size="large" color="#667eea" />
                        <Text style={changePasswordStyles.loadingText}>
                            Đang xử lý...
                        </Text>
                    </View>
                ) : (
                    <View style={changePasswordStyles.formContainer}>
                        {step == 1 && (
                            <PinInput
                                title={getPinTitle()}
                                onComplete={handleCurrentPin}
                                error={error}
                                disabled={isLoading}
                            />
                        )}
                        {step == 2 && (
                            <PinInput
                                title={getPinTitle()}
                                onComplete={handleChangePassword}
                                error={error}
                                disabled={isLoading}
                            />
                        )}
                        <TouchableOpacity onPress={() => onBack()}>
                            <Text style={styles.buttonLabel}>Quay lại</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const changePasswordStyles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    progressContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 12,
        padding: 20,
    },
    progressBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    progressStep: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ddd',
    },
    progressStepActive: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    progressStepText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
    },
    progressStepTextActive: {
        color: '#fff',
    },
    progressLine: {
        width: 60,
        height: 2,
        backgroundColor: '#ddd',
        marginHorizontal: 8,
    },
    progressLineActive: {
        backgroundColor: '#667eea',
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    progressLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        width: 70,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        margin: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    infoIconContainer: {
        marginRight: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#1976D2',
        lineHeight: 20,
    },
    formContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 20,
        minHeight: 400,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    tipsContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 12,
        padding: 20,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 8,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});

export default ChangePasswordScreen;

