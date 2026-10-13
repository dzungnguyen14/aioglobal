import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: Platform.OS === 'ios' ? 10 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#28a745',
        borderBottomWidth: 0,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    shareButton: {
        padding: 4,
    },
    content: {
        flex: 1,
    },

    // Image Gallery
    imageGallery: {
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    imageContainer: {
        width: screenWidth,
        height: screenWidth,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bestSellerBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: '#28a745',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 2,
    },
    bestSellerText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    discountBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(255, 212, 36, 0.95)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 2,
    },
    discountText: {
        color: '#28a745',
        fontSize: 11,
        fontWeight: '700',
    },
    imageIndicators: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#dee2e6',
        marginHorizontal: 4,
    },
    activeIndicator: {
        backgroundColor: '#28a745',
    },

    // Product Info
    productInfo: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
    },
    productName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 4,
    },
    brandName: {
        fontSize: 16,
        color: '#6c757d',
        marginBottom: 12,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    stars: {
        flexDirection: 'row',
        marginRight: 8,
    },
    ratingText: {
        fontSize: 14,
        color: '#6c757d',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    price: {
        fontSize: 24,
        fontWeight: '700',
        color: '#28a745',
        marginRight: 12,
    },
    originalPrice: {
        fontSize: 16,
        color: '#6c757d',
        textDecorationLine: 'line-through',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    quantityLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#212529',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 8,
    },
    quantityButton: {
        padding: 12,
        borderRadius: 8,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        paddingHorizontal: 20,
    },

    // Store Info
    storeInfoContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    storeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    storeLogoContainer: {
        position: 'relative',
        marginRight: 12,
    },
    storeLogo: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e9ecef',
    },
    favoriteLabel: {
        position: 'absolute',
        bottom: -8,
        left: 0,
        right: 0,
        backgroundColor: '#dc3545',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 10,
        alignItems: 'center',
    },
    favoriteLabelText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    storeDetails: {
        flex: 1,
    },
    storeName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 4,
    },
    storeStatus: {
        fontSize: 14,
        color: '#6c757d',
    },
    storeActions: {
        flexDirection: 'row',
        gap: 12,
    },
    chatButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#28a745',
        borderRadius: 6,
        paddingVertical: 10,
        gap: 6,
    },
    chatButtonText: {
        color: '#28a745',
        fontSize: 15,
        fontWeight: '600',
    },
    viewShopButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 6,
        paddingVertical: 10,
        gap: 6,
    },
    viewShopButtonText: {
        color: '#6c757d',
        fontSize: 15,
        fontWeight: '600',
    },

    // Tabs
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#28a745',
    },
    tabText: {
        fontSize: 16,
        color: '#6c757d',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#28a745',
        fontWeight: '600',
    },

    // Tab Content
    tabContent: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
    },

    // Description
    descriptionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#495057',
    },
    descriptionBold: {
        fontWeight: '600',
        color: '#212529',
    },

    // Specs
    specsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 16,
    },
    specRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    specLabel: {
        fontSize: 15,
        color: '#6c757d',
        flex: 1,
        fontWeight: '500',
    },
    specValue: {
        fontSize: 15,
        color: '#212529',
        flex: 2,
    },

    // Reviews
    reviewsHeader: {
        marginBottom: 20,
    },
    reviewsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 12,
    },
    overallRating: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    overallRatingText: {
        fontSize: 14,
        color: '#6c757d',
        marginLeft: 8,
    },
    reviewItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    reviewUser: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userInitial: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    userName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#212529',
        marginBottom: 2,
    },
    reviewDate: {
        fontSize: 13,
        color: '#6c757d',
    },
    reviewStars: {
        flexDirection: 'row',
    },
    reviewComment: {
        fontSize: 15,
        lineHeight: 22,
        color: '#495057',
        marginBottom: 12,
    },
    reviewImages: {
        flexDirection: 'row',
        gap: 8,
    },
    reviewImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },

    // Bottom Actions
    bottomActions: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        gap: 12,
    },
    addToCartButton: {
        flex: 2,
        backgroundColor: '#fff',
        borderRadius: 4,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#28a745',
    },
    addToCartText: {
        color: '#28a745',
        fontSize: 16,
        fontWeight: '600',
    },
    buyNowButton: {
        flex: 1,
        backgroundColor: '#28a745',
        borderRadius: 4,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyNowText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    // Image Modal
    imageModal: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
    },
    imageModalClose: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1000,
        padding: 8,
    },
    fullImageContainer: {
        width: screenWidth,
        height: screenHeight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: screenWidth - 40,
        height: screenWidth - 40,
        resizeMode: 'contain',
    },
});

export default styles;
