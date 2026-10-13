import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    Text,
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
} from "react-native";
import { Ionicons, } from '@expo/vector-icons';
import styles from "../../styles/global";
import { formatMoneyByCurrency, getItem } from "../../shared/utils";
import PinLoginPopup from "./pin-login-popup";
import BackButton from "../../components/home/backButton";
import { WALLET_STORAGE_TOKEN_KEY } from "../../shared/constant";
import { createOrderTransaction, getBankList, getListToken, getTokens, getVNDRateExchange, loginWalletAccount } from "./fetcher";
import { Image } from "expo-image";
import { Picker } from "@react-native-picker/picker";
import { QRPay } from "vietnam-qr-pay";
import CompletedPopup from "./completed-popup";
import { useGlobal } from "../../state/global";

const defaultPayment = {
    Bank: 1,
    VNPay: 2
}
function WithdrawWalletScreen({ navigation, route }) {
    const { barcode } = route.params || {};
    const { state } = useGlobal();
    const { profile } = state;

    const [availableBalance, setAvailableBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [bankName, setBankName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPinVerify, setShowPinVerify] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [accessToken, setAccessToken] = useState(null);
    const amountInputRef = useRef(null);
    const [vndRateExchange, setVNDRateExchange] = useState(0);
    const [wallet, setWallet] = useState(null);
    const [walletInfo, setWalletInfo] = useState(null);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [fiatId, setFiatId] = useState(1);
    const [bankList, setBankList] = useState(null);
    const [configFee, setConfigFee] = useState({
        fee: 0.5,
        feeValue: 0,
    });
    const [showCompletedPopup, setShowCompletedPopup] = useState(false);
    const [payment, setPayment] = useState(defaultPayment.Bank);
    const [vnpayInfo, setVnpayInfo] = useState({
        name: '',
        store: '',
    });
    const [tokens, setTokens] = useState(null);

    const walletUsername = useMemo(() => {
        return profile.email ? profile.email.split('@')[0].replaceAll(/[^a-zA-Z0-9]/g, '') : '';
    }, [profile.email]);
 
    React.useEffect(() => {
        if (barcode) {
            const qrResult = new QRPay(barcode);
            const { consumer, merchant, additionalData, amount } = qrResult;
            if (parseInt(amount) > 0) {
                setAmount(parseInt(amount));
            }
            if (qrResult.provider?.name.toUpperCase() === "VNPAY") {
                setVnpayInfo({
                    name: merchant.name ?? '',
                    store: additionalData.store ?? '',
                })
                setPayment(defaultPayment.VNPay);
            } 
            if (consumer.bankNumber && consumer.bankBin) {
                setPayment(defaultPayment.Bank);
                setBankAccount(consumer.bankNumber);
                setBankName(consumer.bankBin);
            }
        }
    }, [barcode, bankList]);

    const formatCurrency = (amount) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const handleAmountChange = (text) => {
        if(payment === defaultPayment.VNPay) {
            return;
        }
        // Remove non-numeric characters'
        const numericValue = text.replace(/[^0-9]/g, '');
        setAmount(numericValue);
        
    };


    React.useEffect(() => {
        if(parseInt(amount) > 0) {
            setConfigFee({
                fee: 0.5,
                feeValue: parseInt(amount * 0.5 / 100),
            });
        }
    }, [amount]);

    const validateForm = () => {
        if (amount <= 0) {
            Alert.alert('Lỗi', 'Số tiền thanh toán phải lớn hơn 0');
            return false;
        }
        return true;
    };

    const handleWithdraw = async () => {
        if (!validateForm()) return;
        setShowPinVerify(true);
    };

    const handlePinVerifySuccess = async (pin) => {
        setIsLoading(true);
        let urlencoded = new URLSearchParams();
        urlencoded.append("username", walletUsername);
        urlencoded.append("password", pin);
        
        const response = await loginWalletAccount(urlencoded);
        if (response.success) {
            setShowPinVerify(false);
            processWithdrawal();
        } else {
            Alert.alert("Lỗi", "Mã Pin không chính xác");
        }
        setIsLoading(false);
    };

    const fetchBankList = async () => {
        const response = await getBankList(profile.token);
        if (response.success) {
            setBankList(response.bank_list ?? []);
        }
    }

    React.useEffect(() => {
        if (profile) {
            fetchBankList();
        }
    }, [profile.token]);

    const processWithdrawal = async () => {
        setLoading(true);
        try {
            let urlencoded = new URLSearchParams();
            urlencoded.append("token_id", selectedWallet);
            urlencoded.append("amount_fiat", amount);
            urlencoded.append("fiat_id", fiatId);
            urlencoded.append("type_fee", 0);
            urlencoded.append("type_order", 'payment');
            urlencoded.append("bank_account_number", bankAccount);
            urlencoded.append("bank_id", bankName || '');
            urlencoded.append("qr_code", barcode || '');
            const response = await createOrderTransaction(urlencoded, accessToken);
            if (response.errors) {
                Alert.alert('Lỗi', 'Thanh toán thất bại. Vui lòng thử lại.');
                return;
            } else if (!response.success) {
                Alert.alert('Lỗi', response.message);
            }
            else {
                setShowCompletedPopup(true);
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi xử lý yêu cầu thanh toán. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };
    const onSelectWallet = (walletId) => {
        setSelectedWallet(walletId);
        setWalletInfo(wallet.find(wallet => wallet.id === walletId));
    }

    React.useEffect(() => {
        if (tokens && selectedWallet) {
            const token = tokens.find(token => token.id === selectedWallet);
            if (token && token.fee) {
                setConfigFee({
                    fee: parseFloat(token.fee),
                    feeValue: parseInt(amount * parseFloat(token.fee) / 100),
                });
            }
        }
    }, [selectedWallet, tokens]);


    const fetchVNDRateExchange = async () => {
        setIsLoading(true);
        const response = await getVNDRateExchange(accessToken);
        if (response.success && response.data.length > 0) {
            setVNDRateExchange(parseFloat(response.data[0].rate_usd));
            setFiatId(response.data[0].id);
        }
        setIsLoading(false);
    }

    const fetchTokens = async () => {
        const response = await getTokens(accessToken);
        if (response.success) {
            setTokens(response.data);
        }
    }

    const fetchWallet = async () => {
        setIsLoading(true);
        const response = await getListToken(accessToken);
        if (response.success) {
            let userWallet = response.data.sort((a, b) => a.name.localeCompare(b.name));
            let availableBalance = 0;
            userWallet.forEach(wallet => {
                const decimals = parseInt(wallet.decimals, 10);
                wallet.price_usd = parseInt(wallet.price, 10) / Math.pow(10, decimals);
                const amount = parseFloat(wallet.balance, 10) / Math.pow(10, decimals);

                wallet.balance = amount > 0 ? amount : 0;
                availableBalance += wallet.balance > 0 ? wallet.balance * wallet.price_usd : 0;
            });
            setWallet(userWallet);
            setAvailableBalance(availableBalance);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        getItem(WALLET_STORAGE_TOKEN_KEY).then(res => {
            try {
                setAccessToken(res);
            }
            catch {
            }
        });
    }, []);

    useEffect(() => {
        if (accessToken) {
            fetchWallet();
            fetchVNDRateExchange();
            fetchTokens();
        }
    }, [accessToken]);

    useEffect(() => {
        if (wallet && wallet.length > 0) {
            if (!selectedWallet) {
                const defaultWallet = wallet.find(wallet => wallet.name.toUpperCase().indexOf('AIO') !== -1);

                setSelectedWallet(defaultWallet ? defaultWallet.id : wallet[0].id);
                setWalletInfo(defaultWallet ? defaultWallet : wallet[0]);
            } else {
                setWalletInfo(wallet.find(wallet => wallet.id === selectedWallet));
            }
        }
    }, [wallet]);

    const onHandleCompletedPopup = () => {
        setShowCompletedPopup(false);
        setBankAccount('');
        setAccountHolder('');
        setBankName('');
        setAmount('');
        setConfigFee({
            fee: 0.5,
            feeValue: 0,
        });

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
                        {"Thanh toán"}
                    </Text>
                    <View style={{ position: 'absolute', right: 20, top: Platform.OS === 'ios' ? 60 : 20 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('BarcodeScanner')}>
                            <Ionicons name="qr-code" size={24} color="#3f85ca" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <ScrollView style={withdrawStyles.content} showsVerticalScrollIndicator={false}>
                {/* Balance Info */}
                <View style={withdrawStyles.balanceCard}>
                    <Text style={withdrawStyles.balanceTitle}>Số dư khả dụng</Text>
                    <Text style={withdrawStyles.balanceAmount}>{formatMoneyByCurrency(availableBalance, 'USDT')}</Text>
                    {vndRateExchange > 0 && (
                        <Text style={withdrawStyles.balanceEquivalent}>
                            ≈ {parseInt(availableBalance / vndRateExchange).toLocaleString('vi-VN').replaceAll('.', ',')} đ
                        </Text>
                    )}
                </View>

                {/* Amount Input Section */}
                <View style={withdrawStyles.section}>
                    <Text style={withdrawStyles.sectionTitle}>Thanh toán</Text>
                    <View style={withdrawStyles.amountInputContainer}>
                        <TextInput
                            ref={amountInputRef}
                            style={withdrawStyles.amountInput}
                            value={amount ? formatCurrency(amount) : ''}
                            onChangeText={handleAmountChange}
                            placeholder="Nhập số tiền"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            maxLength={15}
                        />
                        <Text style={withdrawStyles.currencyLabel}>
                            {'VND'}
                        </Text>
                    </View>
                    <View style={withdrawStyles.feeContainer}>
                        <Text style={withdrawStyles.feeText}>Phí </Text>
                        <Text style={withdrawStyles.feeValue}>{configFee.fee}%</Text>

                    </View>
                    <View style={withdrawStyles.feeContainer}>
                        <Text style={withdrawStyles.feeText}>Phí chuyển tiền </Text>
                        <Text style={withdrawStyles.feeValue}>{configFee.feeValue.toLocaleString('vi-VN').replaceAll('.', ',')} VND</Text>
                    </View>
                </View>
                <View style={withdrawStyles.content}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {wallet && (
                            <View style={withdrawStyles.walletContainer}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={withdrawStyles.walletScrollView}>
                                    {wallet.map((wallet) => (
                                        <TouchableOpacity onPress={() => onSelectWallet(wallet.id)} key={wallet.id} style={[withdrawStyles.walletItem, selectedWallet === wallet.id && withdrawStyles.walletItemSelected]}>
                                            <Image source={{ uri: 'https://admin.alowallet.net/storage/' + wallet.image }} style={withdrawStyles.walletImage} />
                                            <Text style={withdrawStyles.walletText}>{wallet.balance.toLocaleString('en-US')} {wallet.symbol}</Text>
                                            <Text style={withdrawStyles.walletTextSmall}>{parseInt(wallet.balance * wallet.price_usd / vndRateExchange).toLocaleString('vi-VN').replaceAll('.', ',')} đ</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </ScrollView>
                </View>
                {payment === defaultPayment.VNPay && (
                    <View style={withdrawStyles.section}>
                        <Text style={withdrawStyles.sectionTitle}>Thông tin thanh toán VNPay</Text>
                        <View style={withdrawStyles.inputContainer}>
                            <Text style={withdrawStyles.inputLabel}>Đối tác</Text>
                            <Text style={[withdrawStyles.inputValue, { fontWeight: 'bold', fontSize: 16 }]}>{vnpayInfo.name}</Text>
                        </View>
                        <View style={withdrawStyles.inputContainer}>
                            <Text style={withdrawStyles.inputLabel}>Tên cửa hàng</Text>
                            <Text style={[withdrawStyles.inputValue, { fontWeight: 'bold', fontSize: 16 }]}>{vnpayInfo.store}</Text>
                        </View>
                    </View>
                )}
                {payment === defaultPayment.Bank && (
                    <View style={withdrawStyles.section}>
                        <Text style={withdrawStyles.sectionTitle}>Thông tin tài khoản ngân hàng</Text>
                        {bankList && (
                            <View style={withdrawStyles.inputContainer}>
                                <Text style={withdrawStyles.inputLabel}>Tên ngân hàng</Text>
                                <Picker
                                    selectedValue={bankName}
                                    onValueChange={setBankName}
                                    style={withdrawStyles.picker}
                                >
                                    {bankList.map((bank) => (
                                        <Picker.Item key={bank.id} label={bank.short_name} value={bank.id} />
                                    ))}
                                </Picker>
                            </View>
                        )}
                        <View style={withdrawStyles.inputContainer}>
                            <Text style={withdrawStyles.inputLabel}>Số tài khoản</Text>
                            <TextInput
                                style={withdrawStyles.textInput}
                                value={bankAccount}
                                onChangeText={setBankAccount}
                                placeholder="Nhập số tài khoản ngân hàng"
                                placeholderTextColor="#999"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={withdrawStyles.inputContainer}>
                            <Text style={withdrawStyles.inputLabel}>Chủ tài khoản</Text>
                            <TextInput
                                style={withdrawStyles.textInput}
                                value={accountHolder}
                                onChangeText={setAccountHolder}
                                placeholder="Nhập tên chủ tài khoản"
                                placeholderTextColor="#999"
                                autoCapitalize="words"
                            />
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={withdrawStyles.bottomContainer}>
                <TouchableOpacity
                    style={[
                        withdrawStyles.withdrawButton,
                        (!amount || loading) && withdrawStyles.withdrawButtonDisabled
                    ]}
                    onPress={handleWithdraw}
                    disabled={!amount || loading}
                >
                    <Text style={withdrawStyles.withdrawButtonText}>
                        {loading ? 'Đang xử lý...' : 'Thanh toán'}
                    </Text>
                </TouchableOpacity>

                <Text style={withdrawStyles.noteText}>
                    * Giao dịch sẽ được xử lý trong vòng 1-3 phút làm việc
                </Text>
            </View>
            {showPinVerify && (
                <PinLoginPopup
                    visible={showPinVerify}
                    mode="verify"
                    onSuccess={handlePinVerifySuccess}
                    onCancel={() => setShowPinVerify(false)}
                />
            )}
            {showCompletedPopup && (
                <CompletedPopup visible={showCompletedPopup} onClose={() => {
                    onHandleCompletedPopup();
                    const bank = bankList?.find(bank => bank.id.toString() === bankName.toString());
                    navigation.navigate('SuccessPayment', {
                        amount: amount,
                        currency: 'VNĐ',
                        bankName: bank?.short_name ?? '',
                        bankAccount: bankAccount,
                    });
                }} />
            )}
        </KeyboardAvoidingView>
    );
}

const withdrawStyles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    balanceCard: {
        margin: 16,
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#667eea',
        alignItems: 'center',
    },
    balanceTitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 8,
    },
    balanceAmount: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    balanceEquivalent: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FF9800',
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f8f9fa',
    },
    amountInput: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        paddingVertical: 16,
        textAlign: 'center',
    },
    currencyLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginLeft: 8,
    },
    methodCard: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    methodCardSelected: {
        borderColor: '#FF9800',
        backgroundColor: '#f8f9fa',
    },
    methodCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    methodIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    methodInfo: {
        flex: 1,
    },
    methodName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    methodDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    methodFee: {
        fontSize: 12,
        color: '#FF9800',
        fontWeight: '500',
    },
    methodRadio: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bankSelectorContainer: {
        marginBottom: 16,
    },
    bankScrollView: {
        marginTop: 8,
    },
    bankButton: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginRight: 8,
    },
    bankButtonSelected: {
        backgroundColor: '#FF9800',
        borderColor: '#FF9800',
    },
    bankButtonText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    bankButtonTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
    },
    warningContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF3E0',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
        marginTop: 8,
    },
    warningText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 12,
        color: '#E65100',
        lineHeight: 16,
    },
    summarySection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    summaryTotal: {
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        marginTop: 8,
        paddingTop: 16,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    summaryTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF9800',
    },
    bottomContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    withdrawButton: {
        backgroundColor: '#667eea',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 8,
    },
    withdrawButtonDisabled: {
        backgroundColor: '#ccc',
    },
    withdrawButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    noteText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    walletContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
    },
    walletItem: {
        width: 110,
        height: 110,
        backgroundColor: '#fff',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    walletImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    walletScrollView: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 16,
    },
    walletText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginTop: 10,
        textAlign: 'center',
    },
    walletTextSmall: {
        fontSize: 12,
        fontWeight: '400',
        color: '#999',
        marginTop: 5,
        textAlign: 'center',
    },
    walletItemSelected: {
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    feeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    feeText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '400',
    },
    feeValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
    },
});

export default WithdrawWalletScreen;
