import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SCREEN_WIDTH_VAL = SCREEN_WIDTH;
export const SCREEN_HEIGHT_VAL = SCREEN_HEIGHT;
export const COMMENTS_PANEL_HEIGHT = SCREEN_HEIGHT * 0.72;

const styles = StyleSheet.create({
  // ── ReelsPage (index) ──────────────────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  pager: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    left: 16,
    zIndex: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    right: 16,
    zIndex: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── ReelItem ───────────────────────────────────────────────────────────────
  reelContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  pauseIconWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Gradient overlay at bottom
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.2,
    justifyContent: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 70 : 70,
    paddingLeft: 16,
    paddingRight: 80,
    backgroundColor: '#00000050',
  },
  followBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  followBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  caption: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.92,
  },
  captionMeasure: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1,
    width: '100%',
  },
  captionToggle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },

  // Right-side action bar
  actionBar: {
    position: 'absolute',
    right: 10,
    bottom: Platform.OS === 'ios' ? 200 : 150,
    alignItems: 'center',
    gap: 20,
  },
  actionItem: {
    alignItems: 'center',
  },
  avatarWrap: {
    marginBottom: 4,
    position: 'relative',
  },
  avatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#fff',
  },
  followDot: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FE2C55',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },

  // ── CommentsPanel ──────────────────────────────────────────────────────────
  commentsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  commentsDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  commentsPanel: {
    height: COMMENTS_PANEL_HEIGHT,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  commentsHandle: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#555',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  commentsTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  commentsLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  commentsEmpty: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 14,
  },
  commentsFooterLoader: {
    paddingVertical: 16,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#444',
  },
  commentBody: {
    flex: 1,
  },
  commentName: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
  commentText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  commentTime: {
    color: '#888',
    fontSize: 11,
  },
  commentReply: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
  },
  commentLikeWrap: {
    alignItems: 'center',
    marginLeft: 8,
  },
  commentLikeCount: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },
  commentsInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#333',
    backgroundColor: '#1a1a1a',
    gap: 10,
  },
  inputAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#555',
  },
  inputBox: {
    flex: 1,
    height: 36,
    backgroundColor: '#2e2e2e',
    borderRadius: 18,
    paddingHorizontal: 14,
    color: '#fff',
    fontSize: 13,
  },
  sendBtn: {
    paddingHorizontal: 4,
  },

  // ── FAB ────────────────────────────────────────────────────────────────────
  fabButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 100,
    left: 20,
    zIndex: 100,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FE2C55',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },

  // ── Loading ──────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 12,
  },
  loadingMoreOverlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },

  // ── Upload modal ───────────────────────────────────────────────────────────
  uploadContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  uploadHeaderSide: {
    width: 40,
    alignItems: 'center',
  },
  uploadHeaderCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  uploadHeaderText: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '600',
  },
  uploadScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  uploadCaptionInput: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#333',
  },
  uploadActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  uploadActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#333',
  },
  uploadActionButtonDisabled: {
    opacity: 0.5,
  },
  uploadActionLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadMediaHeader: {
    marginTop: 20,
    marginBottom: 10,
  },
  uploadMediaHeaderText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
  uploadEmptyMedia: {
    color: '#666',
    fontSize: 13,
    fontStyle: 'italic',
  },
  uploadVideoPreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginTop: 8,
  },
  uploadVideoPlayer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  uploadRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  youtubeWebView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
});

export default styles;
