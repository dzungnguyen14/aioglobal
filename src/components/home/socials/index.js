import React , { useEffect, useRef, useState, memo } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Text, Linking } from 'react-native';
import styles from './style';
import Post from './post';
import { fetchSocial, getConfigSocial, getSocialsPosts, uploadAvatar, uploadCover } from '../../../fetcher/api';
import Toolbar from './toolbar';
import PostCreate from './create';
import ProfilePage from './profile';
import HomeHeader from '../components/header';
import { useActionSheet } from '@expo/react-native-action-sheet';
import useConfirmDialog from '../../confirm';
import { setItem } from '../../../shared/utils';
import { Ionicons } from '@expo/vector-icons';
import { useGlobal } from '../../../state/global';
import { Modal } from 'react-native-paper';

export const TABS = {
    NEWFEED: 'newfeed',
    VIDEO: 'video',
}
const SocialDashboard = ({ profile, navigation, toggleOS }) => {
    const { dispatch } = useGlobal();
    const [tab, setTab] = useState(TABS.NEWFEED);
    const { state } = useGlobal();
    const { autoPlayVideo } = state;
    const confirm = useConfirmDialog();
    const [SOCIAL_CONFIG, SET_SOCIAL_CONFIG] = useState({ url: 'https://aioglobal.com.vn/api', user: {} });
    const [showForm, setShowForm] = useState(false);
    const [showNavigation, setShowNavigation] = useState(false);

    const [showProfile, setShowProfile] = useState(false);
    const [userProfile, setUserProfile] = useState({});
    const [icons, setIcons] = useState([]);

    const [draft, setDraft] = useState({
        images: [],
        video: [],
        content: '',
    });
    const containerRefs = useRef([]);
    const [currentInView, setCurrentInView] = useState(0);

    const [filter, setFilter] = useState({
        page: 1,
        limit: 11,
    })
    const [loadingMore, setLoadingMore] = useState(false);
    const [data, setData] = useState([]);
    const loadPosts = async () => {
        const response = await getSocialsPosts(filter, profile.token);
        if (response.data && response.data.length > 0) {
            if (filter.page > 1) {
                setData(data.concat(response.data));
            } else {
                setData(response.data);
            }
        }
        setLoadingMore(false);
    }

    const loadMore = async () => {
        setLoadingMore(true);rrr
        setFilter(prev => ({ ...prev, page: prev.page + 1 }))
    }
    
    const handleScroll = ({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        containerRefs.current.forEach((viewRef, i) => {
            if (viewRef && viewRef.measure) {
                viewRef.measure((x, y, width, height, left, top) => {
                    const isViewVisible = top < layoutMeasurement.height && top + height > layoutMeasurement.height;
                    if (isViewVisible) {
                        setCurrentInView(i);
                    }
                });
            }
        });
        // scroll to bottom
        const isBottom = layoutMeasurement.height + contentOffset.y >= (contentSize.height - 1000);
        if (isBottom && !loadingMore && filter.page < 20) {
            loadMore();
        }
    };
    const onSaveDraft = (item) => {
        setShowForm(false);
        setDraft(item);
    }

    const onGetConfig = async () => {
        const response = await getConfigSocial(profile.token);
        if (response.status) {
            await setItem('SOCIAL_API_URL', response.api_url);
        }
        if (response.user) {
            await setItem('SOCIAL_USER', JSON.stringify(response.user));
        }
        if (response.icons) {
            setIcons(response.icons);
        }
        SET_SOCIAL_CONFIG({ url: response.api_url ?? '', user: response.user ?? {} });
    }

    useEffect(() => {
        onGetConfig();
    }, []);

    const { showActionSheetWithOptions } = useActionSheet();
    const openActionSheet = (item) => {
        const options = ['Xoá bài đăng', 'Đóng'];
        const cancelButtonIndex = 2;
        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (selectedIndex) => {
                switch (selectedIndex) {
                    case 0:
                        confirm('Xoá bài đăng', 'Bạn có chắc chắn muốn xoá bài đăng này?', async () => {
                            const resp = await fetchSocial(`${SOCIAL_CONFIG.url}/blogs/delete_app`, {
                                id: item.custom_url,
                                email: profile.email,
                            }, profile.token, 'post', 10000, true);
                            loadFirst();
                        })
                        // On Delete
                        break;
                    case 1:
                        // On Close
                        break;
                }
            }
        );
    };

    useEffect(() => {
        loadPosts();
    }, [filter.page]);


    const loadFirst = async () => {
        setShowForm(false);
        setDraft({});
        setData([]);
        setFilter(prev => ({ ...prev, page: 1 }))
        setTimeout(() => {
            loadPosts();
        }, 1000);
    }

    const onOpenProfile = ({ user_id, avatar, username, coverPhoto, email }) => {
        setUserProfile({ user_id, avatar, username, coverPhoto, email });
        dispatch({ type: 'SET_AUTO_PLAY_VIDEO', payload: false });
        setShowProfile(true);
    }

    const onCloseProfile = () => {
        setShowProfile(false);
        dispatch({ type: 'SET_AUTO_PLAY_VIDEO', payload: true });
    }

    const onShowOwnerProfile = () => {
        const item = SOCIAL_CONFIG.user;
        setUserProfile({
            user_id: item.user_id,
            avatar: item.avtar.indexOf('app.aioglobal.org') > -1 ? item.avtar :  `https://aioglobal.com.vn${item.avtar}`,
            username: item.displayname,
            coverPhoto: item.cover.indexOf('app.aioglobal.org') > -1 ? item.cover : `https://aioglobal.com.vn${item.cover}`
        });
        setShowProfile(true);
    }

    const onUpdateAvatar = async (file) => {
        const { image, result } = await uploadAvatar(file, profile.token);
        if (result) {
            dispatch({ type: 'SET_PROFILE', payload: { ...profile, avatar: image } });
            await setItem(USER_TOKEN_KEY, JSON.stringify(profile));
        }
    }
    const onUpdateCover = async (file) => {
        const { image, result } = await uploadCover(file, profile.token);
        if (result) {
            dispatch({ type: 'SET_PROFILE', payload: { ...profile, coverPhoto: image } });
            await setItem(USER_TOKEN_KEY, JSON.stringify(profile));
        }
    }

    return (
        <View style={styles.container}>
            <HomeHeader
                navigation={navigation}
                isShowAccount
                isShowNavigation
                onShowAccount={onShowOwnerProfile}
                onShowNavigation={() => setShowNavigation(true)}
            />
            <ScrollView style={[styles.container, { marginBottom: 80 }]} onScroll={handleScroll} scrollEventThrottle={400} refreshControl={
                <RefreshControl refreshing={loadingMore} onRefresh={loadFirst} />
            }>
                <Toolbar
                    navigation={navigation}
                    profile={profile}
                    onPress={() => setShowForm(true)}
                    onShowProfile={onShowOwnerProfile}
                    tab={tab}
                    toggleOS={toggleOS}
                    setTab={setTab}
                />
                {data.map((item, index) => {
                    return (
                        <View ref={(ref) => (containerRefs.current[index] = ref)} key={index}>
                            <Post SOCIAL_CONFIG={SOCIAL_CONFIG} item={item} isInView={index === currentInView && autoPlayVideo} openActionSheet={openActionSheet} profile={profile} onOpenProfile={onOpenProfile} />
                        </View>
                    )
                })}
                {/* {loadingMore && (
                    <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 20 }} />
                )} */}
            </ScrollView>
            {showForm && (<PostCreate onClose={(item) => onSaveDraft(item)} item={draft} onSuccess={loadFirst} />)}
            {showNavigation && (
                <Modal
                    onDismiss={() => setShowNavigation(false)}
                    animationType="slide"
                    transparent={true}
                    visible={showNavigation}
                    onRequestClose={() => setShowNavigation(false)}
                    style={styles.navigatorWrap}
                >
                    <View style={styles.navigationContainer}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Khám phá</Text>
                        {icons.map((icon, index) => (
                            <TouchableOpacity key={index} onPress={() => Linking.openURL(icon.url)}
                                style={styles.navigationItem}>
                                <Ionicons name={icon.w} size={20} color="black" />
                                <Text style={styles.navigationItemText}>{icon.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Modal>
            )}
            {showProfile && (
                <ProfilePage
                    userProfile={userProfile}
                    onClose={onCloseProfile}
                    profile={profile}
                    SOCIAL_CONFIG={SOCIAL_CONFIG}
                    navigation={navigation}
                    onUpdateAvatar={onUpdateAvatar}
                    onUpdateCover={onUpdateCover}
                />
            )}
        </View>
    );
};


export default memo(SocialDashboard);
