import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import styles from "../../styles/global";
import { useEffect, useState } from "react";
import { fetchHistory } from "../../fetcher/api";

function OrderHistory({ profile }) {
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const showMore = () => {
        const newPage = page + 1;
        setPage(newPage);
        fetchData(newPage);
    }

    const fetchData = async (pageNumber) => {
        if (loading && pageNumber > 1) return;
        
        setLoading(true);
        try {
            const response = await fetchHistory(pageNumber, profile.token);
            if (response.records.length > 0) {
                setItems(prev => prev.concat(response.records));
                setTotalPage(response.paging.pages);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleScroll = ({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const paddingToBottom = 20;
        
        // Check if user has scrolled to bottom
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            if (!loading && page < totalPage) {
                const newPage = page + 1;
                setPage(newPage);
                fetchData(newPage);
            }
        }
    };

    useEffect(() => {
        fetchData(page);
    }, []);
    return (
        <>
            <View style={styles.homeHeader}>
                <Text style={styles.homeName}>
                    Lịch sử Mua hàng
                </Text>
            </View>
            <ScrollView 
                style={{ flex: 1, paddingBottom: 50 }}
                onScroll={handleScroll}
                scrollEventThrottle={400}
            >
                {(!loading && items.length == 0) && (
                    <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.textNormal}>Bạn chưa có lịch sử mua hàng</Text>
                    </View>
                )}
                {items.map((item, idx) => {
                    return (
                        <View key={`${item.id}_${idx}`} style={styles.itemBlock}>
                            <Text style={[styles.textSmall, { textAlign: 'right', fontSize: 10 }]}>{item.created_at}</Text>
                            <View style={[styles.itemContent, { marginTop: 5 }]}>
                                <View style={styles.itemRow}>
                                    <Text style={[styles.textSmall, { flex: 1 }]}>#{item.receipt_code}</Text>
                                    <Text style={[styles.moneyText, { flex: 1, textAlign: 'right' }]}>{item.total}</Text>
                                </View>
                                <Text style={styles.textNormal}>Thanh toán cho {item.store_name}</Text>
                                <Text style={[styles.textSmall, { color: '#999898'}]}>{item.note}</Text>
                            </View>
                        </View>
                    )
                })}
                {loading && items.length > 0 && (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                )}
                {!loading && page >= totalPage && items.length > 0 && (
                    <View style={{ padding: 20 }}>
                        <Text style={{ textAlign: 'center', color: '#888' }}>
                            Không còn dữ liệu
                        </Text>
                    </View>
                )}
            </ScrollView>
        </>
    )
}

export default OrderHistory;