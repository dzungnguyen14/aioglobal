import { Text, View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import styles from "../../styles/global";
import { useLang, useProfile } from "../../shared/hooks";
import BackButton from "../../components/home/backButton";
import { useState, useEffect, useMemo } from "react";
import AccountInfo from "./account-info";
import OnboardingPopup from "./onboarding-popup";
import PinLoginPopup from "./pin-login-popup";
import { checkIfExistEmail, getAllTransaction, getListToken, loginWalletAccount, registerWalletAccount, updateOnboardWallet } from "./fetcher";
import { walletStyles } from "./styles";
import { WALLET_STORAGE_TOKEN_KEY } from "../../shared/constant";
import { formatMoneyByCurrency, getItem, setItem } from "../../shared/utils";
import { Image } from "expo-image";
import { TransactionItem } from "./transaction-history";
import { useGlobal } from "../../state/global";

const Tab = {
    Balance: 'balance',
    QR: 'qr',
    Account: 'account',
}

function DigitalWalletScreen({ navigation, route }) {
    const { lang } = useLang();
    const [tab, setTab] = useState(Tab.Balance);
    const [isShowBalance, setIsShowBalance] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [accessToken, setAccessToken] = useState('');
    const { state } = useGlobal();
    const { profile } = state;
    
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showPinLogin, setShowPinLogin] = useState(false);
    const [showPinCreate, setShowPinCreate] = useState(false);
    const [isWalletUnlocked, setIsWalletUnlocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [wallet, setWallet] = useState([]);

    const [balance, setBalance] = useState({    
        amount: 0,
        currency: "USDT",
    });

    const walletUsername = useMemo(() => {
        return profile.email ? profile.email.split('@')[0].replaceAll(/[^a-zA-Z0-9]/g, '') : '';
    }, [profile.email]);

    const checkOnboard = async () => {
        const walletStorageToken = await getItem(WALLET_STORAGE_TOKEN_KEY);
        if (walletStorageToken) {
            setIsWalletUnlocked(true);
            setShowOnboarding(false);
            setIsLoading(false);
            setAccessToken(walletStorageToken);
        } else {
            const { data } = await checkIfExistEmail(profile.email);
            if (data && data.exists) {
                setShowOnboarding(false);
                setShowPinLogin(true);
            } else {
                setShowOnboarding(true);
            }
        }
    }

    useEffect(() => {
        if (profile.token) {
            checkOnboard();
        }
    }, [profile.token]);

    const handlePinCreateSuccess = async (pin) => {
        setIsLoading(true);
        
        let urlencoded = new URLSearchParams();
        urlencoded.append("name", profile.fullname);
        urlencoded.append("username", walletUsername);
        urlencoded.append("email", profile.email);
        urlencoded.append("password", pin);
        urlencoded.append("phone", profile.phone_number);
        urlencoded.append("ref", "");
        
        const response = await registerWalletAccount(urlencoded);
        if (response.success) {
            await updateOnboardWallet(profile.token);
            setIsWalletUnlocked(true);
            setShowPinCreate(false);
            setAccessToken(response.data.token);
            await setItem(WALLET_STORAGE_TOKEN_KEY, response.data.token);
        } else {
            Alert.alert("Lỗi", "Có lỗi xảy ra, vui lòng thử lại");
        }
        
        setIsLoading(false);
    };
   
    const handlePinLoginSuccess = async (pin) => {
        setIsLoading(true);
        let urlencoded = new URLSearchParams();
        urlencoded.append("username", walletUsername);
        urlencoded.append("password", pin);
        
        const response = await loginWalletAccount(urlencoded);
        if (response.success) {
            setIsWalletUnlocked(true);
            setShowPinLogin(false);
            setAccessToken(response.data.token);
            await setItem(WALLET_STORAGE_TOKEN_KEY, response.data.token);
        } else {
            Alert.alert("Lỗi", "Mã Pin không chính xác");
        }
        
        setIsLoading(false);
    };

    const handleForgotPin = () => {
        setShowPinLogin(false);
        Alert.alert(
            'Quên mã PIN',
            'Để đặt lại mã PIN, vui lòng liên hệ với bộ phận hỗ trợ khách hàng hoặc xác thực qua email/số điện thoại.',
            [
                { text: 'Hủy', style: 'cancel', onPress: () => setShowPinLogin(true) },
                { text: 'Liên hệ hỗ trợ', onPress: () => navigation.navigate('Support') }
            ]
        );
    };

    const handleCancelPin = () => {
        setShowPinLogin(false);
        setShowPinCreate(false);
        navigation.goBack();
    };

    const fetchTokens = async () => {
        const response = await getListToken(accessToken)
        if (response.success) {
            const wallets = response.data;
            let totalAmount = 0;
            wallets.forEach(wallet => {
                const decimals = parseInt(wallet.decimals, 10);
                const price = parseInt(wallet.price, 10) / Math.pow(10, decimals);
                const amount = parseFloat(wallet.balance, 10) / Math.pow(10, decimals);

                totalAmount += amount > 0 ? amount * price : 0;
            }); 
            setWallet(wallets);
            setBalance({
                amount: totalAmount,
                currency: 'USDT',
            });
        } else {
            setShowPinLogin(true);
        }
    }

    const fetchTransactions = async () => {
        const response = await getAllTransaction(accessToken);
        if (response.success && response.data.length > 0) {
            let transactions = response.data.splice(0, 5);
            transactions.forEach(transaction => {
                const decimals = parseInt(transaction.token?.decimals, 10);
                const amount = parseFloat(transaction.amount, 10);
                transaction.amount = amount > 0 ? (amount / Math.pow(10, decimals)) : 0;
            });
            setTransactions(transactions);
        }
    }
    useEffect(() => {
        if (accessToken) {
            fetchTokens();
            fetchTransactions();
        }
    }, [accessToken]);

   
    // Don't render wallet content until unlocked
    if (isLoading || !isWalletUnlocked) {
        return (
            <>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}>
                    
                    {/* Header */}
                    <View style={[styles.homeHeader, { zIndex: 999 }]}>
                        <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                            <BackButton onBack={() => navigation.goBack()} />
                            <Text style={[styles.homeName]}>
                                {lang.digital_wallet || "Digital Wallet"}
                            </Text>
                        </View>
                    </View>

                    {/* Loading or locked state */}
                    <View style={walletStyles.lockedContainer}>
                        <Ionicons name="lock-closed" size={64} color="#667eea" />
                        <Text style={walletStyles.lockedText}>
                            {isLoading ? 'Đang tải...' : 'Ví đang được bảo vệ'}
                        </Text>
                    </View>
                </KeyboardAvoidingView>

                <OnboardingPopup
                    visible={showOnboarding}
                    onComplete={() => {
                        setShowOnboarding(false);
                        setTimeout(() => {
                            setShowPinCreate(true);
                        }, 300);
                    }}
                    onSkip={() => {
                        navigation.goBack();
                    }}
                />
                {showPinCreate && (
                    <PinLoginPopup
                        visible={showPinCreate}
                        mode="create"
                        onSuccess={handlePinCreateSuccess}
                        onCancel={handleCancelPin}
                        isLoading={isLoading}
                    />
                )}
                {showPinLogin && (
                    <PinLoginPopup
                        visible={showPinLogin}
                        mode="login"
                        onSuccess={handlePinLoginSuccess}
                        onForgotPin={handleForgotPin}
                        onCancel={handleCancelPin}
                        isLoading={isLoading}
                    />
                )}
            </>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            
            {/* Header */}
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <BackButton onBack={() => navigation.goBack()} />
                    <Text style={[styles.homeName]}>
                        {lang.digital_wallet || "Digital Wallet"}
                    </Text>
                </View>
            </View>
            {tab === Tab.Balance && (
            <ScrollView style={walletStyles.content} showsVerticalScrollIndicator={false}>
                {/* Balance Card */}
                <View style={walletStyles.balanceCard}>
                    <View style={walletStyles.balanceHeader}>
                        <Text style={walletStyles.balanceLabel}>💰 Đã xác minh</Text>
                            <TouchableOpacity>
                            {isShowBalance ? (
                                <Ionicons name="eye-outline" size={20} color="rgba(255,255,255,0.8)" onPress={() => setIsShowBalance(!isShowBalance)} />
                            ) : (
                                <Ionicons name="eye-off-outline" size={20} color="rgba(255,255,255,0.8)" onPress={() => setIsShowBalance(!isShowBalance)} />
                            )}
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={walletStyles.balanceTitle}>Số dư khả dụng</Text>
                    <Text style={[walletStyles.balanceAmount, { marginBottom: 20 }]}>{isShowBalance ? formatMoneyByCurrency(balance.amount, balance.currency) : '********'} {balance.currency}</Text>

                    {/* Action Buttons */}
                    <View style={walletStyles.actionButtonsRow}>
                        <TouchableOpacity onPress={() => wallet && navigation.navigate('DepositWallet', { wallet: wallet })} style={walletStyles.primaryButton}>
                            <Ionicons name="add" size={18} color="#fff" />
                            <Text style={walletStyles.primaryButtonText}>Nạp tiền</Text>
                        </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('WithdrawWallet')} style={walletStyles.secondaryButton}>
                            <Ionicons name="send" size={18} color="#000" />
                            <Text style={walletStyles.secondaryButtonText}>Thanh toán</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                    {/* Transaction History */}
                <View style={walletStyles.section}>
                    <View style={walletStyles.sectionHeader}>
                        <Text style={walletStyles.sectionTitle}>Lịch sử giao dịch</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
                            <Text style={walletStyles.sectionLink}>Xem thêm</Text>
                        </TouchableOpacity>
                    </View>

                    {transactions.map((transaction) => (
                        <TransactionItem key={transaction.id} item={transaction} />
                    ))}
                </View>
            </ScrollView>
            )}
            {tab === Tab.QR && (
                <></>
            )}
            {tab === Tab.Account && (
               <AccountInfo navigation={navigation} route={route} />
            )}
            <View style={walletStyles.bottomButtons}>
                <TouchableOpacity
                    style={walletStyles.bottomButton}
                    onPress={() => setTab(Tab.Balance)}>
                    <Ionicons name="home"  color="#d9d9d9" style={tab === Tab.Balance ? walletStyles.bottomButtonIconActive : walletStyles.bottomButtonIcon} />
                    <Text style={tab === Tab.Balance ? walletStyles.bottomButtonTextActive : walletStyles.bottomButtonText}>Trang chủ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={walletStyles.bottomButton}
                    onPress={() => navigation.navigate('BarcodeScanner')}>
                    <Ionicons name="scan" color="#999" style={[tab === Tab.QR ? walletStyles.bottomButtonIconActive : walletStyles.bottomButtonIcon, walletStyles.qrIconStyle]} />
                    <Text style={tab === Tab.QR ? walletStyles.bottomButtonTextActive : walletStyles.bottomButtonText}>Thanh toán</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={walletStyles.bottomButton}
                    onPress={() => setTab(Tab.Account)}>
                    <Ionicons name="person" color="#d9d9d9" style={tab === Tab.Account ? walletStyles.bottomButtonIconActive : walletStyles.bottomButtonIcon} />
                    <Text style={tab === Tab.Account ? walletStyles.bottomButtonTextActive : walletStyles.bottomButtonText}>Tài khoản</Text>
                </TouchableOpacity>
            </View>

        </KeyboardAvoidingView>
    )
}
export default DigitalWalletScreen;