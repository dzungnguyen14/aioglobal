import { makeRequest } from "../../../fetcher/api";

const API_HOST = "https://aioglobal.com.vn";

export const resolveAvatarUri = (avtar) => {
    if (!avtar) return '';
    if (avtar.indexOf('http') > -1 || avtar.indexOf('app.aioglobal.org') > -1) {
        return avtar;
    }
    return `${API_HOST}${avtar}`;
};

export const resolveVideoUri = (item) => {
    if (item.video_location) {
        const path = item.video_location.startsWith('http')
            ? item.video_location
            : `${API_HOST}${item.video_location}`;
        return { videoUri: path, isYoutube: false };
    }
    if (item.code) {
        return {
            videoUri: `https://www.youtube.com/embed/${item.code}?autoplay=1&mute=0&controls=0&playsinline=1&loop=1&rel=0`,
            isYoutube: true,
        };
    }
    return { videoUri: null, isYoutube: false };
};

export const mapApiCommentToComment = (item) => ({
    id: String(item.comment_id),
    name: item.displayname || item.username || 'User',
    avatar: resolveAvatarUri(item.avtar),
    text: item.message || item.body || '',
    likes: item.like_count ?? 0,
    time: item.created_at || '',
    replies: item.replies?.reply ?? [],
    repliesHasMore: !!item.replies?.pagging,
});

export const mapApiReelToReel = (item) => {
    const { videoUri, isYoutube } = resolveVideoUri(item);
    const username = item.username || item.user_username;
    return {
        id: String(item.reel_id),
        videoUri,
        isYoutube,
        thumbnail: item.image
            ? (item.image.startsWith('http') ? item.image : `${API_HOST}${item.image}`)
            : null,
        user: {
            id: item.owner_id,
            name: item.displayname || item.user_displayname,
            username: username ? `@${username}` : '',
            avatar: resolveAvatarUri(item.avtar),
            isFollowing: !!item.follower_id,
        },
        title: item.title || '',
        caption: item.description || item.title || '',
        likes: item.like_count ?? 0,
        dislikes: item.dislike_count ?? 0,
        viewCount: item.view_count ?? 0,
        commentCount: item.comment_count ?? 0,
        shares: 0,
        isLiked: item.like_dislike === 'like',
        isDisliked: item.like_dislike === 'dislike',
        comments: [],
        commentsPage: 0,
        commentsHasMore: false,
    };
};

/** @deprecated use mapApiReelToReel */
export const mapApiVideoToReel = mapApiReelToReel;

export const fetchReels = (page, limit, options = {}, token = null) => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });
    if (options.email) params.append('email', options.email);
    if (options.sort) params.append('sort', options.sort);
    if (options.user_id) params.append('user_id', String(options.user_id));
    if (options.q) params.append('q', options.q);
    return makeRequest('get', `${API_HOST}/api/reels/public?${params}`, null, token);
};

export const fetchReelComments = (reelId, page = 1, search = 'newest') => {
    const formData = new FormData();
    formData.append('page', String(page));
    formData.append('approved', 'approved');
    formData.append('search', search);
    return makeRequest('post', `${API_HOST}/api/comments/${reelId}/reels`, formData, null, 0, true);
};

export const createReelComment = ({ reelId, message, email, parentId }, token) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('id', String(reelId));
    formData.append('type', 'reels');
    formData.append('message', message);
    if (parentId) formData.append('parent_id', String(parentId));
    return makeRequest('post', `${API_HOST}/api/comments/create_app`, formData, token, 0, true);
};

export const fetchReelReplies = (reelId, commentId, page = 2) => {
    const formData = new FormData();
    formData.append('comment_id', String(commentId));
    formData.append('page', String(page));
    return makeRequest('post', `${API_HOST}/api/replies/${reelId}/reels`, formData);
};

export const likeReel = ({ reelId, action, email }, token) => {
    const formData = new FormData();
    formData.append('type', 'reels');
    formData.append('id', String(reelId));
    formData.append('action', action);
    if (email) formData.append('email', email);
    const url = email ? `${API_HOST}/api/likes_app` : `${API_HOST}/api/likes`;
    return makeRequest('post', url, formData, token, 0, true);
};

export const uploadReelVideo = async ({ video, email }, token) => {
    const formData = new FormData();
    if (email) formData.append('email', email);

    const fileExtension = video.uri.split('.').pop() || 'mp4';
    const mimeType = video.mimeType || `video/${fileExtension}`;
    const fileName = video.fileName || `video_${Date.now()}.${fileExtension}`;
    formData.append('upload', {
        uri: video.uri,
        type: mimeType,
        name: `${Date.now()}_${fileName}`,
    });

    const url = `${API_HOST}/api/reels/upload_app`;
    return makeRequest('post', url, formData, token, 0, true);
};

export const createReel = async ({ id, title, description, privacy, duration, email, fromEdit }, token) => {
    const formData = new FormData();
    if (email) formData.append('email', email);
    if (id) formData.append('id', String(id));
    formData.append('title', title);
    formData.append('description', description || '');
    formData.append('privacy', privacy || 'everyone');
    if (duration) formData.append('duration', duration);
    if (fromEdit) formData.append('fromEdit', '1');

    const url = `${API_HOST}/api/reels/create_app`;
    return makeRequest('post', url, formData, token, 0, true);
};

export const deleteReel = ({ reelId, email }, token) => {
    const formData = new FormData();
    if (email) formData.append('email', email);
    return makeRequest('post', `${API_HOST}/api/reels/delete/${reelId}`, formData, token, 0, true);
};

export const publishReel = async ({ video, title, description, isPrivate, email }, token) => {
    const uploadResponse = await uploadReelVideo({ video, email }, token);
    if (uploadResponse?.error || uploadResponse?.success === false) {
        return uploadResponse;    
    }

    const reelId = uploadResponse?.id;
    if (!reelId) {
        return { error: [{ message: 'Upload thành công nhưng không nhận được reel_id' }] };
    }

    return createReel({
        id: reelId,
        title: title || 'Untitled',
        description,
        privacy: isPrivate ? 'onlyme' : 'everyone',
        email,
    }, token);
};

