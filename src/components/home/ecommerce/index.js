import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    FlatList,
    Alert,
    ActivityIndicator,
    Modal,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import styles from './style';
import CartPage from './cart';
import AccountPage from './accountPage';
import OrdersPage from './orders';
import ProductDetailPage from './productDetail';
import { fetchCategory, fetchCheckAuth, fetchProducts } from '../../../fetcher/ecommerce';
import { debounce } from '../../../shared/hooks';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { TabRoute } from '../../../pages/home';
import { useGlobal } from '../../../state/global';
import useConfirmDialog from '../../confirm';
import { setItem } from '../../../shared/utils';
import { reloadAppAsync } from 'expo';
/**
 * Optimized rendering by memoizing repeated components,
 * minimizing inline functions, and organizing code for optimal React updates.
 */

const mappingTitle = (title) => {
    switch (title) {
        case 'is_hot':
            return "Sản phẩm bán chạy";
        case 'is_featured':
            return "Sản phẩm nổi bật";
        case 'is_new':
            return "Sản phẩm mới";
        case 'is_sale':
            return "Sản phẩm khuyến mãi";
        default:
            return title;
    }
};

// Memoized Category Item for FlatList
const CategoryItem = memo(({ item, selectedCategory, onPress }) => (
    <TouchableOpacity
        style={[
            styles.categoryCard,
            {
                borderWidth: selectedCategory === item.id ? 2 : 0,
                borderColor: selectedCategory === item.id ? '#EE4D2D' : 'transparent',
                borderRadius: 8,
            }
        ]}
        onPress={() => onPress(item.id)}
    >
        <Image source={{ uri: "https://ktsmall.com.vn/upload/product/" + item.photo }} style={styles.categoryIcon} />
        <Text
            style={[
                styles.categoryName,
                { color: selectedCategory === item.id ? '#EE4D2D' : '#333' }
            ]}
            numberOfLines={2}
        >
            {item.ten_vi}
        </Text>
    </TouchableOpacity>
));

// Memoized Product Card item
const ProductCard = memo(({ item, onPress, calculateDiscount, formatPrice }) => {
    const discount = calculateDiscount(item.giacu, item.giaban);
    return (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => onPress(item)}
        >
            <Image source={{ uri: "https://ktsmall.com.vn/upload/product/" + item.photo }} style={styles.productImage} />
            {item.promo_tag && (
                <View style={styles.bestSellerBadge}>
                    <Text style={styles.bestSellerText}>{item.promo_tag.toUpperCase()}</Text>
                </View>
            )}
            {discount > 0 && (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{discount}% GIẢM</Text>
                </View>
            )}
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.ten_vi}</Text>
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>{formatPrice(item.giaban)}</Text>
                    {item.giacu > 0 && (
                        <Text style={styles.originalPrice}>{formatPrice(item.giacu)}</Text>
                    )}
                </View>
                {item.dat_mua > 0 && (
                    <View style={styles.ratingContainer}>
                        <Text style={styles.soldCount}>Đã bán {item.dat_mua}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
});

// Bottom Tab Bar Component
const BottomTabBar = memo(({ activeTab, onTabPress, cartCount }) => {
    const tabs = [
        { key: 'home', label: 'Trang chủ', icon: 'home-outline', activeIcon: 'home' },
        { key: 'orders', label: 'Đơn hàng', icon: 'receipt-outline', activeIcon: 'receipt' },
        { key: 'cart', label: 'Giỏ hàng', icon: 'cart-outline', activeIcon: 'cart', badge: cartCount },
        { key: 'account', label: 'Tài khoản', icon: 'person-outline', activeIcon: 'person' }
    ];

    return (
        <View style={styles.bottomTabBar}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.tabItem}
                        onPress={() => onTabPress(tab.key)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.tabIcon}>
                            <Ionicons
                                name={isActive ? tab.activeIcon : tab.icon}
                                size={24}
                                color={isActive ? '#28a745' : '#666'}
                            />
                            {tab.badge > 0 && (
                                <View style={styles.tabBadge}>
                                    <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
});

const EcommercePage = ({ onSearch }) => {
    const navigation = useNavigation();
    const { state } = useGlobal();
    const { profile } = state;

    const [searchText, setSearchText] = useState('');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showFullCart, setShowFullCart] = useState(false);
    const [showAccountPage, setShowAccountPage] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [listFeaturedProducts, setListFeaturedProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Tab navigation state
    const [activeTab, setActiveTab] = useState('home');

    // Voice AI states
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcript, setTranscript] = useState('');
    const recording = useRef(null);
    const recordingTimer = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const onConfirmDialog = useConfirmDialog();

    // Category/product fetching
    const checkAuth = async () => {
        await fetchCheckAuth(profile.token);
    };

    const loadCategory = async () => {
        const response = await fetchCategory(profile.token);
        setCategories(response.category ?? []);
    };

    const onSwitchToBrowser = (value) => {
        console.log('onSwitchToBrowser', value);
        const label = value === 1 ? "ứng dụng" : "web";

        onConfirmDialog('Chuyển đổi trang', `Bạn có chắc chắn muốn chuyển đổi sang phiên bản ${label}?`, async () => {
            await setItem('USE_IN_APP_STORE', value);
            reloadAppAsync();
        });
    }
    const loadProducts = async () => {
        setLoading(true);
        const response = await fetchProducts({ search: searchText, category: selectedCategory }, profile.token);
        let features = [];
        Object.keys(response).forEach(key => {
            if (key === 'products') {
                setProducts(response[key]);
            } else {
            }
        });
        setListFeaturedProducts(features);
        setLoading(false);
    };

    useEffect(() => {
        loadProducts();
    }, [selectedCategory, searchText]); 

    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
        Alert.alert('Thành công', `Đã thêm "${product.ten_vi}" vào giỏ hàng!`);
    };

    const updateCart = (newCart) => {
        setCart(newCart);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    useEffect(() => {
        loadCategory();
        loadProducts();
        checkAuth();
    }, []);

    const onChangeSearch = useMemo(() =>
        debounce(() => loadProducts(), 1000)
        , [searchText, selectedCategory]);

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#28a745" />
                <TextInput
                    clearButtonMode="always"
                    style={styles.searchInput}
                    placeholder="Tìm sản phẩm, thương hiệu..."
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={(text) => {
                        setSearchText(text);
                        onChangeSearch();
                    }}
                />
            </View>
            <View style={styles.headerActions}>
                {/* <TouchableOpacity
                    onPress={() => setShowAccountPage(true)}
                    style={styles.orderHistoryButton}
                >
                    <Ionicons name="person-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowFullCart(true)} style={styles.cartButton}>
                    <Ionicons name="cart-outline" size={26} color="#fff" />
                    {cart.length > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cart.length}</Text>
                        </View>
                    )}
                </TouchableOpacity> */}
                <TouchableOpacity onPress={() => onSwitchToBrowser(2)} style={styles.cartButton}>
                    <Ionicons name="swap-horizontal" size={26} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Home', { screen: TabRoute.TabHome })} style={styles.cartButton}>
                    <Ionicons name="close" size={26} color="#fff" />
                </TouchableOpacity> 
            </View>
        </View>
    );

    const handleCategoryPress = (id) => {
        setSelectedCategory(selectedCategory !== id ? id : null);
    };

    const renderCategories = () => (
        <View style={styles.section}>
            <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <CategoryItem
                        item={item}
                        selectedCategory={selectedCategory}
                        onPress={handleCategoryPress}
                    />
                )}
                initialNumToRender={8}
            />
        </View>
    );

    const calculateDiscount = (giacu, giaban) => {
        if (giacu > 0 && giacu > giaban) {
            return Math.round(((giacu - giaban) / giacu) * 100);
        }
        return 0;
    };

    // _setSelectedProduct not useCallback
    const _setSelectedProduct = (item) => setSelectedProduct(item);

    // Inline renderFeatureProducts
    const renderFeatureProducts = ({ title, data }) => (
        <View key={title + data.length} style={[styles.section, { paddingVertical: 12 }]} id={title}>
            <View style={styles.flashSaleHeader}>
                <View style={styles.flashSaleTitle}>
                    <Ionicons name="flash" size={20} color="#EE4D2D" />
                    <Text style={styles.flashSaleTitleText}>{title}</Text>
                </View>
                <TouchableOpacity style={styles.seeAllButton}>
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={data ?? []}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => 'feature-' + item.id}
                renderItem={({ item }) => (
                    <ProductCard
                        item={item}
                        onPress={_setSelectedProduct}
                        calculateDiscount={calculateDiscount}
                        formatPrice={formatPrice}
                    />
                )}
                initialNumToRender={8}
            />
        </View>
    );

    // updateQuantity not useCallback
    const updateQuantity = (id, quantity) => {
        setCart((prevCart) =>
            prevCart.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, quantity) }
                    : item
            )
        );
    };

    // removeFromCart not useCallback
    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter(item => item.id !== id));
    };

    // Inline renderCartModal
    const renderCartModal = () => {
        if (!showCart) return null;

        return (
            <View style={styles.cartModal}>
                <View style={styles.cartContainer}>
                    <View style={styles.cartHeader}>
                        <Text style={styles.cartTitle}>Giỏ hàng ({cart.length})</Text>
                        <TouchableOpacity onPress={() => setShowCart(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {cart.length === 0 ? (
                        <View style={styles.emptyCart}>
                            <Ionicons name="bag-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyCartText}>Giỏ hàng trống</Text>
                        </View>
                    ) : (
                        <>
                            <FlatList
                                data={cart}
                                keyExtractor={(item) => 'cart-' + item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={styles.cartItem}>
                                        <Image source={{ uri: item.image }} style={styles.cartItemImage} />
                                        <View style={styles.cartItemInfo}>
                                            <Text style={styles.cartItemName} numberOfLines={2}>{item.name}</Text>
                                            <Text style={styles.cartItemPrice}>{formatPrice(item.price)}</Text>
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
                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => removeFromCart(item.id)}
                                        >
                                            <Ionicons name="trash-outline" size={20} color="#ff4444" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                initialNumToRender={5}
                            />

                            <View style={styles.cartFooter}>
                                <View style={styles.totalContainer}>
                                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                                    <Text style={styles.totalPrice}>{formatPrice(getTotalPrice())}</Text>
                                </View>
                                <TouchableOpacity style={styles.checkoutButton}>
                                    <Text style={styles.checkoutButtonText}>Thanh toán</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        );
    };

    // VOICE logic
    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };
    const stopPulseAnimation = () => {
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);
    };
    const requestAudioPermission = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            return permission.status === 'granted';
        } catch (error) {
            console.error('Error requesting audio permission:', error);
            return false;
        }
    };
    const startRecording = async () => {
        try {
            const hasPermission = await requestAudioPermission();
            if (!hasPermission) {
                Alert.alert('Lỗi', 'Cần cấp quyền microphone để sử dụng tính năng này');
                return;
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            recording.current = newRecording;
            setIsRecording(true);
            setRecordingTime(0);
            startPulseAnimation();
            recordingTimer.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert('Lỗi', 'Không thể bắt đầu ghi âm');
        }
    };
    const stopRecording = async () => {
        try {
            if (!recording.current) return;
            setIsRecording(false);
            stopPulseAnimation();
            if (recordingTimer.current) {
                clearInterval(recordingTimer.current);
            }
            await recording.current.stopAndUnloadAsync();
            const uri = recording.current.getURI();
            recording.current = null;
            await processVoiceRecording(uri);
        } catch (error) {
            console.error('Failed to stop recording:', error);
            Alert.alert('Lỗi', 'Không thể dừng ghi âm');
        }
    };
    const processVoiceRecording = async (uri) => {
        setIsProcessing(true);
        try {
            setTimeout(() => {
                // Mock transcript
                const mockTranscript = "Tìm sản phẩm";
                setTranscript(mockTranscript);
                // makeDecisionFromTranscript(mockTranscript);
                setIsProcessing(false);
            }, 2000);
        } catch (error) {
            console.error('Error processing voice:', error);
            Alert.alert('Lỗi', 'Không thể xử lý giọng nói');
            setIsProcessing(false);
        }
    };
    const makeDecisionFromTranscript = (text) => {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('tìm') || lowerText.includes('search')) {
            const searchTerm = text.replace(/tìm|sản phẩm|search/gi, '').trim();
            setSearchText(searchTerm);
            setShowVoiceModal(false);
            loadProducts();
            Alert.alert('Thành công', `Đang tìm kiếm: ${searchTerm}`);
        }
        else if (lowerText.includes('giỏ hàng') || lowerText.includes('cart')) {
            setShowVoiceModal(false);
            setShowFullCart(true);
            Alert.alert('Thành công', 'Mở giỏ hàng');
        }
        else if (lowerText.includes('tài khoản') || lowerText.includes('account')) {
            setShowVoiceModal(false);
            setShowAccountPage(true);
            Alert.alert('Thành công', 'Mở tài khoản');
        }
        else {
            setSearchText(text);
            setShowVoiceModal(false);
            loadProducts();
            Alert.alert('Thành công', `Tìm kiếm: ${text}`);
        }
    };
    const handleVoicePress = () => {
        setShowVoiceModal(true);
        setTranscript('');
        setRecordingTime(0);
    };
    const closeVoiceModal = () => {
        if (isRecording) {
            stopRecording();
        }
        setShowVoiceModal(false);
        setTranscript('');
        setRecordingTime(0);
    };
    const formatRecordingTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    // Voice Modal, not changed (can memoize if you want)
    const renderVoiceModal = () => {
        return (
            <Modal
                visible={showVoiceModal}
                transparent={true}
                animationType="slide"
                onRequestClose={closeVoiceModal}
            >
                <View style={styles.voiceModalOverlay}>
                    <View style={styles.voiceModalContainer}>
                        {/* Header */}
                        <View style={styles.voiceModalHeader}>
                            <Text style={styles.voiceModalTitle}>Voice Assistant</Text>
                            <TouchableOpacity onPress={closeVoiceModal}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
                        {/* Transcript Display */}
                        {transcript && (
                            <View style={styles.voiceTranscriptContainer}>
                                <Text style={styles.voiceTranscriptText}>{transcript}</Text>
                            </View>
                        )}
                        {/* Recording Area */}
                        <View style={styles.voiceRecordingArea}>
                            {isProcessing ? (
                                <View style={styles.voiceProcessingContainer}>
                                    <ActivityIndicator size="large" color="#28a745" />
                                    <Text style={styles.voiceProcessingText}>Đang xử lý...</Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.voiceInstructionText}>
                                        {isRecording
                                            ? 'Thả ra để gửi...'
                                            : 'Nhấn giữ để nói'}
                                    </Text>
                                </>
                            )}
                        </View>



                        {/* Hold to Record Button - Telegram Style */}
                        {!isProcessing && (
                            <View style={styles.voiceActionButtonContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.voiceActionButton,
                                        isRecording && styles.voiceActionButtonRecording
                                    ]}
                                    onPressIn={startRecording}
                                    onPressOut={stopRecording}
                                    activeOpacity={0.8}
                                >
                                    <Animated.View
                                        style={[
                                            styles.voiceMicIconContainer,
                                            isRecording && {
                                                transform: [{ scale: pulseAnim }],
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name="mic"
                                            size={28}
                                            color="#fff"
                                        />
                                    </Animated.View>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Voice Commands Help - Show only when no transcript */}
                        {!transcript && !isProcessing && (
                            <View style={styles.voiceCommandsHelp}>
                                <Text style={styles.voiceCommandsTitle}>Lệnh voice bạn có thể dùng:</Text>
                                <Text style={styles.voiceCommandItem}>• "Tìm [tên sản phẩm]"</Text>
                                <Text style={styles.voiceCommandItem}>• "Mở giỏ hàng"</Text>
                                <Text style={styles.voiceCommandItem}>• "Mở tài khoản"</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        );
    };

    // FlatList renderItem for products - not useCallback
    const mainListRenderItem = ({ item }) => (
        <ProductCard
            item={item}
            onPress={_setSelectedProduct}
            calculateDiscount={calculateDiscount}
            formatPrice={formatPrice}
        />
    );

    const listHeader = useMemo(() => (
        <>
            {renderCategories()}
            {!loading && listFeaturedProducts.map(item =>
                item.data && item.data.length > 0 && item.title && renderFeatureProducts(item)
            )}
            <View style={[styles.section, { marginTop: 8 }]}>
                <Text style={styles.sectionTitle}>Gợi ý hôm nay</Text>
            </View>
        </>
    ), [categories, selectedCategory, loading, listFeaturedProducts]);

    function handleAddToCartFromDetail(productWithQuantity) {
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item.id === productWithQuantity.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === productWithQuantity.id
                        ? { ...item, quantity: item.quantity + productWithQuantity.quantity }
                        : item
                );
            } else {
                return [...prevCart, productWithQuantity];
            }
        });
    }
    function handleBuyNowFromDetail(productWithQuantity) {
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item.id === productWithQuantity.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === productWithQuantity.id
                        ? { ...item, quantity: item.quantity + productWithQuantity.quantity }
                        : item
                );
            } else {
                return [...prevCart, productWithQuantity];
            }
        });
        setSelectedProduct(null);
        setActiveTab('cart');
        setShowFullCart(true);
    }

    // Tab switching handler
    const handleTabPress = (tab) => {
        setActiveTab(tab);
        setSelectedProduct(null);

        if (tab === 'cart') {
            setShowFullCart(true);
            setShowAccountPage(false);
        } else if (tab === 'account') {
            setShowAccountPage(true);
            setShowFullCart(false);
        } else if (tab === 'home') {
            setShowFullCart(false);
            setShowAccountPage(false);
        } else if (tab === 'orders') {
            setShowFullCart(false);
            setShowAccountPage(false);
        }
    };

    // Handle close from sub-pages
    const handleCloseCart = () => {
        setShowFullCart(false);
        setActiveTab('home');
    };

    const handleCloseAccount = () => {
        setShowAccountPage(false);
        setActiveTab('home');
    };

    const handleCloseOrders = () => {
        setActiveTab('home');
    };

    return (
        <View style={{ flex: 1 }}>
            {renderVoiceModal()}
            {!selectedProduct ? (
                <>
                    {activeTab === 'home' && !showFullCart && !showAccountPage ? (
                        <>
                            {renderHeader()}
                            <FlatList
                                data={products ?? []}
                                keyExtractor={(item) => 'main-' + item.id.toString()}
                                numColumns={2}
                                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 4 }}
                                ListHeaderComponent={listHeader}
                                renderItem={mainListRenderItem}
                                ListFooterComponent={renderCartModal()}
                                showsVerticalScrollIndicator={false}
                                windowSize={9}
                                initialNumToRender={10}
                                removeClippedSubviews={true}
                                maxToRenderPerBatch={10}
                            />
                            <TouchableOpacity
                                style={styles.floatingVoiceButton}
                                onPress={handleVoicePress}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="mic" size={28} color="#fff" />
                            </TouchableOpacity>
                        </>
                    ) : activeTab === 'orders' ? (
                        <OrdersPage
                            onClose={handleCloseOrders}
                            profile={profile}
                        />
                    ) : activeTab === 'cart' || showFullCart ? (
                        <CartPage
                            cart={cart}
                            onUpdateCart={updateCart}
                            onClose={handleCloseCart}
                            profile={profile}
                        />
                    ) : activeTab === 'account' || showAccountPage ? (
                        <AccountPage
                            onClose={handleCloseAccount}
                            profile={profile}
                        />
                    ) : null}

                    {/* Bottom Tab Bar - visible when not showing product detail */}
                    <BottomTabBar
                        activeTab={activeTab}
                        onTabPress={handleTabPress}
                        cartCount={cart.length}
                    />
                </>
            ) : (
                <ProductDetailPage
                    id={selectedProduct.id}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={handleAddToCartFromDetail}
                    onBuyNow={handleBuyNowFromDetail}
                />
            )}
        </View>
    );
};

export default memo(EcommercePage);
