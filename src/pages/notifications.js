import { View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { fetchNotifications, readAllNotifications } from "../fetcher/api";
import { useLang } from "../shared/hooks";
import styles from "../styles/global";
import BackButton from "../components/home/backButton";

function NotificationsScreen({ navigation, route }) {
    const { lang } = useLang();

    const { item } = route.params;
    const profile = item ? item : null;
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
            const response = await fetchNotifications(pageNumber, profile.token);
            if (response.records.length > 0) {
                if (pageNumber === 1) {
                    setItems(response.records);
                } else {
                    setItems(prev => prev.concat(response.records));
                }
                setTotalPage(response.paging.pages);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
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

    const readAll = async (id) => {
        await readAllNotifications(id, profile.token);
        if (id === 0) {
            setItems(items.map(item => ({ ...item, is_read: 1 })));
        } else {
            setItems(items.map(item => item.id === id ? { ...item, is_read: 1 } : item));
        }
    }

    useEffect(() => {
        fetchData(page);
    }, []);
    return (
        <>
            <View style={styles.homeHeader}>
                <BackButton onBack={() => navigation.navigate('Home', { item: profile })} />
                <View style={{ flex: 1 }}>
                </View>
                <TouchableOpacity style={{ position:'fixed', right: 10, top:20}} onPress={() => readAll(0)}>
                    <Text style={styles.textNormal}>{lang.read_all}</Text>
                </TouchableOpacity>
            </View>
            <ScrollView 
                style={{ flex: 1 }}
                onScroll={handleScroll}
                scrollEventThrottle={400}
            >
                {(!loading && items.length == 0) && (
                    <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.textNormal}>{lang.no_notifications}</Text>
                    </View>
                )}
                {items.map((item, idx) => {
                    return (
                        <TouchableOpacity key={idx} style={styles.itemBlock} onPress={() => readAll(item.id)}>
                            <View style={[styles.itemContent, { padding: 10, margin: 5, backgroundColor: item.is_read == 0 ? 'white' : '#f0f0f0' }]}>
                                <View style={styles.itemCollumn}>
                                    <Text style={[styles.textSmall, { flex: 1, fontWeight: 'bold' }]}>{item.title} </Text>
                                    <Text style={[styles.textSmall, { flex: 1 }]}>{item.content}</Text>
                                </View>
                                <Text style={[styles.textSmall, { textAlign: 'right', fontSize: 10, color: 'gray' }]}>{item.created_date}</Text>
                            </View>
                        </TouchableOpacity>
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
                            {lang.no_more_data || 'Không còn dữ liệu'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </>
    )
}

export default NotificationsScreen;