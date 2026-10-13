import React, { useEffect, useRef } from "react";
import { 
    Text, 
    View, 
    TouchableOpacity, 
    StyleSheet, 
    Animated,
    ScrollView,
    Platform
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useLang } from "../../shared/hooks";

function SuccessPaymentScreen({ navigation, route }) {
    const { lang } = useLang();
    const { 
        amount = 0, 
        currency = 'VNĐ',
        bankName,
        bankAccount,
    } = route?.params || {};

    // Animation values
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Success icon animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Fade in content
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            delay: 300,
            useNativeDriver: true,
        }).start();

        // Slide up content
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            delay: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    const formatAmount = (amount) => {
        return amount.toLocaleString('vi-VN').replaceAll('.', ',');
    };

    const handleDone = () => {
        navigation.navigate('DigitalWallet');
    };

    return (
        <View style={successStyles.container}>
            <ScrollView 
                contentContainerStyle={successStyles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Success Icon */}
                <Animated.View 
                    style={[
                        successStyles.iconContainer,
                        {
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    <View style={successStyles.iconCircle}>
                        <Ionicons name="checkmark" size={80} color="#fff" />
                    </View>
                    
                    {/* Animated rings */}
                    <Animated.View 
                        style={[
                            successStyles.ringOuter,
                            { opacity: fadeAnim }
                        ]} 
                    />
                    <Animated.View 
                        style={[
                            successStyles.ringMiddle,
                            { opacity: fadeAnim }
                        ]} 
                    />
                </Animated.View>

                {/* Success Message */}
                <Animated.View 
                    style={[
                        successStyles.messageContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={successStyles.successTitle}>
                        {lang.payment_success || "Thanh toán thành công!"}
                    </Text>
                    <Text style={successStyles.successSubtitle}>
                        {lang.payment_success_message || "Giao dịch của bạn đã được xử lý thành công"}
                    </Text>
                </Animated.View>

                {/* Amount Display */}
                <Animated.View 
                    style={[
                        successStyles.amountContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={successStyles.amountLabel}>
                        {lang.amount || "Số tiền"}
                    </Text>
                    <View style={successStyles.amountRow}>
                        <Text style={successStyles.amountValue}>
                            {formatAmount(amount)}
                        </Text>
                        <Text style={successStyles.currencyText}> {currency}</Text>
                    </View>
                </Animated.View>

                {/* Transaction Details */}
                <Animated.View 
                    style={[
                        successStyles.detailsContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={successStyles.detailsTitle}>
                        {lang.transaction_details || "Chi tiết giao dịch"}
                    </Text>
                    <View style={successStyles.detailRow}>
                        <View style={successStyles.detailIconContainer}>
                            <Ionicons name="person-outline" size={20} color="#667eea" />
                        </View>
                        <View style={successStyles.detailContent}>
                            <Text style={successStyles.detailLabel}>
                                Ngân hàng nhận                                </Text>
                            <Text style={successStyles.detailValue}>{bankName ?? ''}</Text>
                        </View>
                    </View>
                    <View style={successStyles.detailRow}>
                        <View style={successStyles.detailIconContainer}>
                            <Ionicons name="card-outline" size={20} color="#667eea" />
                        </View>
                        <View style={successStyles.detailContent}>
                            <Text style={successStyles.detailLabel}>
                                Số tài khoản nhận
                            </Text>
                            <Text style={successStyles.detailValue}>{bankAccount ?? ''}</Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            <View style={successStyles.bottomContainer}>
                <TouchableOpacity 
                    style={successStyles.doneButton}
                    onPress={handleDone}
                >
                    <Text style={successStyles.doneButtonText}>
                        {lang.done || "Hoàn tất"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const successStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        height: 120,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 3,
    },
    ringOuter: {
        position: 'absolute',
        width: 120,
        height:120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#4CAF50',
        opacity: 0.3,
        zIndex: 1,
    },
    ringMiddle: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#4CAF50',
        opacity: 0.5,
        zIndex: 2,
    },
    messageContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    amountContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    amountLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    amountValue: {
        fontSize: 36,
        fontWeight: '700',
        color: '#4CAF50',
    },
    currencyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#4CAF50',
        marginLeft: 4,
    },
    detailsContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    detailsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f3ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    detailContent: {
        flex: 1,
        justifyContent: 'center',
    },
    detailLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 24,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#667eea',
        gap: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    secondaryButtonText: {
        color: '#667eea',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'android' ? 40 : 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    doneButton: {
        backgroundColor: '#667eea',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    doneButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default SuccessPaymentScreen;

