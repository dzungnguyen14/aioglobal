import { View, Text, Image, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { useLang } from "../shared/hooks";
import styles from "../styles/global";
import { HomeTab } from "../constants/home";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { likePost } from "../fetcher/api";
import PostComments from "../components/comments";
import RenderHTML from "react-native-render-html";
import VideoScreen from "../components/video";

function PostScreen({ navigation, route }) {
    const { lang } = useLang();
    const { item, post, reactions } = route.params;
    const profile = item ? item : null;
    const [detail, setDetail] = useState(post ? post : {});

    const onLike = async (item, reaction) => {
        setDetail(
            {
                ...item,
                is_show_reaction: false,
                is_like: !item.is_like,
                no_like: !item.is_like ? item.no_like + 1 : item.no_like - 1
            }
        )
        await likePost({
            id: item.id,
            is_like: !item.is_like,
            reaction: reaction
        }, profile.token)
    }

    const showReaction = (item) => {
        setDetail(
            {
                ...item,
                is_show_reaction: !item.is_show_reaction,
            }
        )
    }


    return (
        <>
            <View style={[styles.homeHeader, { justifyContent: 'flex-start' }]}>
                <TouchableOpacity onPress={() => navigation.navigate('Home', { item: profile, mode: HomeTab.Newfeeds })} >
                    <Text style={[styles.homeName, { fontSize: 13, fontWeight: '500' }]}>{lang.back}</Text>
                </TouchableOpacity>
                <View>
                    <Text style={[styles.homeName, { textAlign: 'center', fontSize: 13 }]}>
                        {detail.title.length > 20 ? detail.title.slice(0, 40) + '...' : detail.title}
                    </Text>
                </View>
            </View>
            <ScrollView>
                {detail.video && (
                    <VideoScreen source={detail.video} />
                )}
                {detail.content && (
                    <View style={{ padding: 5}}>
                        <RenderHTML contentWidth={Dimensions.get('screen').width} source={{ html: detail.content }}  />
                    </View>
                )}
                <View style={[styles.itemContent, styles.boxShadow, { flex: 1, marginBottom: 0, backgroundColor: '#fff', borderRadius: 0, padding: 0, borderWidth: 1, borderColor: '#d9d9d9' }]}>
                    <View style={[styles.itemRow, { marginHorizontal: 10 }]}>
                        <View style={[styles.itemRow, { alignContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ fontSize: 14, color: detail.is_like ? 'blue' : '#000', fontWeight: '500' }}>{detail.no_like} {lang.like}</Text>
                            <Text style={{ fontSize: 14, color: '#000', fontWeight: '500' }}>{detail.no_comment} {lang.comment}</Text>
                            <Text style={{ fontSize: 11, color: '#828282', fontWeight: '500', textAlign: 'right', flex: 1 }}>{detail.created_at}</Text>
                        </View>
                    </View>
                    <View style={[styles.itemRow, { marginHorizontal: 20, borderTopColor: '#eee', borderTopWidth: 1, paddingTop: 5, position: 'relative' }]}>
                        {detail.is_show_reaction && <View style={[styles.itemRow, styles.boxShadow, { position: 'absolute', top: -40, left: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', paddingVertical: 5, paddingHorizontal: 20, borderRadius: 5 }]}>
                            {reactions && reactions.map(reaction => {
                                return (
                                    <TouchableOpacity key={reaction.id} onPress={() => onLike(detail, reaction.id)}>
                                        <Image source={{ uri: reaction.icon_url }} width={25} height={25} />
                                    </TouchableOpacity>
                                )
                            })}
                        </View>}

                        <TouchableOpacity onLongPress={() => showReaction(detail)} onPress={() => onLike(detail, 1)} style={[styles.itemRow, { alignContent: 'center', alignItems: 'center' }]}>
                            <MaterialIcons name={detail.is_like ? 'favorite' : 'favorite-outline'} color={detail.is_like ? 'blue' : '#000'} size={15} />
                            <Text style={{ fontSize: 14, color: detail.is_like ? 'blue' : '#000', fontWeight: '500' }}>{lang.like}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.itemRow, { alignContent: 'center', alignItems: 'center' }]}>
                            <MaterialIcons name="comment" size={15} />
                            <Text style={{ fontSize: 14, color: '#000', fontWeight: '500' }}>{lang.comment}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.itemRow, { alignContent: 'center', alignItems: 'center' }]}>
                            <MaterialIcons name="share" size={15} />
                            <Text style={{ fontSize: 14, color: '#000', fontWeight: '500' }}>{lang.share}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <PostComments post_id={detail.id} token={profile.token} />
            </ScrollView>
        </>
    )
}

export default PostScreen;