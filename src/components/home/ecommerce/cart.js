import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import styles from './cartStyle';
import { fetchPaymentConfigs, fetchCalculateFare, createEcommerceOrder } from '../../../fetcher/ecommerce';
import { memo } from 'react';
import { Link } from '@react-navigation/native';
import { Image } from 'expo-image';

const CartPage = ({ cart, onUpdateCart, onClose, profile }) => {
    const [userInfo, setUserInfo] = useState({
        hoten: profile?.fullname || '',
        dienthoai: profile?.phone || '',
        email: profile?.email || '',
        diachi: '',
        ghichu: '',
        card: '',
    });
    const [paymentConfigs, setPaymentConfigs] = useState([]);
    const [shippingConfigs, setShippingConfigs] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [shippingMethod, setShippingMethod] = useState('');
    const [totalFare, setTotalFare] = useState(0);
    const [originalFare, setOriginalFare] = useState(0);
    const [discounts, setDiscounts] = useState([]);
    const [userCards, setUserCards] = useState([]);
    const [waitingConfirm, setWaitingConfirm] = useState(false);
    const [transactionVietqr, setTransactionVietqr] = useState(null);

    const loadPaymentConfig = async () => {
        const response = await fetchPaymentConfigs(profile.token);
        setPaymentConfigs(response.payments || []);
        setShippingConfigs(response.shipping || []);
        setUserCards(response.cards || []);
    }

    const calculateFare = async () => {
        const payload = {
            ...userInfo,
            httt: paymentMethod,
            donvivanchuyen: shippingMethod,
            thanhpho: '',
            carts: cart.map(item => {
                return {
                    product_id: item.id,
                    giaban: item.giaban,
                    qty: item.quantity,
                    color: '',
                    size: '',
                    label: item.promoTag
                }
            })
        }
        const { total_fare, original_fare, discounts } = await fetchCalculateFare(payload, profile.token);
        setTotalFare(total_fare || 0);
        setOriginalFare(original_fare || 0);
        setDiscounts(discounts || []);
    }

    useEffect(() => {
        loadPaymentConfig();
    }, []);


    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        const updatedCart = cart.map(item =>
            item.id === productId ? { ...item, quantity } : item
        );
        onUpdateCart(updatedCart);
    };

    const removeFromCart = (productId) => {
        const updatedCart = cart.filter(item => item.id !== productId);
        onUpdateCart(updatedCart);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.giaban * item.quantity), 0);
    };

    useEffect(() => {
        calculateFare();
    }, [paymentMethod, shippingMethod, userInfo.card, getTotalPrice()]);



    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const onSubmit = async () => {
        const payload = {
            ...userInfo,
            httt: paymentMethod,
            donvivanchuyen: shippingMethod,
            thanhpho: '',
            carts: cart.map(item => {
                return {
                    product_id: item.id,
                    giaban: item.giaban,
                    qty: item.quantity,
                    color: '',
                    size: '',
                    label: item.promoTag
                }
            })
        }
        const {vieqr_link, madonhang, result, msg } = await createEcommerceOrder(payload, profile.token);
        console.log(vieqr_link, madonhang, result, msg);

        if (vieqr_link) {
            Linking.openURL(vieqr_link);
            setTransactionVietqr(transaction);
            setWaitingConfirm(true);
        } else {
            if (result) {
                Alert.alert('Thành công', 'Đặt hàng thành công! Cảm ơn bạn đã mua hàng.');
                onUpdateCart([]);
                onClose();
            } else {
                Alert.alert('Thông báo', msg || 'Đặt hàng thất bại, vui lòng thử lại sau.');
                return;
            }

        }
    }
    const handleCheckout = () => {
        if (!userInfo.hoten || !userInfo.dienthoai || !userInfo.diachi) {
            Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin giao hàng');
            return;
        }

        if (!paymentMethod) {
            Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán');
            return;
        }

        console.log(shippingMethod)
        if (!shippingMethod) {
            Alert.alert('Thông báo', 'Vui lòng chọn phương thức vận chuyển');
            return;
        }

        Alert.alert(
            'Xác nhận đặt hàng',
            `Tổng tiền: ${formatPrice(totalFare)}\nPhương thức: ${getPaymentMethodText()}`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đặt hàng',
                    onPress: () => {
                        onSubmit();

                    }
                }
            ]
        );
    };

    const getPaymentMethodText = () => {
        return paymentConfigs.find(payment => payment.tenkhongdau === paymentMethod)?.ten_vi || '';
    };

    const renderCartItems = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sản phẩm đã chọn ({cart.length})</Text>
            {cart.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                    {item.photo && (
                        <Image source={{ uri: "https://ktsmall.com.vn/upload/product/" + item.photo }} style={styles.cartItemImage} />
                    )}
                    <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName} numberOfLines={2}>{item.ten_vi}</Text>
                        <Text style={[styles.cartItemName, { color: '#ff4444' }]}>{item.promo_tag.toUpperCase()}</Text>
                        <View style={styles.priceQuantityRow}>
                            <Text style={styles.cartItemPrice}>{formatPrice(item.giaban)}</Text>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                    <Ionicons name="remove" size={16} color="#333" />
                                </TouchableOpacity>
                                <Text style={styles.quantity}>{item.quantity}</Text>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                    <Ionicons name="add" size={16} color="#333" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.itemTotal}>
                            Tổng: {formatPrice(totalFare)}
                        </Text>
                        <View style={{ justifyContent: 'flex-end', flex: 1, alignItems: 'flex-end' }}>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeFromCart(item.id)}
                            >
                                <Ionicons name="trash-outline" size={20} color="#ff4444" />
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            ))}
        </View>
    );

    const renderOrderSummary = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tạm tính:</Text>
                    <Text style={styles.summaryValue}>{formatPrice(getTotalPrice())}</Text>
                </View>
                {discounts.map((discount, idx) => (
                    <View key={'discount' + idx} style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>{discount.label}:</Text>
                        <Text style={styles.summaryValue}>-{formatPrice(discount.amount)}</Text>
                    </View>
                ))}
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalValue}>{formatPrice(totalFare)}</Text>
                </View>
            </View>
        </View>
    );

    const renderDeliveryInfo = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Họ và tên *</Text>
                <TextInput
                    style={styles.textInput}
                    value={userInfo.hoten}
                    onChangeText={(text) => setUserInfo({ ...userInfo, hoten: text })}
                    placeholder="Nhập họ và tên"
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Số điện thoại *</Text>
                <TextInput
                    style={styles.textInput}
                    value={userInfo.dienthoai}
                    onChangeText={(text) => setUserInfo({ ...userInfo, dienthoai: text })}
                    placeholder="Nhập số điện thoại"
                    keyboardType="phone-pad"
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                    style={styles.textInput}
                    value={userInfo.email}
                    onChangeText={(text) => setUserInfo({ ...userInfo, email: text })}
                    placeholder="Nhập email"
                    keyboardType="email-address"
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Địa chỉ giao hàng *</Text>
                <TextInput
                    style={[styles.textInput, styles.addressInput]}
                    value={userInfo.diachi}
                    onChangeText={(text) => setUserInfo({ ...userInfo, diachi: text })}
                    placeholder="Nhập địa chỉ chi tiết"
                    multiline
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Ghi chú</Text>
                <TextInput
                    style={[styles.textInput, styles.noteInput]}
                    value={userInfo.ghichu}
                    onChangeText={(text) => setUserInfo({ ...userInfo, ghichu: text })}
                    placeholder="Ghi chú thêm cho đơn hàng..."
                    multiline
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Thẻ thành viên</Text>
                <TextInput
                    style={[styles.textInput, styles.noteInput]}
                    value={userInfo.card}
                    onChangeText={(text) => setUserInfo({ ...userInfo, card: text })}
                    placeholder="Nhập số thẻ thành viên..."
                    multiline
                />
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 10 }}>
                    {userCards.map((card, index) => (
                        <TouchableOpacity style={{ backgroundColor: '#f0f0f0', color: '#fff', borderRadius: 10, padding: 10, paddingBottom: 0 }} key={index} onPress={() => setUserInfo({ ...userInfo, card })}>
                            <Text style={styles.inputLabel}>{card}</Text>
                        </TouchableOpacity>
                    ))}

                </View>
            </View>
        </View>
    );

    const renderPaymentMethod = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            {paymentConfigs.map((payment) => (
                <TouchableOpacity
                    key={payment.id}
                    style={[styles.paymentOption, paymentMethod === payment.tenkhongdau && styles.selectedPayment]}
                    onPress={() => setPaymentMethod(payment.tenkhongdau)}
                >
                    <Ionicons name="cash-outline" size={24} color="#333" />
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentTitle}>{payment.ten_vi}</Text>
                    </View>
                    <Ionicons
                        name={paymentMethod === payment.tenkhongdau ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color="#007AFF"
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
    const renderShippingSelect = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn đơn vị vận chuyển</Text>
            {shippingConfigs.map((shipping) => (
                <TouchableOpacity
                    key={shipping.id}
                    style={[styles.paymentOption, shippingMethod === shipping.tenkhongdau && styles.selectedPayment]}
                    onPress={() => setShippingMethod(shipping.tenkhongdau)}
                >
                    <Ionicons name="storefront-outline" size={24} color="#333" />
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentTitle}>{shipping.ten_vi}</Text>
                    </View>
                    <Ionicons
                        name={shippingMethod === shipping.tenkhongdau ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color="#007AFF"
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    if (cart.length === 0) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Giỏ hàng</Text>
                </View>
                    <View style={styles.emptyCart}>
                        <Ionicons name="bag-outline" size={80} color="#ccc" />
                        <Text style={styles.emptyCartTitle}>Giỏ hàng trống</Text>
                        <Text style={styles.emptyCartDesc}>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</Text>
                        <TouchableOpacity style={styles.continueShoppingButton} onPress={onClose}>
                            <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Giỏ hàng ({cart.length})</Text>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {renderCartItems()}
                    {renderOrderSummary()}
                    {renderDeliveryInfo()}
                    {renderPaymentMethod()}
                    {renderShippingSelect()}
                </ScrollView>

                <View style={styles.footer}>
                    <View style={styles.totalContainer}>
                        <Text style={styles.finalTotalLabel}>Tổng thanh toán:</Text>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Text style={styles.finalTotalPrice}>{formatPrice(totalFare)}</Text>
                            <Text style={[styles.finalTotalPrice, { color: '#999', fontSize: 16, marginLeft: 5, textDecorationLine: 'line-through', textDecorationStyle: 'solid' }]}>{formatPrice(originalFare)}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                        <Text style={styles.checkoutButtonText}>Đặt hàng ngay</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default memo(CartPage);
