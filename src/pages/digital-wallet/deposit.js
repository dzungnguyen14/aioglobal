import React, { useState, useRef, useEffect, useMemo } from "react";
import { Image } from "expo-image";
import { 
    Text, 
    View, 
    KeyboardAvoidingView, 
    Platform, 
    ScrollView, 
    TouchableOpacity, 
    StyleSheet, 
    Alert,
    Dimensions,
    ActivityIndicator
} from "react-native";
import styles from "../../styles/global";
import { useLang, useProfile } from "../../shared/hooks";
import BackButton from "../../components/home/backButton";
import { WALLET_STORAGE_TOKEN_KEY } from "../../shared/constant";
import { getItem } from "../../shared/utils";
import { getListToken, syncTransactionBSC, syncTransactionTRX } from "./fetcher";
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

function DepositWalletScreen({ navigation, route }) {
    const { lang } = useLang();
    const [wallet, setWallet] = useState([]);
    const [walletInfo, setWalletInfo] = useState(null);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCopyCode = async (code) => {
        Alert.alert("Đã sao chép dịa chỉ ví " + code);
        await Clipboard.setStringAsync(code);
    }

    const  fetchWallet = async () => {
        setIsLoading(true);
        const response = await getListToken(accessToken);
        if (response.success) {
            let userWallet = response.data.sort((a, b) => a.name.localeCompare(b.name));

            userWallet.forEach(wallet => {
                const decimals = parseInt(wallet.decimals, 10);
                const amount = parseFloat(wallet.balance, 10);
                wallet.balance = amount > 0 ? (amount / Math.pow(10, decimals)) : 0;
            });
            setWallet(userWallet);
        }
        setIsLoading(false);
    }
    const handleCheckDeposit = async () => {
        setIsLoading(true);
        await syncTransactionBSC(accessToken)
        await syncTransactionTRX(accessToken)
        fetchWallet();
        setIsLoading(false);
    }

    const onSelectWallet = (walletId) => {
        setSelectedWallet(walletId);
        setWalletInfo(wallet.find(wallet => wallet.id === walletId));
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

    useEffect(() => {
        if(accessToken) {
            fetchWallet();
        }
    }, [accessToken]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            
            {/* Header */}
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <BackButton onBack={() => navigation.goBack()} />
                    <Text style={[styles.homeName]}>
                        {lang.deposit_wallet || "Nạp tiền"}
                    </Text>
                </View>
            </View>
            {isLoading && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' , position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}>
                    <ActivityIndicator size="large" color="#667eea" />
                </View>
            )}
            <View style={depositStyles.content}>
                <ScrollView  showsVerticalScrollIndicator={false}>
                    {wallet && (
                        <View style={depositStyles.walletContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={depositStyles.walletScrollView}>
                                {wallet.map((wallet) => (
                                    <TouchableOpacity onPress={() => onSelectWallet(wallet.id)} key={wallet.id} style={[depositStyles.walletItem, selectedWallet === wallet.id && depositStyles.walletItemSelected]}>
                                        <Image source={{ uri: 'https://admin.alowallet.net/storage/' + wallet.image }} style={depositStyles.walletImage} />
                                        <Text style={depositStyles.walletText}>{wallet.name}</Text>
                                        <Text style={depositStyles.walletTextSmall}>{wallet.chain.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </ScrollView>
            </View>
            {walletInfo && (
                <View style={{ flex: 0.3, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#d9d9d9'}}>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#000' }}>Số dư khả dụng</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <Text style={{ fontSize: 30, color: '#666', marginTop: 5, fontWeight: '700' }}>{walletInfo.balance.toLocaleString('en-US')}</Text>
                        <Text style={{ fontSize: 15, color: '#666', marginTop: 5 }}>{walletInfo.symbol}</Text>
                    </View>
                </View>
            )}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                {walletInfo && walletInfo.wallet_deposit && <Image source={{ uri: 'https://quickchart.io/qr?size=250&text=' + walletInfo.wallet_deposit }} style={{ width: 250, height: 250, borderRadius: 10 }} />}
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>Địa chỉ ví</Text>
                {walletInfo && walletInfo.wallet_deposit && (
                    <Text style={{ fontSize: 14, color: '#666', marginTop: 10 }}>{walletInfo.wallet_deposit.substring(0, 15) + '...' + walletInfo.wallet_deposit.substring(walletInfo.wallet_deposit.length - 15)}</Text>
                )}
            </View>
            <View style={depositStyles.bottomContainer}>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity style={depositStyles.depositButton} onPress={() => handleCopyCode(walletInfo.wallet_deposit)}>
                        <Text style={depositStyles.depositButtonText}>Sao chép QR code</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[depositStyles.depositButton, { backgroundColor: '#667eea' }]} onPress={() => handleCheckDeposit()}>
                        <Text style={depositStyles.depositButtonText}>Hoàn tất nạp tiền</Text>
                    </TouchableOpacity>
                </View>
                <Text style={depositStyles.noteText}>
                    *Ấn 'Hoàn tất nạp tiền' khi bạn đã nạp xong tiền vào ví. Nếu số dư vẫn chưa được cập nhật, hãy đợi 1–2 phút sau rồi ấn lại.*
                </Text>
            </View>

        </KeyboardAvoidingView>
    );
}

const depositStyles = StyleSheet.create({
    content: {
        flex: 0.5,
        backgroundColor: '#f8f9fa',
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
        borderColor: '#4CAF50',
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
    quickAmountsContainer: {
        marginTop: 16,
    },
    quickAmountsTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    quickAmountsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
    },
    quickAmountButton: {
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minWidth: (width - 80) / 3,
        alignItems: 'center',
        marginBottom: 8,
    },
    quickAmountButtonSelected: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    quickAmountText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    quickAmountTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    methodCard: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    methodCardSelected: {
        borderColor: '#4CAF50',
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
    },
    methodRadio: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
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
        color: '#4CAF50',
    },
    bottomContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        height: 150
    },
    depositButton: {
        flex:1,
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom:20,
        height: 50,

    },
    depositButtonDisabled: {
        backgroundColor: '#ccc',
    },
    depositButtonText: {
        color: '#fff',
        fontSize: 16,
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
});

export default DepositWalletScreen;
