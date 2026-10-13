import { Dimensions, StyleSheet } from 'react-native';

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
    height: 300,
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
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    backgroundColor: '#fff'
  },
  scrollContent: {
    paddingBottom: 40,
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
  leftHeaderDetailButton: {
    alignItems: 'flex-start',
    gap: 4,
  },
  centerHeaderDetailButton: {
    alignItems: 'flex-start',
    gap: 4,
    flexDirection: 'row',
  },
  rightHeaderDetailButton: {
    alignItems: 'flex-end',
    gap: 4,
    flex: 1
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
    fontWeight: 'bold',
    fontSize: 14
  },
  textInput: {
    height: 100,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    padding: 8,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
    paddingHorizontal: 12,
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  textButtonDisabled: {
    backgroundColor: '#f4f4f4',
  },
  textButtonLabel: {
    marginLeft: 6,
    color: '#1f1f1f',
    fontSize: 14,
    fontWeight: '500',
  },
  textButtonLabelDisabled: {
    color: '#999',
  },
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  iconButton: {
    alignItems: 'center',
    padding: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
    paddingHorizontal: 20,
  },
  mediaHeader: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  mediaHeaderText: {
    fontSize: 14,
    color: '#4a4a4a',
    fontWeight: '600',
  },
  emptyMediaText: {
    color: '#7a7a7a',
    fontSize: 13,
    marginBottom: 6,
  },
  imageThumbContainer: {
    position: 'relative',
    height: 120,
    width: Dimensions.get('window').width / 5,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageThumb: {
    height: 120,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    borderRadius: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: 'gray',
    fontSize: 15,
  },
  videoThumbContainer: {
    position: 'relative',
    flex: 1,
    height: 120,
    width: Dimensions.get('window').width / 3,
    marginBottom: 8,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  videoThumb: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  editorCard: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  richEditor: {
    minHeight: 260,
    paddingHorizontal: 10,
  },
});
