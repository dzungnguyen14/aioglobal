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
import { Ionicons } from '@expo/vector-icons';
import styles from "../../styles/global";
import BackButton from "../../components/home/backButton";
import { WALLET_STORAGE_TOKEN_KEY } from "../../shared/constant";
import { formatDateTime, getItem } from "../../shared/utils";
import { getAllTransaction, } from "./fetcher";

const { width } = Dimensions.get('window');

export const TransactionItem = ({ item }) => {
    return (
        <View key={`${item.id}`} style={historyStyles.itemBlock}>
            <View style={historyStyles.leftContent}>
                <Text style={historyStyles.nameText}>{item.name}</Text>
                <Text style={historyStyles.timeText}>{formatDateTime(item.created_at)}</Text>
            </View>
            <View style={historyStyles.rightContent}>
                <View style={historyStyles.amountContainer}>
                    <Text style={historyStyles.amountText}>{item.amount.toLocaleString()}</Text>
                    <Text style={historyStyles.tokenText}>{item.token?.symbol}</Text>

                </View>
                <Text style={historyStyles.statusText}>{item.status?.label}</Text>
            </View>
        </View>
    );
}

function TransactionHistoryScreen({ navigation, route }) {
    const [accessToken, setAccessToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);

    const fetchTransactionHistory = async () => {
        setIsLoading(true);
        const response = await getAllTransaction(accessToken);
        if (response.success) {
            let transactions = response.data;
            transactions.forEach(transaction => {
                console.log(transaction);
                const decimals = parseInt(transaction.token?.decimals, 10);
                const amount = parseFloat(transaction.amount, 10);
                transaction.amount = amount > 0 ? (amount / Math.pow(10, decimals)) : 0;
            });
            setData(transactions);
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
            fetchTransactionHistory();
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
                        {"Lịch sử giao dịch"}
                    </Text>
                </View>
            </View>
            {isLoading && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}>
                    <ActivityIndicator size="large" color="#667eea" />
                </View>
            )}
            <View style={historyStyles.container}>
                <ScrollView>
                    {data.map((item, index) => (
                        <TransactionItem key={index} item={item}  />
                    ))}
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const historyStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    itemBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    leftContent: {
        flex: 1,
        gap: 10,
    },
    rightContent: {
        flex: 1,
        alignItems: 'flex-end',
    },
    nameText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600',
    },
    statusText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    tokenText: {
        color: '#999',
        fontSize: 12,
        fontWeight: 'bold',
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    amountText: {
        color: '#666',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default TransactionHistoryScreen;
