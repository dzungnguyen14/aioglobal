import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Alert,
    Dimensions,
    Modal,
    Animated,
    ActivityIndicator,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import styles from './productDetailStyle';
import { memo } from 'react';
import RenderHTML from 'react-native-render-html';
import { fetchProductDetail } from '../../../fetcher/ecommerce';
import { Image } from 'expo-image';
import { useGlobal } from '../../../state/global';

const { width: screenWidth } = Dimensions.get('window');


const ProductDetailPage = ({ id, onClose, onAddToCart, onBuyNow }) => {
    const { state } = useGlobal();
    const { profile } = state;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedTab, setSelectedTab] = useState('description'); // description, specs, reviews
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [productPhotos, setProductPhotos] = useState([]);
    const [product, setProduct] = useState({});
    const [loading, setLoading] = useState(false);
    const scrollX = useRef(new Animated.Value(0)).current;

    const loadProdductDetail = async (id) => {
        setLoading(true);
        const response = await fetchProductDetail({ id }, profile.token);
        console.log(response.photo);
        if (response.photo.length > 0) {
            setProductPhotos(response.photo.map(item => {
            return 'http://ktsmall.com.vn/upload/product/' + item.photo
        }) ?? []); 
        } else {
            setProductPhotos(['http://ktsmall.com.vn/upload/product/' + response.product.photo]);
        }
       
        setProduct(response.product ?? {});
        setLoading(false);
    }

    useEffect(() => {
        if (id) {
            console.log(id)
            loadProdductDetail(id);
        }
    }, [id]);

    const formatPrice = (price) => {
        if (!price) return '';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const calculateDiscount = () => {
        if (product.originalPrice && product.originalPrice > product.price) {
            return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        }
        return 0;
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? "star" : "star-outline"}
                    size={16}
                    color={i <= rating ? "#FFD700" : "#ddd"}
                />
            );
        }
        return stars;
    };

    const handleAddToCart = () => {
        onAddToCart({ ...product, quantity });
        Alert.alert(
            'Thành công',
            `Đã thêm ${quantity} ${product.name} vào giỏ hàng!`,
            [
                { text: 'Tiếp tục mua sắm', style: 'cancel' },
                { text: 'Xem giỏ hàng', onPress: onClose }
            ]
        );
    };

    const renderImageGallery = () => (
        <View style={styles.imageGallery}>
            <FlatList
                data={productPhotos}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                    setCurrentImageIndex(index);
                }}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={() => {
                            setSelectedImageIndex(index);
                            setShowImageModal(true);
                        }}
                    >
                        {item && (<Image source={{ uri: item }} style={styles.productImage} />)}
                        {product.isBestSeller && index === 0 && (
                            <View style={styles.bestSellerBadge}>
                                <Text style={styles.bestSellerText}>Bán chạy</Text>
                            </View>
                        )}
                        {calculateDiscount() > 0 && index === 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{calculateDiscount()}%</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            />

            <View style={styles.imageIndicators}>
                {productPhotos.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            index === currentImageIndex && styles.activeIndicator
                        ]}
                    />
                ))}
            </View>
        </View>
    );

    const renderProductInfo = () => (
        <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.ten_vi}</Text>
            <Text style={[styles.brandName, {textTransform:'uppercase', fontWeight:'500'}]}>{product.promo_tag}</Text>
            
            {/* <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                    {renderStars(product.rating)}
                </View>
                <Text style={styles.ratingText}>
                    {product.rating} ({product.reviews} đánh giá)
                </Text>
            </View> */}

            <View style={styles.priceContainer}>
                <Text style={styles.price}>{formatPrice(product.giaban)}</Text>
                {product.giacu && product.giacu > product.giaban && (
                    <Text style={styles.originalPrice}>
                        {formatPrice(product.giacu)}
                    </Text>
                )}
            </View>

            <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Số lượng:</Text>
                <View style={styles.quantityControls}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                    >
                        <Ionicons name="remove" size={20} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => setQuantity(quantity + 1)}
                    >
                        <Ionicons name="add" size={20} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderStoreInfo = () => (
        <View style={styles.storeInfoContainer}>
            <View style={styles.storeHeader}>
                <View style={styles.storeLogoContainer}>
                    <View style={styles.storeLogo}>
                        <Ionicons name="storefront" size={32} color="#28a745" />
                    </View>
                    <View style={styles.favoriteLabel}>
                        <Text style={styles.favoriteLabelText}>Yêu thích</Text>
                    </View>
                </View>
                <View style={styles.storeDetails}>
                    <Text style={styles.storeName}>KTS Mall</Text>
                    <Text style={styles.storeStatus}>Online 4 Phút Trước</Text>
                </View>
            </View>
            <View style={styles.storeActions}>
                <TouchableOpacity style={styles.chatButton}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color="#28a745" />
                    <Text style={styles.chatButtonText}>Chat Ngay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.viewShopButton}>
                    <Ionicons name="storefront-outline" size={18} color="#6c757d" />
                    <Text style={styles.viewShopButtonText}>Xem Shop</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {[
                { key: 'description', label: 'Mô tả' },
                // { key: 'specs', label: 'Thông số' },
                // { key: 'reviews', label: 'Đánh giá' }
            ].map((tab) => (
                <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
                    onPress={() => setSelectedTab(tab.key)}
                >
                    <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderDescription = () => (
        <View style={styles.tabContent}>
              <RenderHTML
                source={{ html: product.noidung_vi }}
                                                />
        </View>
    );

    const renderImageModal = () => (
        <Modal
            visible={showImageModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowImageModal(false)}
        >
            <View style={styles.imageModal}>
                <TouchableOpacity
                    style={styles.imageModalClose}
                    onPress={() => setShowImageModal(false)}
                >
                    <Ionicons name="close" size={30} color="#fff" />
                </TouchableOpacity>
                <FlatList
                    data={productPhotos}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={selectedImageIndex}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.fullImageContainer}>
                            <Image source={{ uri: item }} style={styles.fullImage} />
                        </View>
                    )}
                />
            </View>
        </Modal>
    );
    
    if(loading ) <ActivityIndicator />
    return (
        <SafeAreaProvider>
            <SafeAreaView style={[styles.container]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
                    {/* <TouchableOpacity style={styles.shareButton}>
                        <Ionicons name="share-outline" size={24} color="#333" />
                    </TouchableOpacity> */}
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {renderImageGallery()}
                    {renderProductInfo()}
                    {renderStoreInfo()}
                    {renderTabs()}
                    
                    {selectedTab === 'description' && renderDescription()}
                    {/* {selectedTab === 'specs' && renderSpecs()} */}
                    {/* {selectedTab === 'reviews' && renderReviews()} */}
                </ScrollView>

                <View style={styles.bottomActions}>
                    <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                        <Ionicons name="cart" size={20} color="#fff" />
                        <Text style={styles.addToCartText}>Thêm vào giỏ - {formatPrice(product.giaban * quantity)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buyNowButton} onPress={() => onBuyNow({ ...product, quantity })}>
                        <Text style={styles.buyNowText}>Mua ngay</Text>
                    </TouchableOpacity>
                </View>

                {renderImageModal()}
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default memo(ProductDetailPage);
