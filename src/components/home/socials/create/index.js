import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RichEditor } from 'react-native-pell-rich-editor';
import * as ImagePicker from 'expo-image-picker';
import { useLang, useProfile } from "../../../../shared/hooks";
import VideoPlayerUI from "../videoplayer";
import styles from "./style";
import { fetchSocial } from "../../../../fetcher/api";
import { getItem, } from "../../../../shared/utils";
import { Image } from "expo-image";
import { useGlobal } from "../../../../state/global";

const TextButton = React.memo(({ icon, text, onPress, color, disabled }) => (
    <TouchableOpacity style={[styles.textButton, disabled && styles.textButtonDisabled]} onPress={onPress} disabled={disabled}>
        <Ionicons name={icon} size={18} color={disabled ? '#999' : (color ?? '#000')} />
        <Text style={[styles.textButtonLabel, disabled && styles.textButtonLabelDisabled]}>{text}</Text>
    </TouchableOpacity>
));


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

    const { lang } = useLang();
    const { state } = useGlobal();
    const { profile } = state;
    const [isSubmit, setIsSubmit] = React.useState(false);
    const [formItem, setFormItem] = React.useState({
        title: item.title ?? profile.fullname ?? '',
        images: item.images ?? [],
        videos: item.video ?? [],
        description: item.content ?? '',
        privacy: false
    });

    const richText = React.useRef(null);

    const onChangePrivacy = () => {
        setFormItem(prev => ({ ...prev, privacy: !prev.privacy }));
    };
    const allowSubmit = React.useMemo(() => {
        return formItem.description
            .replace(/<(.|\n)*?>/g, '')
            .replace(/&nbsp;/g, ' ')
            .trim() !== '';
    }, [formItem.description]);

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

    const removeImage = React.useCallback((index) => {
        setFormItem(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    }, []);

    const removeVideo = React.useCallback((index) => {
        setFormItem(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== index) }));
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

    const mediaCount = formItem.images.length + formItem.videos.length;

    if (!formItem) return null;
    return (
        <Modal
            animationType="slide"
            transparent={false}
            statusBarTranslucent
            visible
            onRequestClose={onExit}>
            <View style={[styles.centeredView, { paddingBottom: 50 }]}>
                <View style={[styles.headerDetailForm, { backgroundColor: '#e9e9e9' }]}>
                    <View style={styles.leftHeaderDetailButton}>
                        <Ionicons name="close-outline" size={30} color="gray" style={styles.searchIcon} onPress={onExit} />
                    </View>
                    <TouchableOpacity style={styles.centerHeaderDetailButton} onPress={onChangePrivacy}>
                        <Ionicons name={formItem.privacy ? "lock-closed" : "people"} size={14} color={formItem.privacy ? "#007AFF" : "gray"} />
                        <Text style={[styles.headerText, { color: formItem.privacy ? "#007AFF" : "gray" }]}>{formItem.privacy ? "Chỉ mình tôi" : "Tất cả bạn bè"} ▾</Text>
                    </TouchableOpacity>
                    <View style={styles.rightHeaderDetailButton}>
                        {!isSubmit && (
                            <TouchableOpacity onPress={onSubmit} disabled={!allowSubmit || !SOCIAL_CONFIG.url}>
                                <Ionicons
                                    name="send"
                                    size={30}
                                    color={allowSubmit && SOCIAL_CONFIG.url ? '#007AFF' : 'gray'}
                                    style={styles.searchIcon}
                                />
                            </TouchableOpacity>
                        )}
                        {isSubmit && (
                            <ActivityIndicator size="small" color="#007AFF" />
                        )}
                    </View>
                </View>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
                    <View style={styles.editorCard}>
                        <RichEditor
                            ref={richText}
                            placeholder="Bạn đang nghĩ gì?"
                            style={styles.richEditor}
                            initialHeight={260}
                            initialContentHTML={formItem.description}
                            onChange={(value) => {
                                setFormItem(prev => ({ ...prev, description: value }));
                            }}
                        />
                    </View>
                    <View style={styles.actionRow}>
                        <TextButton icon="videocam" text="Video" onPress={pickVideo} color="#E91E63" disabled={isSubmit} />
                        <TextButton icon="images" text="Ảnh" onPress={pickImage} color="#4CAF50" disabled={isSubmit} />
                    </View>

                    <View style={styles.mediaHeader}>
                        <Text style={styles.mediaHeaderText}>Tệp đính kèm ({mediaCount})</Text>
                    </View>

                    <View style={styles.imageGrid}>
                        {mediaCount === 0 && (
                            <Text style={styles.emptyMediaText}>Chưa có ảnh hoặc video nào được chọn.</Text>
                        )}
                        {formItem.videos.map((item, index) => (
                            <View key={`${item.uri}_${index}`} style={styles.videoThumbContainer}>
                                <TouchableOpacity style={styles.closeButton} onPress={() => removeVideo(index)}>
                                    <Ionicons name="close" size={25} color="#ccc" />
                                </TouchableOpacity>
                                <VideoPlayerUI uri={item.uri} isPlay={true} height={120} />
                            </View>
                        ))}
                        {formItem.images.map((item, index) => (
                            <View key={`${item.uri}_${index}`} style={styles.imageThumbContainer}>
                                <TouchableOpacity style={styles.closeButton} onPress={() => removeImage(index)}>
                                    <Ionicons name="close" size={25} color="#ccc" />
                                </TouchableOpacity>
                                {item.uri && (
                                    <Image
                                        source={{ uri: item.uri }}
                                        style={styles.imageThumb}
                                    />
                                )}

                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

export default PostCreate;  