import React from 'react';
import { Text, View, TouchableOpacity, ScrollView, StyleSheet, Image, Modal, TextInput, Alert, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { getAccountInfo, loginWalletAccount } from './fetcher';
import { getItem } from '../../shared/utils';
import { WALLET_STORAGE_TOKEN_KEY } from '../../shared/constant';
import { useGlobal } from '../../state/global';
import { enableBiometric, isBiometricEnabled, removeBiometric } from './authService';
import PinLoginPopup from './pin-login-popup';

function AccountInfo({ navigation, route }) {
    const { state } = useGlobal();
    const { profile } = state;
    const [accountInfo, setAccountInfo] = React.useState({
        email: '',
        phone: '',
        id: '',
        status_kyc: ''
    });
    const [isFaceIdEnabled, setIsFaceIdEnabled] = React.useState(false);
    const [showPinModal, setShowPinModal] = React.useState(false);
    const [userToken, setUserToken] = React.useState('');

    const loadAccount = async (token) => {
        const { data, success } = await getAccountInfo(token);
        if (success) {
            setAccountInfo(data);
        }
    }

    const checkFaceIdStatus = async () => {
        const enabled = await isBiometricEnabled();
        setIsFaceIdEnabled(enabled);
    }

    React.useEffect(() => {
        getItem(WALLET_STORAGE_TOKEN_KEY).then(async (token) => {
            if (token) {
                setUserToken(token);
                loadAccount(token);
                checkFaceIdStatus();
            }
        });
    }, [profile]);

    const MenuItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
        <TouchableOpacity style={accountStyles.menuItem} onPress={onPress}>
            <View style={accountStyles.menuLeft}>
                <View style={accountStyles.menuIcon}>
                    <Ionicons name={icon} size={20} color="#007AFF" />
                </View>
                <View style={accountStyles.menuContent}>
                    <Text style={accountStyles.menuTitle}>{title}</Text>
                    {subtitle && <Text style={accountStyles.menuSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {showArrow && (
                <Ionicons name="chevron-forward" size={16} color="#999" />
            )}
        </TouchableOpacity>
    );

    const handleFaceIdToggle = () => {
        if (!isFaceIdEnabled) {
            setShowPinModal(true);
        } else {
            Alert.alert(
                'Tắt Face ID',
                'Bạn có chắc muốn tắt xác thực bằng sinh trắc học?',
                [
                    { text: 'Hủy', onPress: () => { }, style: 'cancel' },
                    {
                        text: 'Tắt',
                        onPress: async () => {
                            setIsFaceIdEnabled(false);
                            await removeBiometric();
                        },
                        style: 'destructive'
                    }
                ]
            );
        }
    };

    const handlePinVerification = async (pin) => {
        if (!pin) {
            Alert.alert('Lỗi', 'Vui lòng nhập PIN');
            return;
        }


        let urlencoded = new URLSearchParams();
        urlencoded.append("username", profile.email.split('@')[0].replaceAll(/[^a-zA-Z0-9]/g, ''));
        urlencoded.append("password", pin);
        
        const response = await loginWalletAccount(urlencoded);
        if (!response.success) {
            Alert.alert("Lỗi", "Mã Pin không chính xác");
            return;
        }
        
        try {
            const success = await enableBiometric(pin, Platform.OS);

            if (success) {
                setIsFaceIdEnabled(true);
                setShowPinModal(false);
                Alert.alert('Thành công', 'Xác thực đã được bật');
            } else {
                Alert.alert('Lỗi', 'Thiết bị của bạn không hỗ trợ hoặc chưa cấu hình');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi bật Face ID');
        }
    };

    return (
        <ScrollView style={accountStyles.content} showsVerticalScrollIndicator={false}>
            {/* Profile Section */}
            <View style={accountStyles.profileSection}>
                <View style={accountStyles.profileHeader}>
                    <View style={accountStyles.avatar}>
                        {profile?.avatar ? (
                            <Image source={{ uri: profile.avatar }} style={accountStyles.avatarImage} />
                        ) : (
                            <Ionicons name="person" size={32} color="#007AFF" />
                        )}
                    </View>
                    <View style={accountStyles.profileInfo}>
                        <Text style={accountStyles.profileName}>
                            {profile?.email}
                        </Text>
                        <View style={accountStyles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color={accountInfo.status_kyc === 'none' ? '#FF0000' : '#4CAF50'} />
                            {accountInfo.status_kyc === 'none' ? (
                                <Text style={[accountStyles.verifiedText, { color: '#FF0000' }]}>Chưa KYC</Text>
                            ) : (
                                <Text style={accountStyles.verifiedText}>Đã KYC</Text>
                            )}
                        </View>
                    </View>
                    {/* <TouchableOpacity style={accountStyles.editButton}>
                        <Ionicons name="create-outline" size={20} color="#007AFF" />
                    </TouchableOpacity> */}
                </View>
            </View>

            {/* Menu Items */}
            <View style={accountStyles.section}>
                <MenuItem
                    icon="card-outline"
                    title="Thông tin tài khoản"
                    subtitle=""
                // onPress={() => navigation.navigate('ProfileEdit')}
                />
                <MenuItem
                    icon="shield-checkmark-outline"
                    title="KYC tài khoản"
                    subtitle="Xác thực danh tính"
                    onPress={() => navigation.navigate('WalletKYC')}
                />
                <MenuItem
                    icon="lock-closed-outline"
                    title="Đổi mật khẩu"
                    subtitle=""
                    onPress={() => navigation.navigate('WalletChangePassword')}
                />
            </View>

            {/* Face ID Section */}
            <View style={accountStyles.section}>
                <View style={accountStyles.faceIdItem}>
                    <View style={accountStyles.menuLeft}>
                        <View style={accountStyles.menuIcon}>
                            <Ionicons name="settings" size={20} color="#007AFF" />
                        </View>
                        <View style={accountStyles.menuContent}>
                            <Text style={accountStyles.menuTitle}>Xác thực bằng sinh trắc học</Text>
                            <Text style={accountStyles.menuSubtitle}>
                                {isFaceIdEnabled ? 'Đã bật' : 'Chưa bật'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[
                            accountStyles.toggleSwitch,
                            isFaceIdEnabled && accountStyles.toggleSwitchActive
                        ]}
                        onPress={() => handleFaceIdToggle()}
                    >
                        <View
                            style={[
                                accountStyles.toggleThumb,
                                isFaceIdEnabled && accountStyles.toggleThumbActive
                            ]}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {showPinModal && (
                <PinLoginPopup
                    visible={showPinModal}
                    mode="login"
                    onSuccess={(pin) => handlePinVerification(pin)}
                    onCancel={() => { setShowPinModal(false); }}
                    isLoading={false}
                    hideForgot
                />
            )}
        </ScrollView>
    );
}

const accountStyles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    profileSection: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 12,
        padding: 20,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    verifiedText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '500',
    },
    editButton: {
        padding: 8,
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    faceIdItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f8ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#999',
        marginTop: 2,
    },
    versionSection: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
    },
    versionText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
    toggleSwitch: {
        width: 50,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#e0e0e0',
        padding: 2,
        justifyContent: 'center',
    },
    toggleSwitchActive: {
        backgroundColor: '#4CAF50',
    },
    toggleThumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#fff',
        alignSelf: 'flex-start',
    },
    toggleThumbActive: {
        alignSelf: 'flex-end',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    modalBody: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 20,
        alignItems: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    pinInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 18,
        marginBottom: 24,
        textAlign: 'center',
        letterSpacing: 4,
    },
    verifyButton: {
        width: '100%',
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AccountInfo;