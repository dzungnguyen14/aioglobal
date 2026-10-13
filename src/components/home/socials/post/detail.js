import React, { use, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, KeyboardAvoidingView, Platform, Linking, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './style';
import { memo } from 'react';
import BottomEmo from './bottom-emo';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { formatDateToTime, getItem } from '../../../../shared/utils';
import { useLang } from '../../../../shared/hooks';
import RenderHTML from 'react-native-render-html';
import VideoPlayerUI from '../videoplayer';
import ImageViewing from 'react-native-image-viewing';
import { fetchSocial } from '../../../../fetcher/api';
import TextField from '../../../textInput';
import { useActionSheet } from '@expo/react-native-action-sheet';
import useConfirmDialog from '../../../confirm';
import { AutoImage } from '../../../images';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';


// Component để hiển thị link preview
const LinkPreview = ({ url }) => {
    const [linkData, setLinkData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        fetchLinkPreview(url);
    }, [url]);

    const fetchLinkPreview = async (url) => {
        try {
            // Tạo preview đơn giản từ URL
            const domain = new URL(url).hostname;
            const title = domain.replace('www.', '');

            setLinkData({
                title: title.charAt(0).toUpperCase() + title.slice(1),
                description: 'Nhấn vào để mở liên kết',
                image: null,
                url: url,
                domain: domain
            });
        } catch (error) {
            setLinkData({
                title: url,
                description: 'Nhấn vào để mở liên kết',
                image: null,
                url: url,
                domain: 'Link'
            });
        } finally {
            setLoading(false);
        }
    };

    const openLink = () => {
        Linking.openURL(url);
    };

    if (loading) {
        return (
            <View style={styles.linkPreviewContainer}>
                <Text style={styles.linkPreviewLoading}>Loading preview...</Text>
            </View>
        );
    }

    return (
        <TouchableOpacity style={styles.linkPreviewContainer} onPress={openLink}>
            <View style={styles.linkPreviewContent}>
                <View style={styles.linkPreviewIconContainer}>
                    <Ionicons name="link" size={24} color="#1d9bf0" />
                </View>
                <View style={styles.linkPreviewText}>
                    <Text style={styles.linkPreviewTitle} numberOfLines={1}>
                        {linkData?.title || linkData?.domain || 'Link'}
                    </Text>
                    <Text style={styles.linkPreviewDescription} numberOfLines={1}>
                        {linkData?.description || 'Click to open link'}
                    </Text>
                    <Text style={styles.linkPreviewUrl} numberOfLines={1}>
                        {url}
                    </Text>
                </View>
                <View style={styles.linkPreviewAction}>
                    <Ionicons name="chevron-forward" size={16} color="#536471" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const PostDetail = ({ onClose, item, profile, onOpenProfile, social_id }) => {
    const [commentImage, setCommentImage] = React.useState(null);
    const [SOCIAL_CONFIG, SET_SOCIAL_CONFIG] = React.useState({ url: '', user: {} });
    React.useEffect(() => {
        const fetchConfig = async () => {
            const api = await getItem('SOCIAL_API_URL');
            const user = await getItem('SOCIAL_USER');
            SET_SOCIAL_CONFIG({ url: api, user: JSON.parse(user) });
        };
        fetchConfig();
    }, []);

    const confirmDialog = useConfirmDialog();
    const { lang } = useLang();
    const [visible, setIsVisible] = React.useState(false);
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [comments, setComments] = React.useState([]);
    const [commentText, setCommentText] = React.useState('');
    const [extractedLinks, setExtractedLinks] = React.useState([]);
    const MAX_WIDTH = Dimensions.get('window').width;
    const previewImages = React.useMemo(() => item.images.map((image) => ({ uri: image })), [item.images]);

    // Function để extract links từ HTML
    const extractLinksFromHTML = (htmlString) => {
        const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
        const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
        const links = new Set();

        // Extract links từ thẻ <a>
        let match;
        while ((match = linkRegex.exec(htmlString)) !== null) {
            links.add(match[1]);
        }

        // Extract URLs trực tiếp trong text
        const textOnly = htmlString.replace(/<[^>]*>/g, '');
        while ((match = urlRegex.exec(textOnly)) !== null) {
            links.add(match[1]);
        }

        return Array.from(links);
    };

    const removeHTMLTags = (htmlString) => {
        const tagRegex = /<\/?[^>]+(>|$)/g;
        return htmlString.replace(tagRegex, '');
    }
    const replaceURLtoHTMLTag = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, (url) => `<a href="${removeHTMLTags(url)}" target="_blank">${url}</a>`);
    };

    const previewDescription = React.useMemo(() => {
        if (!item.description) return '';
        const test_description = replaceURLtoHTMLTag(item.description);
        const links = extractLinksFromHTML(test_description);
        setExtractedLinks(links);
        return test_description
    }, [item.description]);

    const loadComments = async () => {
        const { comments } = await fetchSocial(`${SOCIAL_CONFIG.url}/comments/${item.blog_id}/blogs`, {
            page: 1,
            search: 'newest',
            approved: 'approved'
        }, profile?.token);
        setComments(comments);
    };
    const openImage = (index) => {
        setCurrentIndex(index);
        setIsVisible(true);
    };

    const sendComment = async () => {
        console.log('Sending comment:', commentText, commentImage);
        if (commentText.trim() === '' && !commentImage) return;
        const response = await fetchSocial(`${SOCIAL_CONFIG.url}/comments/create_app`, {
            message: commentText,
            id: item.blog_id,
            type: 'blogs',
            email: profile?.email,
            image: commentImage,
        }, profile?.token, 'post', 10000, true);
        setCommentText('');
        loadComments();
        setCommentImage(null)
    };

    const { showActionSheetWithOptions } = useActionSheet();
    const openActionSheet = (comment) => {
        const options = ['Xoá bình luận', 'Đóng'];
        const cancelButtonIndex = 1;
        showActionSheetWithOptions(
            {
                options,
                cancelButtonIndex,
            },
            async (selectedIndex) => {
                switch (selectedIndex) {
                    case 0:
                        confirmDialog('Xoá bình luận', 'Bạn có chắc chắn muốn xoá bình luận này?', async () => {
                            const resp = await fetchSocial(`${SOCIAL_CONFIG.url}/comments/delete_app`, {
                                comment_id: comment.comment_id,
                                reply_id: 0,
                                id: comment.id,
                                type: 'blogs',
                                email: profile?.email,
                            }, profile?.token, 'post', 10000, true);
                            loadComments();
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

    const openImagePicker = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });
        if (!result.canceled) {
            setCommentImage(result.assets[0].uri);
        }
    }

    useEffect(() => {
        if (!SOCIAL_CONFIG.url || !SOCIAL_CONFIG.user) return;
        loadComments();
    }, [SOCIAL_CONFIG]);

    return (
        <SafeAreaProvider>
            <SafeAreaView >
                <Modal
                    animationType="fade"
                    transparent={false}
                    visible
                    statusBarTranslucent
                    onRequestClose={onClose}>
                    <View style={[styles.centeredView, { paddingBottom: 60, flex: 1 }]}>
                        <View style={styles.headerDetailForm}>
                            <TouchableOpacity style={styles.headerDetailButton} onPress={onClose}>
                                <Ionicons name="chevron-back" size={20} color="#fff" style={styles.searchIcon} />
                                <Text style={styles.headerDetailText}>Quay lại</Text>
                            </TouchableOpacity>
                        </View>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={'padding'}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                        >
                            <ScrollView style={styles.postDetailContainer}>
                                <TouchableOpacity style={styles.userInfo} onPress={() => onOpenProfile({ user_id: item.owner_id, avatar: item.avtar, username: item.title })}>
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
                                </TouchableOpacity>
                                {item.video && (
                                    <VideoPlayerUI uri={item.video} isPlay={true} />
                                )}
                                <View style={{ marginVertical: 10 }}>
                                    <RenderHTML
                                        contentWidth={MAX_WIDTH}
                                        source={{ html: previewDescription }}
                                    />
                                </View>

                                {/* Link Previews */}
                                {extractedLinks.length > 0 && (
                                    <View style={styles.linkPreviewsContainer}>
                                        {extractedLinks.map((link, index) => (
                                            <LinkPreview key={index} url={link} />
                                        ))}
                                    </View>
                                )}
                                <ImageViewing
                                    images={previewImages}
                                    imageIndex={currentIndex}
                                    visible={visible}
                                    onRequestClose={() => setIsVisible(false)}
                                    swipeToCloseEnabled
                                    doubleTapToZoomEnabled
                                />
                                {item.images.map((image, idx) => (
                                    <TouchableOpacity onPress={() => openImage(idx)} key={image} style={{ marginBottom: 5 }}>
                                        <AutoImage uri={image} />
                                    </TouchableOpacity>
                                ))}
                                <BottomEmo item={{ ...item, comment_count: comments.length }} hideComment={false} onClickComment={() => { }} profile={profile}  social_id={social_id}/>
                                <View style={styles.commentsSection}>
                                    {comments.map((comment, index) => {
                                        return (
                                            <View key={index} style={styles.commentItem}>
                                                {comment.avatar && (
                                                    <Image
                                                        source={{ uri: comment.avatar.indexOf('app.aioglobal.org') > -1 ? comment.avatar : "https://aioglobal.com.vn" + comment.avatar }}
                                                        style={styles.commentAvatar}
                                                    />
                                                )}
                                                <View style={styles.commentContent}>
                                                    <Text style={styles.commentUsername}>{comment.displayname}</Text>
                                                    <Text style={styles.commentText}>{comment.message}</Text>
                                                    <Text style={styles.commentTime}>{formatDateToTime(comment.creation_date, lang)}</Text>
                                                </View>
                                                {SOCIAL_CONFIG.user && SOCIAL_CONFIG.user.user_id === comment.owner_id && (
                                                    <View style={{ flex: 0.1 }}>
                                                        <TouchableOpacity onPress={() => openActionSheet(comment)}>
                                                            <Ionicons name="ellipsis-horizontal" size={20} color="black" />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </View>
                                        )
                                    })}
                                    <View style={[styles.commentInputContainer, { marginBottom: 10 }]}>
                                        <TextField
                                            label={''}
                                            value={commentText}
                                            onChange={(value) => setCommentText(value.toLowerCase())}
                                            placeholder={'Viết bình luận...'}
                                        />
                                        <TouchableOpacity
                                            style={styles.uploadImageButton}
                                            onPress={openImagePicker}>
                                            <Ionicons name="image" size={24} color={'#007AFF'} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.commentButton}
                                            onPress={sendComment}>
                                            <Ionicons name="send" size={24} color={"#007AFF"} />
                                        </TouchableOpacity>
                                        {commentImage && (
                                            <View style={{ position: 'relative', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                                                <Image
                                                    source={{ uri: commentImage }}
                                                    style={styles.commentImage}
                                                />
                                                <Ionicons name="close-circle" size={24} color="red" onPress={() => setCommentImage(null)}
                                                    style={{ position: 'absolute', left: 40, top: 0 }} />
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </Modal>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default memo(PostDetail);
