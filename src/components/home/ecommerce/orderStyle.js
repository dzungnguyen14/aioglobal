import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#28a745',
        borderBottomWidth: 0,
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },

    // Tabs
    tabContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 8,
        marginRight: 16,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#28a745',
    },
    tabText: {
        fontSize: 14,
        color: '#6c757d',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#28a745',
        fontWeight: '600',
    },

    // Orders List
    ordersList: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 13,
        color: '#6c757d',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginLeft: 12,
    },
    statusText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },

    // Order Items
    orderItems: {
        marginBottom: 12,
    },
    orderItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderItemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    orderItemInfo: {
        flex: 1,
    },
    orderItemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#212529',
        marginBottom: 4,
    },
    orderItemDetails: {
        fontSize: 12,
        color: '#6c757d',
    },
    moreItems: {
        fontSize: 12,
        color: '#6c757d',
        fontStyle: 'italic',
        marginTop: 4,
    },

    // Order Footer
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    orderTotal: {
        flex: 1,
    },
    totalLabel: {
        fontSize: 13,
        color: '#6c757d',
        marginBottom: 2,
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#28a745',
    },
    orderActions: {
        flexDirection: 'row',
        gap: 8,
    },
    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dc3545',
    },
    cancelButtonText: {
        fontSize: 13,
        color: '#dc3545',
        fontWeight: '500',
    },
    reorderButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#28a745',
    },
    reorderButtonText: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '500',
    },

    // Empty State
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#495057',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateDesc: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
        lineHeight: 20,
    },

    // Detail Modal
    detailModal: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    detailContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: screenWidth - 32,
        maxHeight: screenHeight - 100,
        overflow: 'hidden',
    },
    detailHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212529',
    },
    detailContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    detailSection: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    detailSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 12,
    },

    // Info Rows
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6c757d',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: '#212529',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
    addressText: {
        fontSize: 14,
        color: '#495057',
        lineHeight: 20,
    },

    // Detail Items
    detailItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    detailItemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    detailItemInfo: {
        flex: 1,
    },
    detailItemName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#212529',
        marginBottom: 4,
    },
    detailItemBrand: {
        fontSize: 13,
        color: '#6c757d',
        marginBottom: 8,
    },
    detailItemPricing: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    detailItemPrice: {
        fontSize: 14,
        color: '#495057',
        flex: 1,
    },
    detailItemQuantity: {
        fontSize: 14,
        color: '#6c757d',
        marginHorizontal: 12,
    },
    detailItemTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#28a745',
    },

    // Summary
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6c757d',
    },
    summaryValue: {
        fontSize: 14,
        color: '#495057',
        fontWeight: '500',
    },
    totalRow: {
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        marginTop: 8,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
    summaryTotalValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#28a745',
    },

    // Detail Actions
    detailActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        gap: 12,
    },

    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    cardHistoryImage: {
        width: Dimensions.get('window').width - 40,
        height: (Dimensions.get('window').width - 40) * 0.6,
        borderRadius: 10,
        marginBottom: 10,
        resizeMode: 'cover',
    },
    cardHistoryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 10,
    },
    cardHistoryLabel: {
        fontSize: 14,
        fontWeight: '400',
        color: '#6c757d',
    },
    cardHistoryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
    },
});

export default styles;
