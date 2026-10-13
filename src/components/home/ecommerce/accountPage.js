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

const TAB_HISTORY = 'history';
const TAB_TRANSACTION = 'transaction';
const TAB_SALES = 'sales';
const TAB_PARTNER = 'partner';
const TAB_CARD = 'card';
const TAB_COMBO = 'combo';

const TABS = [
    { key: TAB_SALES, label: 'Doanh số' },
    { key: TAB_HISTORY, label: 'Lịch sử mua hàng' },
    { key: TAB_CARD, label: 'Thẻ thành viên' },
    { key: TAB_COMBO, label: 'Combo - Kinh doanh' },
    { key: TAB_TRANSACTION, label: 'Giao dịch' },
    // { key: TAB_PARTNER, label: 'Cộng tác viên - Tích điểm' }
];

const AccountPage = ({ onClose, profile }) => {
    const [orders, setOrders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [tab, setTab] = useState(TAB_SALES);
    const [sales, setSales] = useState({});
    const [transactions, setTransactions] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [card, setCard] = useState({});
    const [accountInfo, setAccountInfo] = useState({});

    const loadHistory = async () => {
        const response = await fetchEcommerceHistory({}, profile.token);
        if (response.history && response.history.length > 0) {
            setOrders(response.history ?? []);
            setSales(response.sales ?? {});
            setVouchers(response.vouchers ?? []);
            setCard(response.card ?? {});
            setTransactions(response.transactions ?? []);
            setAccountInfo({
                manager_level: response.manager_level ?? '',
                ref_level: response.ref_level ?? '',
            })
            console.log(response.sales);
        }
    };

    useEffect(() => {
        loadHistory();
    }, [])

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
            </View>

            <View style={styles.orderItems}>
                {order.details.map((item, index) => (
                    <View key={index} style={styles.orderItemRow}>
                        {item.photo && (
                            <Image source={{ uri: 'https://ktsmall.com.vn/upload/product/' + item.photo }} style={styles.orderItemImage} />
                        )}
                        <View style={styles.orderItemInfo}>
                            <Text style={styles.orderItemName} numberOfLines={1}>{item.ten}</Text>
                            <Text style={styles.orderItemDetails}>
                                {item.promo_tag.toUpperCase()} • SL: {item.soluong} • {formatPrice(item.gia)}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.orderFooter}>
                <View style={[styles.orderTotal, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        <Text style={styles.totalLabel}>Tổng cộng:</Text>
                        <Text style={styles.totalAmount}>{formatPrice(order.tonggia)}</Text>
                    </View>
                    <Text style={[styles.totalAmount, { color: order.thanhtoan == '1' ? '#28a745' : '#dc3545', fontSize: 14, fontWeight: '500' }]}>{order.thanhtoan == '1' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderVoucherItem = ({ item }) => (
        <TouchableOpacity
            style={styles.orderCard}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>Mã đơn #{item.ma_don}</Text>
                    <Text style={styles.orderDate}>{item.created_date}</Text>
                </View>
            </View>

            <View style={styles.orderFooter}>
                <View style={[styles.orderTotal, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        <Text style={styles.totalLabel}>Tổng cộng:</Text>
                        <Text style={styles.totalAmount}>{formatPrice(item.total)}</Text>
                    </View>
                    <Text style={[styles.totalAmount, { color: item.status == '1' ? '#28a745' : '#dc3545', fontSize: 14, fontWeight: '500' }]}>{item.status == '1' ? 'Thành công' : 'Thất bại'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderTransactionItem = ({ item }) => (
        <TouchableOpacity
            style={styles.orderCard}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>{item.note}</Text>
                    <Text style={styles.orderDate}>{item.create_time}</Text>
                </View>
            </View>

            <View style={styles.orderFooter}>
                <View style={[styles.orderTotal, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                    <View style={{ flex: 1, flexDirection: 'column' }}>
                        <Text style={styles.totalLabel}>Tổng cộng:</Text>
                        <Text style={styles.totalAmount}>{formatPrice(item.total)}</Text>
                    </View>
                    <Text style={[styles.totalAmount, { color: item.status == '2' ? '#28a745' : '#dc3545', fontSize: 14, fontWeight: '500' }]}>{item.status == '2' ? 'Thành công' : 'Thất bại'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderSalesItem = () => (
        <View style={{ flex: 1, flexDirection: 'column', padding: 20, gap: 10, backgroundColor: '#fff' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.cardHistoryLabel}>Cấp phân phối</Text>
                <Text style={styles.cardHistoryValue}>{accountInfo.ref_level}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.cardHistoryLabel}>Cấp bậc quản lý</Text>
                <Text style={styles.cardHistoryValue}>{accountInfo.manager_level}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e9ecef', paddingBottom: 20 }}>
                <Text style={styles.cardHistoryLabel}>Ví tiền mặt:</Text>
                <Text style={styles.cardHistoryValue}>{sales.user_wallet_amount ?? '0 đ'}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.cardHistoryLabel}>Doanh số combo</Text>
                <Text style={styles.cardHistoryValue}>{sales.combo ?? '0 đ'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.cardHistoryLabel}>Doanh số bán lẻ: </Text>
                <Text style={styles.cardHistoryValue}>{sales.total_buy ?? '0 đ'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e9ecef', paddingBottom: 20 }}>
                <Text style={styles.cardHistoryLabel}>Doanh số nhập hàng:</Text>
                <Text style={styles.cardHistoryValue}>{sales.line_buy ?? '0 đ'}</Text>
            </View>
            <Text style={[styles.cardHistoryLabel, { fontSize: 16 , fontWeight: '700'}]}>Danh sách giới thiệu:</Text>

            <ScrollView style={{ flexDirection: 'column', }}>
                <FlatList
                    data={sales.referrals ?? []}
                    keyExtractor={(item) => item.email}
                    renderItem={
                        ({ item }) => (
                            <View style={[styles.orderCard, {gap: 10}]} key={item.email}>
                                <Text style={[styles.totalLabel, { fontSize: 14 }]}>{item.email} - {item.dienthoai}</Text>
                                <Text style={[styles.summaryTotalValue, { textAlign: 'right' }]}>{formatPrice(item.total_cart + item.total_voucher_sum)}</Text>
                            </View>
                        )
                    }
                />
            </ScrollView>
           
        </View>
    );



    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Tài khoản</Text>
                </View>
                <View style={{ height: 50 }}>
                    {renderTabs()}
                </View>
                {tab === TAB_HISTORY &&
                    <FlatList
                        data={orders}
                        keyExtractor={(item) => item.id}
                        renderItem={renderOrderItem}
                        style={styles.ordersList}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        showsVerticalScrollIndicator={false}
                    />
                }
                {tab == TAB_CARD && (
                    <View style={{ flex: 1, flexDirection: 'column', padding: 20, }}>
                        {card.image && (
                            <Image source={{ uri: card.image }} style={styles.cardHistoryImage} />
                        )}
                        <Text style={styles.cardHistoryTitle}>Thẻ thành viên: {card.membership ?? 'Không có thông tin'}</Text>
                        <Text style={styles.cardHistoryTitle}>Ngày hết hạn: {card.expired ?? 'Không có thông tin'}</Text>
                    </View>
                )}
                {tab == TAB_SALES && renderSalesItem()}
                {tab == TAB_COMBO && (
                    <FlatList
                        data={vouchers}
                        keyExtractor={(item) => item.id}
                        renderItem={renderVoucherItem}
                        style={styles.ordersList}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        showsVerticalScrollIndicator={false}
                    />
                )}
                {tab == TAB_TRANSACTION && (
                    <FlatList
                        data={transactions}
                        keyExtractor={(item) => item.id}
                        renderItem={renderTransactionItem}
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

export default memo(AccountPage);
