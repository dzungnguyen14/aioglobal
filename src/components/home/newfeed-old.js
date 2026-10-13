import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import styles from "../../styles/global";
import { useEffect, useState } from "react";
import { fetchNewfeeds, likePost } from "../../fetcher/api";
import { useLang } from "../../shared/hooks";
import {  MaterialIcons } from "@expo/vector-icons";
import { CustomImage } from "../images";
import { Image } from "expo-image";

function HomeNewfeedOld({ profile, navigation }) {
    const { lang } = useLang();
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [items, setItems] = useState([]);
    const [reactions, setReactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async (pageNumber) => {
        if (loading && pageNumber > 1) return;
        
        setLoading(true);
        try {
            const response = await fetchNewfeeds(pageNumber, profile.token);
            if (response.records.length > 0) {
                setItems(prev => prev.concat(response.records));
                setTotalPage(response.paging.pages);
                setReactions(response.reactions);
            }
        } catch (error) {
            console.error('Error fetching newfeeds:', error);
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

    const onLike = async (item, reaction) => {
        setItems(items.map(i => {
            return { 
                ...i,
                is_show_reaction: item.id == i.id ? false : i.is_show_reaction,
                is_like: item.id == i.id ? !i.is_like : i.is_like,
                no_like: item.id == i.id ? (!i.is_like ? i.no_like + 1 : i.no_like - 1) : i.no_like
            }
        }))
        await likePost({ 
            id: item.id,
            is_like: !item.is_like,
            reaction: reaction
        }, profile.token)
    }

    const showReaction = (item) => {
        setItems(items.map(i => {
            return { 
                ...i,
                is_show_reaction: item.id == i.id ? !i.is_show_reaction : i.is_show_reaction,
            }
        }))
    }

    useEffect(() => {
        fetchData(page);
    }, []);

   
    return (
        <>
            <View style={styles.homeHeader}>
                <Text style={[styles.homeName, { marginTop : 30}]}>
                    {lang.newfeeds}
                </Text>
            </View>
            <ScrollView 
                style={{ flex: 1, backgroundColor: '#d9d9d9' }}
                onScroll={handleScroll}
                scrollEventThrottle={400}
            >
                {(!loading && items.length == 0) && (
                    <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.textNormal}>{lang.no_newfeeds}</Text>
                    </View>
                )}
                {items.map((item, idx) => {
                    console.log(item);
                    return (
                        <View key={idx} style={styles.itemBlock}>
                            <View style={[styles.itemContent, styles.boxShadow, { marginBottom: 15, backgroundColor: '#fff', borderRadius: 0, padding: 0, borderWidth: 1, borderColor: '#d9d9d9' }]}>
                                <TouchableOpacity style={[styles.itemCollumn, { padding: 10}]} onPress={() => navigation.navigate('Post', { item: profile, post: item, reactions: reactions})}>
                                    <View style={styles.itemCollumn}>
                                        <Text style={{ fontSize:13, color:'#000', fontWeight:'600' }}>{item.title}</Text>
                                        <Text style={{ fontSize:11, color:'#828282', fontWeight:'500' }}>{item.created_at}</Text>
                                    </View>
                                    <Text style={{ fontSize: 12, color: '#000', fontWeight: '500' }}>{item.description}</Text>
                                </TouchableOpacity>
                                    <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', width: '100%' }} onPress={() => navigation.navigate('Post', { item: profile, post: item, reactions: reactions })}>
                                        <Image source={{ uri: 'https://app.aioglobal.org/api/upload/media/3ce09713f8b70a8cc369a507a95870dd' }} style={{ width: '100%', height: 150, objectFit: 'cover' }} />
                                    </View>
                                <View style={[styles.itemRow, { marginHorizontal: 20, marginTop: 10 }]}>
                                    <View style={[styles.itemRow, { alignContent: 'center', alignItems: 'center' }]}>
                                        <Text style={{ fontSize: 14, color: item.is_like ? 'blue' : '#000', fontWeight: '500' }}>{item.no_like} {lang.like}</Text>
                                        <Text style={{ fontSize: 14, color: '#000', fontWeight: '500' }}>{item.no_comment} {lang.comment}</Text>
                                    </View>
                                </View>
                                <View style={[styles.itemRow, {  marginHorizontal: 20, borderTopColor: '#eee', borderTopWidth: 1, paddingTop: 5, position:'relative' }]}>
                                    {item.is_show_reaction && <View style={[styles.itemRow, styles.boxShadow, { position: 'absolute', top: -40, left: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', paddingVertical: 5, paddingHorizontal: 20, borderRadius: 5 }]}>
                                        {reactions.map(reaction => {
                                            return (
                                                <TouchableOpacity key={reaction.id} onPress={() => onLike(item, reaction.id)}>
                                                    <Image source={{ uri: reaction.icon_url }} width={25} height={25} />
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </View>}

                                    <TouchableOpacity onLongPress={() => showReaction(item)} onPress={() => onLike(item, 1)} style={[styles.itemRow, { alignContent: 'center', alignItems: 'center' }]}>
                                        <MaterialIcons name={item.is_like ? 'favorite' : 'favorite-outline'} color={item.is_like ? 'blue' : '#000'} size={15} />
                                        <Text style={{ fontSize: 14, color: item.is_like ? 'blue' : '#000', fontWeight: '500' }}>{lang.like}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => navigation.navigate('Post', { item: profile, post: item, reactions: reactions })} style={[styles.itemRow, { alignContent: 'center', alignItems: 'center' }]}>
                                        <MaterialIcons name="comment" size={15} />
                                        <Text style={{ fontSize: 14, color: '#000', fontWeight: '500' }}>{lang.comment}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.itemRow, { alignContent: 'center', alignItems: 'center' }]}>
                                        <MaterialIcons name="share" size={15} />
                                        <Text style={{ fontSize: 14, color: '#000', fontWeight: '500' }}>{lang.share}</Text>
                                    </TouchableOpacity>
                                </View>
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
                            {lang.no_more_data || 'Không còn dữ liệu'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </>
    )
}

export default HomeNewfeedOld;