import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import styles from './style';
import { publishReel } from './fetcher';

const VideoPreview = ({ uri }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = false;
  });

  return (
    <VideoView
      style={styles.uploadVideoPlayer}
      player={player}
      contentFit="cover"
      nativeControls
    />
  );
};

const ReelUpload = ({ visible, onClose, onSuccess, profile }) => {
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [video, setVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allowSubmit = useMemo(
    () => description.trim().length > 0 && video !== null,
    [description, video],
  );

  const pickVideo = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setVideo(result.assets[0]);
    }
  }, []);

  const removeVideo = useCallback(() => {
    setVideo(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!allowSubmit || isSubmitting || !profile?.token) return;

    setIsSubmitting(true);
    try {
      const caption = description.trim();
      const response = await publishReel(
        {
          video,
          description: caption,
          title: caption || profile.fullname || 'Untitled',
          email: profile.email || '',
          isPrivate,
        },
        profile.token,
      );
      if (response?.error) {
        const msg = Array.isArray(response.error)
          ? response.error.map((e) => e.message).join('\n')
          : 'Không thể đăng video. Vui lòng thử lại.';
        Alert.alert('Lỗi', msg);
        return;
      }

      if (response?.success === false) {
        Alert.alert('Lỗi', response.msg || 'Không thể đăng video. Vui lòng thử lại.');
        return;
      }

      setDescription('');
      setVideo(null);
      setIsPrivate(false);
      onSuccess?.(response);
    } catch (err) {
      console.error('Upload reel error:', err);
      Alert.alert('Lỗi', 'Không thể đăng video. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  }, [allowSubmit, description, isPrivate, isSubmitting, onSuccess, profile, video]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    onClose?.();
  }, [isSubmitting, onClose]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.uploadContainer}>
        <View style={styles.uploadHeader}>
          <View style={styles.uploadHeaderSide}>
            <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
              <Ionicons name="close-outline" size={28} color="#ccc" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.uploadHeaderCenter}
            onPress={() => setIsPrivate((prev) => !prev)}
            disabled={isSubmitting}
          >
            <Ionicons
              name={isPrivate ? 'lock-closed' : 'people'}
              size={14}
              color={isPrivate ? '#FE2C55' : '#888'}
            />
            <Text style={[styles.uploadHeaderText, isPrivate && { color: '#FE2C55' }]}>
              {isPrivate ? 'Chỉ mình tôi' : 'Tất cả mọi người'} ▾
            </Text>
          </TouchableOpacity>
          <View style={styles.uploadHeaderSide}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FE2C55" />
            ) : (
              <TouchableOpacity onPress={handleSubmit} disabled={!allowSubmit}>
                <Ionicons
                  name="send"
                  size={26}
                  color={allowSubmit ? '#FE2C55' : '#555'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.uploadScrollContent}
        >
          <TextInput
            style={styles.uploadCaptionInput}
            placeholder="Mô tả video của bạn..."
            placeholderTextColor="#666"
            multiline
            value={description}
            onChangeText={setDescription}
            editable={!isSubmitting}
          />

          <View style={styles.uploadActionRow}>
            <TouchableOpacity
              style={[styles.uploadActionButton, isSubmitting && styles.uploadActionButtonDisabled]}
              onPress={pickVideo}
              disabled={isSubmitting}
            >
              <Ionicons name="videocam" size={18} color="#FE2C55" />
              <Text style={styles.uploadActionLabel}>
                {video ? 'Đổi video' : 'Chọn video'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.uploadMediaHeader}>
            <Text style={styles.uploadMediaHeaderText}>
              Video đã chọn {video ? '(1)' : '(0)'}
            </Text>
          </View>

          {!video && (
            <Text style={styles.uploadEmptyMedia}>Chưa có video nào được chọn.</Text>
          )}

          {video && (
            <View style={styles.uploadVideoPreview}>
              <TouchableOpacity
                style={styles.uploadRemoveButton}
                onPress={removeVideo}
                disabled={isSubmitting}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
              <VideoPreview uri={video.uri} />
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default React.memo(ReelUpload);
