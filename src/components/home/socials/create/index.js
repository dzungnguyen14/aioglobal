import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RichEditor } from 'react-native-pell-rich-editor';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import styles from "./style";
import { fetchSocial } from "../../../../fetcher/api";
import { getItem, } from "../../../../shared/utils";
import { Image } from "expo-image";
import { useGlobal } from "../../../../state/global";
import { AccountImage, CustomImage } from "../../../images";

const PRIVACY_OPTIONS = [
    { value: false, icon: 'people', label: 'Tất cả bạn bè', description: 'Mọi người đều có thể xem bài viết này' },
    { value: true, icon: 'lock-closed', label: 'Chỉ mình tôi', description: 'Chỉ bạn mới xem được bài viết này' },
];

// Facebook phóng to chữ khi bài viết ngắn và không có ảnh/video
const LARGE_TEXT_LIMIT = 85;

const stripHtml = (html) => (html ?? '')
    .replace(/<(.|\n)*?>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

const formatDuration = (ms) => {
    if (!ms) return null;
    const total = Math.round(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const VideoThumb = React.memo(({ uri }) => {
    const player = useVideoPlayer({ uri }, p => {
        p.loop = false;
        p.muted = true;
    });
    return (
        <VideoView
            player={player}
            style={styles.mediaFill}
            contentFit="cover"
            nativeControls={false}
        />
    );
});

const MediaTile = React.memo(({ media, style, onRemove, disabled }) => (
    <View style={[styles.mediaTile, style]}>
        {media.type === 'video'
            ? <VideoThumb uri={media.uri} />
            : <Image source={{ uri: media.uri }} style={styles.mediaFill} contentFit="cover" transition={150} />}
        {media.type === 'video' && (
            <View style={styles.videoOverlay} pointerEvents="none">
                <View style={styles.playCircle}>
                    <Ionicons name="play" size={22} color="#fff" style={{ marginLeft: 3 }} />
                </View>
                {!!formatDuration(media.duration) && (
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{formatDuration(media.duration)}</Text>
                    </View>
                )}
            </View>
        )}
        {!disabled && (
            <TouchableOpacity style={styles.removeButton} onPress={onRemove} hitSlop={8}>
                <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
        )}
    </View>
));

const MediaGrid = ({ media, onRemove, disabled }) => {
    if (media.length === 0) return null;

    if (media.length === 1) {
        const item = media[0];
        const ratio = item.width && item.height ? item.width / item.height : 4 / 3;
        return (
            <View style={styles.mediaGrid}>
                <MediaTile
                    media={item}
                    disabled={disabled}
                    onRemove={() => onRemove(item)}
                    style={{ width: '100%', aspectRatio: Math.min(Math.max(ratio, 0.8), 1.9) }}
                />
            </View>
        );
    }

    // Số lẻ: ô đầu tiên chiếm cả hàng, còn lại chia 2 cột
    const isOdd = media.length % 2 === 1;
    return (
        <View style={[styles.mediaGrid, styles.mediaGridWrap]}>
            {media.map((item, index) => (
                <MediaTile
                    key={`${item.type}_${item.uri}_${item.index}`}
                    media={item}
                    disabled={disabled}
                    onRemove={() => onRemove(item)}
                    style={isOdd && index === 0 ? styles.mediaTileFull : styles.mediaTileHalf}
                />
            ))}
        </View>
    );
};

const PrivacySheet = ({ visible, value, onSelect, onClose }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
        <Pressable style={styles.sheetBackdrop} onPress={onClose}>
            <Pressable style={styles.sheet}>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Ai có thể xem bài viết của bạn?</Text>
                {PRIVACY_OPTIONS.map(option => {
                    const selected = option.value === value;
                    return (
                        <TouchableOpacity key={option.label} style={styles.sheetOption} onPress={() => onSelect(option.value)}>
                            <View style={[styles.sheetOptionIcon, selected && styles.sheetOptionIconActive]}>
                                <Ionicons name={option.icon} size={20} color={selected ? '#0866FF' : '#050505'} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sheetOptionLabel}>{option.label}</Text>
                                <Text style={styles.sheetOptionDesc}>{option.description}</Text>
                            </View>
                            <Ionicons
                                name={selected ? 'radio-button-on' : 'radio-button-off'}
                                size={22}
                                color={selected ? '#0866FF' : '#BCC0C4'}
                            />
                        </TouchableOpacity>
                    );
                })}
            </Pressable>
        </Pressable>
    </Modal>
);

const PostCreate = ({ onClose, item, onSuccess }) => {
    const [SOCIAL_CONFIG, SET_SOCIAL_CONFIG] = React.useState({ url: '', user: {} });
    React.useEffect(() => {
        const fetchConfig = async () => {
            const api = await getItem('SOCIAL_API_URL');
            const user = await getItem('SOCIAL_USER');
            let parsedUser = {};
            try {
                parsedUser = user ? JSON.parse(user) : {};
            } catch (error) {
                console.warn('Failed to parse SOCIAL_USER from storage', error);
            }
            SET_SOCIAL_CONFIG({ url: api || '', user: parsedUser });
        };
        fetchConfig();
    }, []);

    const { state } = useGlobal();
    const { profile } = state;
    const [isSubmit, setIsSubmit] = React.useState(false);
    const [showPrivacy, setShowPrivacy] = React.useState(false);
    const [formItem, setFormItem] = React.useState({
        title: item.title ?? profile.fullname ?? '',
        images: item.images ?? [],
        videos: item.video ?? [],
        description: item.content ?? '',
        privacy: false
    });

    const richText = React.useRef(null);

    const onSelectPrivacy = React.useCallback((privacy) => {
        setFormItem(prev => ({ ...prev, privacy }));
        setShowPrivacy(false);
    }, []);

    const plainText = React.useMemo(() => stripHtml(formItem.description), [formItem.description]);
    const allowSubmit = plainText !== '';
    const canPost = allowSubmit && !!SOCIAL_CONFIG.url && !isSubmit;

    const pickImage = React.useCallback(async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.5,
        });
        if (!result.canceled) {
            setFormItem(prev => ({ ...prev, images: [...prev.images, ...result.assets] }));
        }
    }, []);
    const pickVideo = React.useCallback(async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsMultipleSelection: true,
            quality: 0.5,
        });
        if (!result.canceled) {
            setFormItem(prev => ({ ...prev, videos: [...prev.videos, ...result.assets] }));
        }
    }, []);

    const removeMedia = React.useCallback((media) => {
        const key = media.type === 'video' ? 'videos' : 'images';
        setFormItem(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== media.index) }));
    }, []);

    const onSubmit = React.useCallback(async () => {
        if (!allowSubmit || isSubmit || !SOCIAL_CONFIG.url) {
            return;
        }

        let data = new FormData();
        data.append('description', formItem.description);
        data.append('privacy', formItem.privacy ? 'private' : 'everyone');
        data.append('draft', '1');
        data.append('title', profile.fullname);
        data.append('email', profile.email);
        formItem.images.forEach((item, index) => {
            const fileExtension = item.uri.split('.').pop();
            const extension = `image/${fileExtension}`;
            const fileName = item.fileName || `image_${index}.${fileExtension}`;
            data.append(`image`, {
                uri: item.uri,
                type: extension,
                name: `${new Date().getTime()}_${fileName}`,
            });
        });
        formItem.videos.forEach((item, index) => {
            const fileExtension = item.uri.split('.').pop();
            const extension = `video/${fileExtension}`;
            const fileName = item.fileName || `video_${index}.${fileExtension}`;
            data.append(`video`, {
                uri: item.uri,
                type: extension,
                name: `${new Date().getTime()}_${fileName}`,
            });
        });

        if (item.blog_id) {
            data.append('id', item.blog_id);
        }
        setIsSubmit(true);
        try {
            await fetchSocial(
                `${SOCIAL_CONFIG.url}/blogs/create_app`,
                data,
                profile.token,
                'post',
                true,
            );
            Alert.alert("Thành công", "Bài viết đã được tạo thành công");
            onSuccess?.();
        } catch (err) {
            console.error("Error", err);
            Alert.alert("Lỗi", "Không thể tạo bài viết. Vui lòng thử lại.");
        } finally {
            setIsSubmit(false);
        }
    }, [SOCIAL_CONFIG.url, allowSubmit, formItem, isSubmit, item.blog_id, onSuccess, profile.email, profile.fullname, profile.token]);

    const onExit = React.useCallback(() => {
        onClose(formItem);
    }, [formItem, onClose]);

    const media = React.useMemo(() => [
        ...formItem.videos.map((v, index) => ({ ...v, type: 'video', index })),
        ...formItem.images.map((img, index) => ({ ...img, type: 'image', index })),
    ], [formItem.images, formItem.videos]);

    const largeText = media.length === 0 && plainText.length < LARGE_TEXT_LIMIT;
    const editorStyle = React.useMemo(() => ({
        color: '#050505',
        placeholderColor: '#65676B',
        caretColor: '#0866FF',
        contentCSSText: largeText
            ? 'font-size: 24px; line-height: 1.3; padding: 0;'
            : 'font-size: 16px; line-height: 1.4; padding: 0;',
    }), [largeText]);

    const privacyOption = PRIVACY_OPTIONS.find(o => o.value === formItem.privacy) ?? PRIVACY_OPTIONS[0];
    const displayName = profile.fullname || SOCIAL_CONFIG.user?.name || 'Bạn';

    return (
        <Modal
            animationType="slide"
            transparent={false}
            statusBarTranslucent
            visible
            onRequestClose={onExit}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerSide} onPress={onExit} hitSlop={10}>
                        <Ionicons name="close" size={28} color="#050505" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{item.blog_id ? 'Chỉnh sửa bài viết' : 'Tạo bài viết'}</Text>
                    <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>
                        <TouchableOpacity
                            style={[styles.postButton, !canPost && styles.postButtonDisabled]}
                            onPress={onSubmit}
                            disabled={!canPost}>
                            {isSubmit
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Text style={[styles.postButtonText, !canPost && styles.postButtonTextDisabled]}>
                                    {item.blog_id ? 'Lưu' : 'Đăng'}
                                </Text>}
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}>
                    {/* Thông tin người đăng */}
                    <View style={styles.authorRow}>
                        {profile.avatar
                            ? <CustomImage source={{ uri: profile.avatar }} style={styles.avatar} />
                            : <CustomImage source={AccountImage} style={styles.avatar} />}
                        <View style={styles.authorInfo}>
                            <Text style={styles.authorName} numberOfLines={1}>{displayName}</Text>
                            <TouchableOpacity
                                style={styles.privacyChip}
                                onPress={() => setShowPrivacy(true)}
                                disabled={isSubmit}>
                                <Ionicons name={privacyOption.icon} size={12} color="#0866FF" />
                                <Text style={styles.privacyChipText}>{privacyOption.label}</Text>
                                <Ionicons name="caret-down" size={10} color="#0866FF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Nội dung */}
                    <RichEditor
                        ref={richText}
                        placeholder={`${displayName.split(' ').pop()} ơi, bạn đang nghĩ gì thế?`}
                        style={styles.richEditor}
                        editorStyle={editorStyle}
                        initialHeight={media.length ? 100 : 220}
                        initialContentHTML={formItem.description}
                        disabled={isSubmit}
                        onChange={(value) => {
                            setFormItem(prev => ({ ...prev, description: value }));
                        }}
                    />

                    {/* Ảnh / video đính kèm */}
                    <MediaGrid media={media} onRemove={removeMedia} disabled={isSubmit} />
                </ScrollView>

                {/* Thêm vào bài viết */}
                <View style={styles.footer}>
                    <View style={styles.addBar}>
                        <Text style={styles.addBarLabel}>Thêm vào bài viết của bạn</Text>
                        <View style={styles.addBarIcons}>
                            <TouchableOpacity style={styles.addIcon} onPress={pickImage} disabled={isSubmit} hitSlop={6}>
                                <Ionicons name="images" size={24} color={isSubmit ? '#BCC0C4' : '#45BD62'} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.addIcon} onPress={pickVideo} disabled={isSubmit} hitSlop={6}>
                                <Ionicons name="videocam" size={26} color={isSubmit ? '#BCC0C4' : '#F02849'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>

            <PrivacySheet
                visible={showPrivacy}
                value={formItem.privacy}
                onSelect={onSelectPrivacy}
                onClose={() => setShowPrivacy(false)}
            />
        </Modal>
    );
};

export default PostCreate;
