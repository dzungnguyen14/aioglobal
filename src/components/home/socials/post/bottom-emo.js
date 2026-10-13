import React, { memo, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import styles from './style';
import { useLang } from '../../../../shared/hooks';
import { fetchSocial } from '../../../../fetcher/api';
import { getItem } from 'expo-secure-store';

const BottomEmo = ({ hideComment, onClickComment, item, profile, social_id}) => {
    const apiSocialAPI = getItem('SOCIAL_API_URL');
    const likedUserIds = item.liked_user_ids ? item.liked_user_ids.split(',') : [];
    const [like, setLike] = React.useState(likedUserIds.includes(String(social_id)));
    const [likeCount, setLikeCount] = React.useState(item.like_count ?? 0);
    const { lang } = useLang();
    const onLike = async () => {
        setLikeCount(prev => prev + 1);
        setLike(prev => !prev);
        const resp = await fetchSocial(apiSocialAPI + '/likes_app', {
            id: item.blog_id,
            type: 'blogs',
            action: 'like',
            email: profile.email,
        }, profile.token)
        console.log(resp);
    }

    const onDislike = async () => {
        setLikeCount(prev => prev - 1);
        setLike(prev => !prev);
         const resp = await fetchSocial(apiSocialAPI + '/likes_app', {
            id: item.blog_id,
            type: 'blogs',
            action: 'unlike',
            email: profile.email,
        }, profile.token)
        console.log(resp);

    }
    const onReport = async () => {
        Alert.alert(
            "Báo cáo",
            "Báo cáo nội dung này?",
            [
                { text: "Hủy", style: "cancel" },
                { text: "Báo cáo", onPress: () => Alert.alert("Báo cáo thành công") },
            ],
        );
    }
    const onShare = async () => {
        await Share.share({
            message: lang.share_post,
            url: item.custom_url_share,
        });
    }

    return (
        <View style={{ flexDirection: 'row' }}>
            <View style={[styles.actions, { flex: 1 }]}>
                <TouchableOpacity
                    onPress={like ? onDislike : onLike}
                    style={[styles.actionButton, { borderRightWidth: 1, borderColor: '#ccc', paddingRight: 12 }]} >
                    <FontAwesome name="heart" size={18} color={like ? 'red' : 'gray'} />
                    <Text style={styles.actionText}>Thích</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <FontAwesome name="heart" size={18} color={likeCount ? 'red' : 'gray'} />
                    <Text style={styles.likeCount}>{likeCount}</Text>
                </TouchableOpacity>
                {!hideComment && (
                    <TouchableOpacity style={styles.actionButton} onPress={onClickComment}>
                        <Ionicons name="chatbubble-outline" size={20} color="gray" />
                        <Text style={styles.actionText}>{item.comment_count}</Text>
                    </TouchableOpacity>
                )}

            </View>
            <View style={{ flex: 1, flexDirection: 'row', gap: 20, paddingTop:10, justifyContent: 'flex-end', alignItems: "center", paddingRight: 20 }}>
                <TouchableOpacity style={styles.actionButton} onPress={onShare}>
                    <Ionicons name="share-social-outline" size={20} color="gray" />
                    <Text style={styles.actionText}>Chia sẻ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { borderRightWidth: 1, borderColor: '#ccc', paddingRight: 12 }]} onPress={onReport}>
                    <Text style={styles.actionText}>Báo cáo</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
};


export default memo(BottomEmo);
