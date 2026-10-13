import { Dimensions, Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  time: {
    fontSize: 18,
    textAlign: 'center',
    color: '#007AFF',
    marginVertical: 8,
  },
  postContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 10,
    backgroundColor: "#fff",
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  username: {
    fontWeight: '600',
    fontSize: 16,
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 17,
    marginTop: 5,
  },
  content: {
    fontSize: 15,
    color: '#333',
    marginVertical: 4,
  },
  postImage: {
    width: '100%',
    height: 600,
    objectFit: 'contain',
    borderRadius: 10,
    marginTop: 8,
  },
  actions: {
    maxWidth: '180',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
    backgroundColor: '#f5f5f5',
    padding: 5,
    borderRadius: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
  likeCount: {
    color: 'red',
    fontSize: 14,
  },
  sponsoredContainer: {
    marginTop: 20,
  },
  // Modal Detail Form

  centeredView: {
    flex: 1,
    backgroundColor: '#fff'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  postDetailContainer: {
    padding: 10,
  },
  headerDetailButton: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
    flexDirection: 'row',
  },
  headerDetailForm: {
    flexDirection: 'row',
    backgroundColor: '#1976D2',
    padding: 10,
    paddingTop: 50,
    alignItems: 'center',
    marginBottom: 10,
    gap: 10
  },
  headerDetailText: {
    color: '#fff',
    fontSize: 16
  },
  actionContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  actionContainerModal: {
    position: 'absolute',
    top: Dimensions.get('screen').height * 0.5,
    left: 0,
    flex: 1,
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height * 0.5,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  commentContainer: {
    padding: 10,
    marginVertical: 10,
    flexDirection: 'row'
  },
  avatarComment: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  commentInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 5

  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  commentsSection: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f9f9f9',

  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentInputContainer: {
    position: 'relative',
  },
  uploadImageButton: {
    position: 'absolute',
    right: 50,
    bottom: 10,
    padding: 10,
    borderRadius: 20,
  },
  commentButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    padding: 10,
    borderRadius: 20,
  },
  // Link Preview Styles
  linkPreviewsContainer: {
    marginVertical: 10,
  },
  linkPreviewContainer: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  linkPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  linkPreviewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f7f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkPreviewText: {
    flex: 1,
  },
  linkPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1d',
    marginBottom: 2,
  },
  linkPreviewDescription: {
    fontSize: 12,
    color: '#536471',
    marginBottom: 2,
  },
  linkPreviewUrl: {
    fontSize: 11,
    color: '#1d9bf0',
  },
  linkPreviewAction: {
    marginLeft: 8,
  },
  linkPreviewLoading: {
    padding: 15,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  commentImage: {
    width: 50,
    height: 50,
    objectFit: 'cover',
    marginTop: 5,
    borderRadius: 8,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1, // <-- bắt buộc để full height
    justifyContent: 'center',
    alignItems: 'center',
  },
});
