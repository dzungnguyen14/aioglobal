import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { WebView } from 'react-native-webview';
import styles from './style';
import { formatCount } from './data';
import { likeReel } from './fetcher';

const YoutubePlayer = ({ videoUri, isActive }) => {
  const webViewRef = useRef(null);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          * { margin: 0; padding: 0; }
          html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
          iframe { width: 100%; height: 100%; border: 0; }
        </style>
      </head>
      <body>
        <iframe
          src="${videoUri}"
          allow="autoplay; encrypted-media; fullscreen"
          allowfullscreen
        ></iframe>
      </body>
    </html>
  `;

  useEffect(() => {
    if (!webViewRef.current) return;
    const script = isActive
      ? `document.querySelector('iframe').src = '${videoUri}'; true;`
      : `document.querySelector('iframe').src = 'about:blank'; true;`;
    webViewRef.current.injectJavaScript(script);
  }, [isActive, videoUri]);

  if (!isActive) {
    return <View style={styles.youtubeWebView} />;
  }

  return (
    <WebView
      ref={webViewRef}
      source={{ html }}
      style={styles.youtubeWebView}
      scrollEnabled={false}
      allowsFullscreenVideo
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
    />
  );
};

const Poster = ({ uri }) => (
  uri ? <Image source={{ uri }} style={styles.video} resizeMode="cover" /> : null
);

const NativeVideoPlayer = ({ videoUri, thumbnail, isActive, paused, onTogglePause }) => {
  const pauseScale = useRef(new Animated.Value(0)).current;
  const pauseOpacity = useRef(new Animated.Value(0)).current;
  const [firstFrameReady, setFirstFrameReady] = useState(false);

  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = true;
    p.muted = false;
    // Source files are large: only buffer a few seconds ahead instead of the whole file.
    p.bufferOptions = { preferredForwardBufferDuration: 5 };
  });

  useEffect(() => {
    if (!player) return;
    if (isActive && !paused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, paused, player]);

  const handleVideoPress = () => {
    const nowPaused = !paused;
    onTogglePause(nowPaused);

    if (nowPaused) {
      pauseScale.setValue(0.5);
      pauseOpacity.setValue(1);
      Animated.parallel([
        Animated.spring(pauseScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(pauseOpacity, { toValue: 0, duration: 400, useNativeDriver: true }).start();
        }, 600);
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleVideoPress}>
      <View style={styles.reelContainer}>
        <VideoView
          style={styles.video}
          player={player}
          contentFit="cover"
          nativeControls={false}
          onFirstFrameRender={() => setFirstFrameReady(true)}
        />
        {!firstFrameReady && (
          <View style={styles.video} pointerEvents="none">
            <Poster uri={thumbnail} />
            {isActive && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{ position: 'absolute', alignSelf: 'center', top: '50%' }}
              />
            )}
          </View>
        )}
        <Animated.View
          style={[styles.pauseIconWrap, { opacity: pauseOpacity }]}
          pointerEvents="none"
        >
          <Animated.View
            style={[styles.pauseIconCircle, { transform: [{ scale: pauseScale }] }]}
          >
            <Ionicons name={paused ? 'pause' : 'play'} size={32} color="#fff" />
          </Animated.View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};
const MAX_CAPTION_LINES = 3;
const ReelItem = ({ reel, isActive, shouldLoad = true, profile, onOpenComments }) => {
  const [liked, setLiked] = useState(reel.isLiked);
  const [likeCount, setLikeCount] = useState(reel.likes);
  const [paused, setPaused] = useState(false);
  const [following, setFollowing] = useState(reel?.user?.isFollowing);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [captionLineCount, setCaptionLineCount] = useState(0);
  const [liking, setLiking] = useState(false);

  const caption = reel.caption?.trim() || '';
  const isCaptionTruncatable = captionLineCount > MAX_CAPTION_LINES;
  const commentCount = reel.commentCount ?? reel.comments?.length ?? 0;

  useEffect(() => {
    setLiked(reel.isLiked);
    setLikeCount(reel.likes);
  }, [reel.id, reel.isLiked, reel.likes]);

  useEffect(() => {
    setCaptionExpanded(false);
    setCaptionLineCount(0);
  }, [reel.id, caption]);

  const handleLike = async () => {
    if (liking) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    setLiking(true);

    try {
      const response = await likeReel({
        reelId: reel.id,
        action: 'like',
        email: profile?.email,
      }, profile?.token);

      if (response?.success === false || response?.error) {
        setLiked(wasLiked);
        setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
      }
    } catch (err) {
      console.error('likeReel error:', err);
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    } finally {
      setLiking(false);
    }
  };

  return (
    <View style={styles.reelContainer}>
      {reel.isYoutube ? (
        <YoutubePlayer videoUri={reel.videoUri} isActive={isActive} />
      ) : reel.videoUri && !shouldLoad ? (
        <View style={styles.reelContainer}>
          <Poster uri={reel.thumbnail} />
        </View>
      ) : reel.videoUri ? (
        <NativeVideoPlayer
          videoUri={reel.videoUri}
          thumbnail={reel.thumbnail}
          isActive={isActive}
          paused={paused}
          onTogglePause={setPaused}
        />
      ) : (
        <View style={[styles.reelContainer, { alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name="videocam-off-outline" size={48} color="#555" />
          <Text style={{ color: '#888', marginTop: 8 }}>Video không khả dụng</Text>
        </View>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.gradient}
        pointerEvents="box-none"
      >
        <Text style={styles.username} pointerEvents="none">{reel.user.username}</Text>
        {!!caption && (
          <View pointerEvents="box-none">
            <Text
              style={[styles.caption, styles.captionMeasure]}
              onTextLayout={(e) => setCaptionLineCount(e.nativeEvent.lines.length)}
            >
              {caption}
            </Text>
            <Text
              style={styles.caption}
              numberOfLines={captionExpanded || !isCaptionTruncatable ? undefined : MAX_CAPTION_LINES}
            >
              {caption}
            </Text>
            {isCaptionTruncatable && (
              <TouchableOpacity
                onPress={() => setCaptionExpanded((prev) => !prev)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.captionToggle}>
                  {captionExpanded ? 'Thu gọn' : 'Xem thêm'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </LinearGradient>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => setFollowing((f) => !f)}
        >
          <Image source={{ uri: reel.user.avatar }} style={styles.avatarImg} />
          {!following && (
            <View style={styles.followDot}>
              <Ionicons name="add" size={10} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionIcon} onPress={handleLike}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={26}
              color={liked ? '#FE2C55' : '#fff'}
            />
          </TouchableOpacity>
          <Text style={styles.actionLabel}>{formatCount(likeCount)}</Text>
        </View>

        <View style={styles.actionItem}>
          <TouchableOpacity style={styles.actionIcon} onPress={onOpenComments}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.actionLabel}>{formatCount(commentCount)}</Text>
        </View>
      </View>
    </View>
  );
};

export default React.memo(ReelItem);
