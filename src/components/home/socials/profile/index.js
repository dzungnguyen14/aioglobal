import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
    FlatList,
    Pressable,
    Platform
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import styles from './style';
import Post from '../post';
import { memo } from 'react';
import { getSocialsPosts } from '../../../../fetcher/api';
import { Image } from 'expo-image';
import { onFindChatSocial } from '../../zoom/api';
import * as ImagePicker from 'expo-image-picker';

const ProfileTab = {
    POSTS: 'posts',
    ABOUT: 'about',
    PHOTOS: 'photos',
    FRIENDS: 'friends'
};

const PAGE_LIMIT = 5;

const ProfilePage = ({ onClose, profile, SOCIAL_CONFIG, userProfile, navigation, onUpdateAvatar, onUpdateCover }) => {
    const [activeTab, setActiveTab] = useState(ProfileTab.POSTS);
    const [posts, setPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const isFetchingRef = useRef(false);
    const [pendingCoverImage, setPendingCoverImage] = useState(null);
    const [pendingAvatarImage, setPendingAvatarImage] = useState(null);

    const loadPosts = useCallback(async (pageNumber) => {
        if (isFetchingRef.current || !hasMore) return;
        isFetchingRef.current = true;
        setIsLoading(true);
        try {
            const { data } = await getSocialsPosts({
                page: pageNumber,
                limit: PAGE_LIMIT,
                owner_id: userProfile.user_id
            }, profile.token);
            if (data && data.length > 0) {
                if (pageNumber === 1) {
                    setPosts(data);
                } else {
                    setPosts(prev => [...prev, ...data]);
                }
                setPage(pageNumber);
                setHasMore(data.length === PAGE_LIMIT);
            } else {
                setHasMore(false);
            }
        } catch (e) {
        } finally {
            isFetchingRef.current = false;
            setIsLoading(false);
        }
    }, [profile.token, userProfile.user_id, hasMore]);

    useEffect(() => {
        setPosts([]);
        setPage(1);
        setHasMore(true);
        loadPosts(1);
        // eslint-disable-next-line
    }, [userProfile.user_id]);

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
        Alert.alert(
            "Thành công",
            isFollowing ? "Đã hủy theo dõi" : "Đã theo dõi"
        );
    };

    const handleBan = () => {
        Alert.alert(
            "Đã chặn thành công",
            "Người dùng đã được chặn thành công."
        );
   
    };

    const onEnterChat = async () => {
        const response = await onFindChatSocial({
            email: userProfile.email,
            display_name: userProfile.username
        }, profile.token);
        if (response.room) {
            const people = response.room.people;
            const sender = people.find(person => person._id === userProfile.user_id);
            const receiver = people.find(person => person._id !== userProfile.user_id);
            onClose();

            navigation.navigate('Chatbox', {
                room_id: response.room._id,
                counterpart: receiver?._id,
                _sender: sender,
                _receiver: receiver
            });
        } else {
            console.log(response, userProfile.email);
            Alert.alert("Lỗi", response.msg);
        }
    };

    const confirmSaveImage = (type, imageUri, file) => {
        const isAvatar = type === 'avatar';
        const title = isAvatar ? 'Lưu ảnh đại diện?' : 'Lưu ảnh bìa?';
        const message = isAvatar
            ? 'Bạn có muốn cập nhật ảnh đại diện này không?'
            : 'Bạn có muốn cập nhật ảnh bìa này không?';

        Alert.alert(title, message, [
            {
                text: 'Huỷ',
                style: 'cancel'
            },
            {
                text: 'Lưu',
                onPress: async () => {
                    if (isAvatar) {
                        setPendingAvatarImage(imageUri);
                    } else {
                        setPendingCoverImage(imageUri);
                    }

                    try {
                        if (isAvatar && typeof onUpdateAvatar === 'function') {
                            onUpdateAvatar(file);
                        } else if (!isAvatar && typeof onUpdateCover === 'function') {
                            onUpdateCover(file);
                        }
                    } catch (error) {
                        Alert.alert('Lỗi', 'Không thể cập nhật ảnh. Vui lòng thử lại.');
                    }
                }
            }
        ]);
    };

    const handlePickImage = async (type) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            confirmSaveImage(type, result.assets[0].uri, result.assets[0]);
        }
    };

    const returnImageUrl = (url) => {
        let result = url ?? 'https://profile.aioglobal.org/bg-lanscape.png';
        return Platform.OS === 'ios'? result : result.replace("https", "http");
    }

    const renderHeader = () => (
        <View style={styles.header}>
            {/* Cover Photo */}
            <View style={styles.coverPhotoContainer}>
                <Image
                    source={{ uri: pendingCoverImage ? pendingCoverImage : returnImageUrl(userProfile.coverPhoto) }}
                    style={styles.coverPhoto}
                    resizeMode="cover"
                />
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                {/* Button to upload cover photo - now opens image picker directly */}
                <Pressable
                    style={styles.editCoverButton}
                    onPress={() => handlePickImage('cover')}
                >
                    <Ionicons name="pencil" size={14} color="#fff" />
                </Pressable>
            </View>
            {/* Profile Info */}
            <View style={styles.profileInfo}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: pendingAvatarImage ? pendingAvatarImage : returnImageUrl(userProfile.avatar) }}
                        style={styles.avatar}
                    />
                    {userProfile.isVerified && (
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={20} color="#1DA1F2" />
                        </View>
                    )}
                    <Pressable
                        style={styles.editAvatarButton}
                        onPress={() => handlePickImage('avatar')}
                    >
                        <Ionicons name="pencil" size={14} color="#fff" />
                    </Pressable>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{userProfile.username}</Text>
                    {/* Action Buttons */}
                    <View style={[styles.actionButtons, { marginTop: 10 }]}>
                        <TouchableOpacity
                            style={[styles.followButton, isFollowing && styles.followingButton]}
                            onPress={handleFollow}
                        >
                            <Ionicons
                                name={isFollowing ? "person-remove" : "person-add"}
                                size={16}
                                color="#fff"
                            />
                            <Text style={styles.followButtonText}>
                                {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.messageButton} onPress={onEnterChat}>
                            <Ionicons name="chatbubble" size={16} color="#007AFF" />
                            <Text style={styles.messageButtonText}>Nhắn tin</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.messageButton, { borderColor: 'red' }]} onPress={handleBan}>
                            <Ionicons name="ban" size={16} color="red" />
                            <Text style={[styles.messageButtonText, { color: 'red' }]}>Chặn</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderTabs = () => (
        <View style={styles.tabContainer}>
            {Object.values(ProfileTab).map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                    onPress={() => setActiveTab(tab)}
                >
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                        {getTabLabel(tab)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const getTabLabel = (tab) => {
        switch (tab) {
            case ProfileTab.POSTS: return "Bài viết";
            case ProfileTab.ABOUT: return "Giới thiệu";
            case ProfileTab.PHOTOS: return "Ảnh";
            case ProfileTab.FRIENDS: return "Bạn bè";
            default: return "";
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case ProfileTab.POSTS:
                return renderPosts();
            case ProfileTab.ABOUT:
                return renderAbout();
            case ProfileTab.PHOTOS:
                return renderPhotos();
            case ProfileTab.FRIENDS:
                return renderFriends();
            default:
                return renderPosts();
        }
    };

    const renderPostItem = useCallback(({ item, index }) => (
        <Post
            key={item._id || index}
            item={item}
            profile={profile}
            SOCIAL_CONFIG={SOCIAL_CONFIG}
            isInView={false}
            openActionSheet={() => { }}
        />
    ), [profile, SOCIAL_CONFIG]);

    const renderFooter = () => {
        if (isLoading)
            return (
                <View style={{ padding: 20 }}>
                    <ActivityIndicator size="small" color="#888" />
                </View>
            );
        if (!hasMore) {
            return (
                <View style={{ padding: 16 }}>
                    <Text style={{ textAlign: 'center', color: '#888' }}>Hết bài viết</Text>
                </View>
            );
        }
        return null;
    };

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            loadPosts(page + 1);
        }
    };

    const renderPosts = () => (
        <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={(item, idx) => item._id ? String(item._id) : String(idx)}
            ListFooterComponent={renderFooter}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.7}
            initialNumToRender={5}
            maxToRenderPerBatch={7}
            windowSize={10}
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={false}
        />
    );

    const renderAbout = () => (
        <View style={styles.photosContainer}>
            <Text style={styles.comingSoon}>Tính năng đang phát triển</Text>
        </View>
    );

    const renderPhotos = () => (
        <View style={styles.photosContainer}>
            <Text style={styles.comingSoon}>📸 Tính năng đang phát triển</Text>
        </View>
    );

    const renderFriends = () => (
        <View style={styles.friendsContainer}>
            <Text style={styles.comingSoon}>👥 Tính năng đang phát triển</Text>
        </View>
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <Modal
                    statusBarTranslucent
                    animationType="fade"
                    transparent={false}
                    visible={true}
                    onRequestClose={onClose}
                >
                    <View style={styles.scrollView}>
                        {renderHeader()}
                        {renderTabs()}
                        {activeTab === ProfileTab.POSTS && renderPosts()}
                        {/* popup removed */}
                    </View>
                </Modal>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default memo(ProfilePage);
