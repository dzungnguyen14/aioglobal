import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ReelItem from './reel-item';
import CommentsPanel from './comments';
import ReelUpload from './upload';
import styles from './style';
import {
  fetchReels,
  fetchReelComments,
  createReelComment,
  mapApiReelToReel,
  mapApiCommentToComment,
} from './fetcher';
import { useGlobal } from '../../../state/global';

const ReelsPage = ({ navigation }) => {
  const { state } = useGlobal();
  const { profile } = state;

  const [activeIndex, setActiveIndex] = useState(0);
  const [commentsReel, setCommentsReel] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [reels, setReels] = useState([]);
  const [filter, setFilter] = useState({ page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsLoadingMore, setCommentsLoadingMore] = useState(false);
  const [commentSending, setCommentSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const pagerRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const skipNextPageLoadRef = useRef(false);

  const loadReels = useCallback(async (page) => {
    const isFirstPage = page === 1;
    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
      loadingMoreRef.current = true;
    }

    try {
      const response = await fetchReels(page, filter.limit);

      if (response?.success === false) {
        console.error('fetchReels error:', response.msg);
        return;
      }

      const data = response?.data ?? [];
      const totalCount = response?.total ?? 0;

      if (data.length > 0) {
        const mapped = data
          .map(mapApiReelToReel)
          .filter((item) => item.videoUri);

        setReels((prev) => {
          const next = isFirstPage ? mapped : [...prev, ...mapped];
          setHasMore(next.length < totalCount);
          return next;
        });
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('loadReels error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [filter.limit]);

  useEffect(() => {
    if (skipNextPageLoadRef.current) {
      skipNextPageLoadRef.current = false;
      return;
    }
    loadReels(filter.page);
  }, [filter.page]);

  const loadMore = useCallback(() => {
    if (loadingMoreRef.current || !hasMore) return;
    setFilter((prev) => ({ ...prev, page: prev.page + 1 }));
  }, [hasMore]);

  const refreshReels = useCallback(async () => {
    setReels([]);
    setHasMore(true);
    setActiveIndex(0);
    setCommentsReel(null);
    pagerRef.current?.setPage(0);
    skipNextPageLoadRef.current = true;
    setFilter((prev) => ({ ...prev, page: 1 }));
    await loadReels(1);
  }, [loadReels]);

  const handleRefresh = useCallback(async () => {
    if (refreshing || loading) return;
    setRefreshing(true);
    try {
      await refreshReels();
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, loading, refreshReels]);

  const handlePageSelected = useCallback((e) => {
    const position = e.nativeEvent.position;
    setActiveIndex(position);
    setCommentsReel(null);

    const threshold = 2;
    if (position >= reels.length - threshold && hasMore && !loadingMoreRef.current) {
      loadMore();
    }
  }, [reels.length, hasMore, loadMore]);

  const loadReelComments = useCallback(async (reelId, page = 1) => {
    const response = await fetchReelComments(reelId, page);
    if (response?.success === false) {
      console.error('fetchReelComments error:', response.msg);
      return null;
    }
    return {
      comments: (response?.comments ?? []).map(mapApiCommentToComment),
      hasMore: !!response?.pagging,
    };
  }, []);

  const handleOpenComments = useCallback(async (reelId) => {
    setCommentsReel(reelId);
    setCommentsLoading(true);
    try {
      const result = await loadReelComments(reelId, 1);
      if (result) {
        setReels((prev) => prev.map((r) => (
          r.id === reelId
            ? {
              ...r,
              comments: result.comments,
              commentsPage: 1,
              commentsHasMore: result.hasMore,
            }
            : r
        )));
      }
    } catch (err) {
      console.error('loadReelComments error:', err);
    } finally {
      setCommentsLoading(false);
    }
  }, [loadReelComments]);

  const handleLoadMoreComments = useCallback(async () => {
    if (!commentsReel || commentsLoadingMore) return;
    const reel = reels.find((r) => r.id === commentsReel);
    if (!reel?.commentsHasMore) return;

    setCommentsLoadingMore(true);
    try {
      const nextPage = (reel.commentsPage || 1) + 1;
      const result = await loadReelComments(commentsReel, nextPage);
      if (result) {
        setReels((prev) => prev.map((r) => (
          r.id === commentsReel
            ? {
              ...r,
              comments: [...r.comments, ...result.comments],
              commentsPage: nextPage,
              commentsHasMore: result.hasMore,
            }
            : r
        )));
      }
    } catch (err) {
      console.error('loadMoreComments error:', err);
    } finally {
      setCommentsLoadingMore(false);
    }
  }, [commentsReel, commentsLoadingMore, loadReelComments, reels]);

  const handleCloseComments = useCallback(() => {
    setCommentsReel(null);
  }, []);

  const handleSendComment = useCallback(async (message) => {
    if (!commentsReel) return false;
    if (!profile?.email) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để bình luận.');
      return false;
    }

    setCommentSending(true);
    try {
      console.log(JSON.stringify({
        reelId: commentsReel,
        message,
        email: profile.email,
      }))
      const response = await createReelComment({
        reelId: commentsReel,
        message,
        email: profile.email,
      }, profile?.token);

      if (response?.success === false || response?.error) {
        Alert.alert('Lỗi', response?.msg || 'Không thể gửi bình luận');
        return false;
      }

      const result = await loadReelComments(commentsReel, 1);
      if (result) {
        setReels((prev) => prev.map((r) => (
          r.id === commentsReel
            ? {
              ...r,
              comments: result.comments,
              commentsPage: 1,
              commentsHasMore: result.hasMore,
              commentCount: (r.commentCount ?? 0) + 1,
            }
            : r
        )));
      }
      return true;
    } catch (err) {
      console.error('createReelComment error:', err);
      Alert.alert('Lỗi', 'Không thể gửi bình luận');
      return false;
    } finally {
      setCommentSending(false);
    }
  }, [commentsReel, profile?.email, profile?.token, loadReelComments]);

  const handleOpenUpload = useCallback(() => {
    if (!profile?.token) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để đăng tải video.');
      return;
    }
    setShowUpload(true);
  }, [profile?.token]);

  const handleUploadSuccess = useCallback((response) => {
    setShowUpload(false);
    Alert.alert('Thành công', 'Video đã được đăng tải');

    const uploadedReel = response?.editItem ?? response;
    if (uploadedReel?.reel_id) {
      const newReel = mapApiReelToReel(uploadedReel);
      if (newReel.videoUri) {
        setReels((prev) => [newReel, ...prev]);
        setActiveIndex(0);
        pagerRef.current?.setPage(0);
        return;
      }
    }

    refreshReels();
  }, [refreshReels]);

  const activeReel = reels.find((r) => r.id === commentsReel);

  if (loading && reels.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FE2C55" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!loading && reels.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="videocam-off-outline" size={48} color="#555" />
        <Text style={styles.loadingText}>Chưa có video nào</Text>
        <SafeAreaView style={styles.backButton} edges={['top']}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>
        <SafeAreaView style={styles.refreshButton} edges={['top']}>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="refresh" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </SafeAreaView>
        {profile?.token && (
          <TouchableOpacity style={[styles.fabButton, { bottom: 40 }]} onPress={handleOpenUpload}>
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>
        )}
        <ReelUpload
          visible={showUpload}
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
          profile={profile}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        orientation="vertical"
        onPageSelected={handlePageSelected}
        scrollEnabled={commentsReel === null}
        overdrag
      >
        {reels.map((reel, index) => (
          <View key={`${reel.id}_${index}`} collapsable={false}>
            <ReelItem
              reel={reel}
              isActive={index === activeIndex}
              profile={profile}
              onOpenComments={() => handleOpenComments(reel.id)}
            />
          </View>
        ))}
      </PagerView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="#ccc" />
      </TouchableOpacity>

      {commentsReel === null && !showUpload && (
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#ccc" />
          ) : (
            <Ionicons name="refresh" size={24} color="#ccc" />
          )}
        </TouchableOpacity>
      )}

      {commentsReel === null && !showUpload && (
        <TouchableOpacity style={styles.fabButton} onPress={handleOpenUpload}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {loadingMore && (
        <View style={styles.loadingMoreOverlay}>
          <ActivityIndicator size="small" color="#FE2C55" />
        </View>
      )}

      <CommentsPanel
        visible={commentsReel !== null}
        comments={activeReel?.comments ?? []}
        commentCount={activeReel?.commentCount ?? activeReel?.comments?.length ?? 0}
        loading={commentsLoading}
        loadingMore={commentsLoadingMore}
        hasMore={activeReel?.commentsHasMore}
        onLoadMore={handleLoadMoreComments}
        onClose={handleCloseComments}
        onSendComment={handleSendComment}
        sending={commentSending}
      />

      <ReelUpload
        visible={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={handleUploadSuccess}
        profile={profile}
      />
    </View>
  );
};

export default ReelsPage;
