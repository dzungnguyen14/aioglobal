import React , { useEffect, useRef, useState, useCallback, memo } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Text, Linking, Alert, AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
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
import { USER_TOKEN_KEY } from '../../../shared/constant';
import { Ionicons } from '@expo/vector-icons';
import { useGlobal } from '../../../state/global';
import { Modal } from 'react-native-paper';

const PAGE_LIMIT = 11;
const MAX_PAGE = 20;

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

    const [data, setData] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // Refs, not state: read from scroll/focus/AppState callbacks, which would otherwise see stale values.
    const tokenRef = useRef(profile?.token);
    tokenRef.current = profile?.token;
    const pageRef = useRef(1);
    const hasMoreRef = useRef(true);
    const loadingRef = useRef(false);
    const requestIdRef = useRef(0);
    const dataCountRef = useRef(0);
    dataCountRef.current = data.length;
    const configLoadedRef = useRef(false);

    const loadPage = useCallback(async (page) => {
        const token = tokenRef.current;
        if (!token) return;
        const requestId = ++requestIdRef.current;
        loadingRef.current = true;
        setLoadError(false);

        const params = { page, limit: PAGE_LIMIT };
        let response = await getSocialsPosts(params, token);
        // One retry: the first request on a cold or just-resumed connection often fails on Android.
        if (!Array.isArray(response?.data) && requestId === requestIdRef.current) {
            response = await getSocialsPosts(params, token);
        }
        // A newer request (pull-to-refresh, refocus) replaced this one: drop the result.
        if (requestId !== requestIdRef.current) return;

        loadingRef.current = false;
        const posts = Array.isArray(response?.data) ? response.data : null;
        if (posts) {
            pageRef.current = page;
            hasMoreRef.current = posts.length > 0 && page < MAX_PAGE;
            setData(prev => (page > 1 ? prev.concat(posts) : posts));
        } else if (page === 1) {
            setLoadError(true);
        }
        setInitialLoading(false);
        setRefreshing(false);
    }, []);

    const loadMore = () => {
        if (loadingRef.current || !hasMoreRef.current || dataCountRef.current === 0) return;
        loadPage(pageRef.current + 1);
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
        if (isBottom) {
            loadMore();
        }
    };
    const onSaveDraft = (item) => {
        setShowForm(false);
        setDraft(item);
    }

    const configLoadingRef = useRef(false);
    const onGetConfig = async () => {
        if (!tokenRef.current || configLoadingRef.current) return;
        configLoadingRef.current = true;
        const response = await getConfigSocial(tokenRef.current);
        configLoadingRef.current = false;
        // A failed request must not wipe the config (url '' breaks likes/delete); retried on next focus.
        if (!response?.api_url && !response?.user) return;
        configLoadedRef.current = true;
        if (response.status) {
            await setItem('SOCIAL_API_URL', response.api_url);
        }
        if (response.user) {
            await setItem('SOCIAL_USER', JSON.stringify(response.user));
        }
        if (response.icons) {
            setIcons(response.icons);
        }
        SET_SOCIAL_CONFIG(prev => ({ url: response.api_url || prev.url, user: response.user || prev.user }));
    }

    // Config and first page in parallel, as soon as the token is known (not only on first mount).
    useEffect(() => {
        if (!profile?.token) return;
        onGetConfig();
        if (dataCountRef.current === 0) loadPage(1);
    }, [profile?.token]);

    // Retry what failed when the tab is shown again or the app comes back to the foreground,
    // instead of leaving an empty feed until the user switches around.
    const reloadIfEmpty = useCallback(() => {
        if (!configLoadedRef.current) onGetConfig();
        if (dataCountRef.current === 0 && !loadingRef.current) loadPage(1);
    }, [loadPage]);

    useFocusEffect(reloadIfEmpty);

    useEffect(() => {
        const sub = AppState.addEventListener('change', (next) => {
            if (next === 'active') reloadIfEmpty();
        });
        return () => sub.remove();
    }, [reloadIfEmpty]);

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

    // Pull-to-refresh, after posting and after deleting. Keeps the current list on screen until
    // page 1 arrives (it used to clear it and fire two overlapping requests).
    const loadFirst = () => {
        setShowForm(false);
        setDraft({});
        setRefreshing(true);
        hasMoreRef.current = true;
        loadPage(1);
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

    const saveUploadedImage = async (response, field) => {
        const { image, result, msg } = response;
        if (!result) {
            Alert.alert('Lỗi', msg || 'Không thể cập nhật ảnh. Vui lòng thử lại.');
            return false;
        }
        const newProfile = { ...profile, [field]: image };
        dispatch({ type: 'SET_PROFILE', payload: newProfile });
        await setItem(USER_TOKEN_KEY, JSON.stringify(newProfile));
        // Lấy lại SOCIAL_CONFIG.user để mở lại profile thấy ảnh mới
        onGetConfig();
        return true;
    }

    const onUpdateAvatar = async (file) => saveUploadedImage(await uploadAvatar(file, profile.token), 'avatar');
    const onUpdateCover = async (file) => saveUploadedImage(await uploadCover(file, profile.token), 'coverPhoto');

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
                <RefreshControl refreshing={refreshing} onRefresh={loadFirst} />
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
                {data.length === 0 && initialLoading && (
                    <ActivityIndicator size="large" color="#3f85ca" style={{ marginVertical: 40 }} />
                )}
                {data.length === 0 && !initialLoading && loadError && (
                    <View style={{ alignItems: 'center', marginVertical: 40 }}>
                        <Text style={{ color: 'gray', marginBottom: 12 }}>Không tải được bài viết</Text>
                        <TouchableOpacity onPress={() => { setInitialLoading(true); loadPage(1); }}>
                            <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
