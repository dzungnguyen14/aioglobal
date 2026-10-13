import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import styles from './orderStyle';
import { memo } from 'react';
import { fetchEcommerceHistory } from '../../../fetcher/ecommerce';
import { Image } from 'expo-image';

const TAB_ALL = 'all';
const TAB_PENDING = 'pending';
const TAB_PROCESSING = 'processing';
const TAB_SHIPPING = 'shipping';
const TAB_COMPLETED = 'completed';
const TAB_CANCELLED = 'cancelled';

const TABS = [
    { key: TAB_ALL, label: 'Tất cả' },
    { key: TAB_PENDING, label: 'Chờ xác nhận' },
    { key: TAB_PROCESSING, label: 'Đang xử lý' },
    { key: TAB_SHIPPING, label: 'Đang giao' },
    { key: TAB_COMPLETED, label: 'Hoàn thành' },
    { key: TAB_CANCELLED, label: 'Đã hủy' }
];

const OrdersPage = ({ onClose, profile }) => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(TAB_ALL);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const response = await fetchEcommerceHistory({}, profile.token);
            if (response.history && response.history.length > 0) {
                setOrders(response.history ?? []);
                filterOrders(response.history, tab);
            } else {
                setOrders([]);
                setFilteredOrders([]);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            setOrders([]);
            setFilteredOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = (orderList, selectedTab) => {
        if (selectedTab === TAB_ALL) {
            setFilteredOrders(orderList);
            return;
        }

        // Filter based on payment status and other criteria
        const filtered = orderList.filter(order => {
            if (selectedTab === TAB_COMPLETED) {
                return order.thanhtoan === '1';
            } else if (selectedTab === TAB_PENDING) {
                return order.thanhtoan === '0';
            }
            // Add more filtering logic as needed
            return true;
        });

        setFilteredOrders(filtered);
    };

    useEffect(() => {
        loadHistory();
    }, []);

    useEffect(() => {
        filterOrders(orders, tab);
    }, [tab, orders]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    };

    const getStatusColor = (order) => {
        if (order.thanhtoan === '1') {
            return '#28a745';
        }
        return '#dc3545';
    };

    const getStatusText = (order) => {
        if (order.thanhtoan === '1') {
            return 'Đã thanh toán';
        }
        return 'Chưa thanh toán';
    };

    const renderTabs = () => (
        <ScrollView horizontal style={styles.tabContainer} showsHorizontalScrollIndicator={false}>
            {TABS.map((item) => (
                <TouchableOpacity
                    key={item.key}
                    style={[styles.tab, tab === item.key && styles.activeTab]}
                    onPress={() => setTab(item.key)}
                >
                    <Text style={[styles.tabText, tab === item.key && styles.activeTabText]}>
                        {item.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderOrderItem = ({ item: order }) => (
        <TouchableOpacity
            style={styles.orderCard}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>Đơn hàng #{order.madonhang}</Text>
                    <Text style={styles.orderDate}>{order.ngaytao}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order) }]}>
                    <Text style={styles.statusText}>{getStatusText(order)}</Text>
                </View>
            </View>

            <View style={styles.orderItems}>
                {order.details.map((item, index) => (
                    <View key={index} style={styles.orderItemRow}>
                        {item.photo && (
                            <Image 
                                source={{ uri: 'https://ktsmall.com.vn/upload/product/' + item.photo }} 
                                style={styles.orderItemImage} 
                            />
                        )}
                        <View style={styles.orderItemInfo}>
                            <Text style={styles.orderItemName} numberOfLines={1}>{item.ten}</Text>
                            <Text style={styles.orderItemDetails}>
                                {item.promo_tag && item.promo_tag.toUpperCase()} • SL: {item.soluong} • {formatPrice(item.gia)}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.orderFooter}>
                <View style={styles.orderTotal}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalAmount}>{formatPrice(order.tonggia)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={80} color="#ccc" />
            <Text style={styles.emptyStateTitle}>Không có đơn hàng</Text>
            <Text style={styles.emptyStateDesc}>
                {tab === TAB_ALL 
                    ? 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!' 
                    : 'Không có đơn hàng trong danh mục này'}
            </Text>
        </View>
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Đơn hàng</Text>
                </View>
                
                <View style={{ height: 50 }}>
                    {renderTabs()}
                </View>

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#28a745" />
                    </View>
                ) : filteredOrders.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <FlatList
                        data={filteredOrders}
                        keyExtractor={(item) => item.id}
                        renderItem={renderOrderItem}
                        style={styles.ordersList}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default memo(OrdersPage);
