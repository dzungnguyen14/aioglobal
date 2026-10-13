import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import styles from './style';
import { memo } from 'react';
import BottomEmo from './bottom-emo';
import PostDetail from './detail';
import RenderHTML from 'react-native-render-html';
import { formatDateToTime, getItem } from '../../../../shared/utils';
import { useLang } from '../../../../shared/hooks';
import VideoPlayerUI from '../videoplayer';
import { Ionicons } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';
import { Image } from 'expo-image';

const screenWidth = Dimensions.get('window').width;

const MAX_LENGTH = 100;
const MAX_WIDTH = Dimensions.get('window').width;

const Post = ({ item, isInView, openActionSheet, profile, SOCIAL_CONFIG, onOpenProfile }) => {
    const { lang } = useLang();
    const isAuthor = React.useMemo(() => {
        return item.owner_id === SOCIAL_CONFIG.user.user_id;
    }, [item, SOCIAL_CONFIG]);

    const [maxVisible, setMaxVisible] = useState(4);
    const [visible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [openDetail, setOpenDetail] = useState(false);


    const shortHTML = item.description.length > MAX_LENGTH
        ? item.description.substring(0, MAX_LENGTH) + '...'
        : item.description;

    const viewingImages = useMemo(() => {
        return item.images.map((image) => ({ uri: image }));
    }, [item.images]);
    const visibleImages = useMemo(() => item.images.slice(0, maxVisible).map((image) => ({ uri: image })), [item.images, maxVisible]);
    const remaining = item.images.length - maxVisible;

    const onClickOpen = () => {
        setOpenDetail(!openDetail);
    }

    const getItemStyle = (index, total) => {
        const fullWidth = Dimensions.get('window').width - 12;
        const halfWidth = Dimensions.get('window').width / 2 - 12;
        // Layout cho từng số lượng ảnh
        if (total === 1) {
            return { width: '100%', maxHeight: 220, borderRadius: 10, width: fullWidth };
        }
        if (total === 2) {
            return { width: '48%', maxHeight: 300, borderRadius: 10 };
        }
        if (total === 3) {
            return index === 0
                ? { width: '100%', height: screenWidth * 0.5, borderRadius: 10 }
                : { width: halfWidth, height: screenWidth * 0.4, borderRadius: 10 };
        }
        if (total === 4) {
            return { width: halfWidth, height: screenWidth * 0.4, borderRadius: 10 };
        }
        return {};
    };


    const openImage = (index) => {
        setCurrentIndex(index);
        setIsVisible(true);
    };

    if (openDetail) return <PostDetail item={item} onClose={() => setOpenDetail(false)} profile={profile} onOpenProfile={(item) => {
        setOpenDetail(false);
        onOpenProfile(item);
    }} social_id={SOCIAL_CONFIG.user.user_id} />
    
    return (
        <View style={styles.postContainer}>
            <TouchableOpacity style={styles.userInfo} onPress={() => onOpenProfile({ user_id: item.owner_id, avatar: item.avtar, username: item.title, coverPhoto: item.coverPhoto, email: item.email })}>
                {item.avtar && (
                    <Image
                        source={{ uri: item.avtar }}
                        style={styles.avatar}
                    />
                )}
                <View>
                    <Text style={styles.username}>{item.title}</Text>
                    <Text style={styles.timeAgo}>{formatDateToTime(item.publish_time, lang)}</Text>
                </View>
                {isAuthor && (
                    <View style={styles.actionContainer}>
                        <TouchableOpacity onPress={() => openActionSheet(item)}>
                            <Ionicons name="ellipsis-horizontal" size={20} color="black" />
                        </TouchableOpacity>
                    </View>)}
            </TouchableOpacity>
            <TouchableOpacity onPress={onClickOpen} style={{ marginBottom: 4 }}>
                <RenderHTML
                    contentWidth={MAX_WIDTH}
                    source={{ html: shortHTML.replace(/<[^>]+>/g, '') }}
                />
                {item.description.length > MAX_LENGTH && (
                    <View >
                        <Text style={{ color: '#007AFF', marginTop: 8 }}>
                            Xem thêm
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
            <ImageViewing
                images={viewingImages}
                imageIndex={currentIndex}
                visible={visible}
                onRequestClose={() => setIsVisible(false)}
                swipeToCloseEnabled
                doubleTapToZoomEnabled
            />
            <View style={styles.imageContainer}>
                {visibleImages.map((img, index) => {
                    const style = getItemStyle(index, visibleImages.length);
                    return (
                        <TouchableOpacity onPress={() => openImage(index)} key={index} style={[styles.imageWrapper, style]}>
                            <Image source={{ uri: img.uri }} style={[styles.image, { objectFit: 'contain', }]} />
                            {index === maxVisible - 1 && remaining > 0 && (
                                <View style={styles.overlay}>
                                    <Text style={styles.overlayText}>+{remaining}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
            {item.video && (
                <VideoPlayerUI uri={item.video} isPlay={isInView} />
            )}
            <BottomEmo item={item} hideComment={false} onClickComment={onClickOpen} profile={profile} social_id={SOCIAL_CONFIG.user.user_id} />
        </View>
    );
};


export default memo(Post);
