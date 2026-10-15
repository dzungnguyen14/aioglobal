import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles, { COMMENTS_PANEL_HEIGHT, SCREEN_HEIGHT_VAL } from './style';

const CommentRow = React.memo(({ item }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);

  const handleLike = () => {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  return (
    <View style={styles.commentRow}>
      <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentBody}>
        <Text style={styles.commentName}>{item.name}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentMeta}>
          <Text style={styles.commentTime}>{item.time}</Text>
          <TouchableOpacity>
            <Text style={styles.commentReply}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.commentLikeWrap} onPress={handleLike}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={16}
          color={liked ? '#FE2C55' : '#888'}
        />
        <Text style={styles.commentLikeCount}>{likeCount}</Text>
      </TouchableOpacity>
    </View>
  );
});

const CommentsPanel = ({
  visible,
  comments = [],
  commentCount,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  onClose,
  onSendComment,
  sending = false,
}) => {
  const translateY = useRef(new Animated.Value(COMMENTS_PANEL_HEIGHT)).current;
  const [inputText, setInputText] = useState('');
  const [mounted, setMounted] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) Keyboard.dismiss();
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      return;
    }

    Animated.spring(translateY, {
      toValue: COMMENTS_PANEL_HEIGHT,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, translateY]);


  const handleSendComment = async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    const success = await onSendComment?.(text);
    if (success) setInputText('');
  };
  if (!mounted) return null;

  return (
    <View
      style={styles.commentsOverlay}
      pointerEvents={visible ? 'box-none' : 'none'}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.commentsDim,
            {
              opacity: translateY.interpolate({
                inputRange: [0, COMMENTS_PANEL_HEIGHT],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.commentsPanel,
          {
            marginBottom: keyboardHeight,
            height: Math.min(COMMENTS_PANEL_HEIGHT, SCREEN_HEIGHT_VAL - keyboardHeight - 80),
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.commentsHandle}>
          <View style={styles.handleBar} />
        </View>

        {/* Header */}
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>
            {commentCount ?? comments.length} Comments
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Comments list */}
        {loading && comments.length === 0 ? (
          <View style={styles.commentsLoading}>
            <ActivityIndicator size="small" color="#FE2C55" />
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CommentRow item={item} />}
            style={styles.commentsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onEndReached={() => {
              if (hasMore && !loadingMore) onLoadMore?.();
            }}
            onEndReachedThreshold={0.4}
            ListEmptyComponent={(
              <Text style={styles.commentsEmpty}>Chưa có bình luận nào</Text>
            )}
            ListFooterComponent={loadingMore ? (
              <ActivityIndicator size="small" color="#FE2C55" style={styles.commentsFooterLoader} />
            ) : null}
          />
        )}

        {/* Input bar */}
        <View style={styles.commentsInput}>
          <View style={styles.inputAvatar} />
          <TextInput
            style={styles.inputBox}
            placeholder="Add a comment…"
            placeholderTextColor="#666"
            value={inputText}
            onChangeText={setInputText}
            returnKeyType="send"
          />
          {inputText.length > 0 && (
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSendComment}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FE2C55" />
              ) : (
                <Ionicons name="send" size={20} color="#FE2C55" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

export default React.memo(CommentsPanel);
