import { Platform, StatusBar, StyleSheet } from 'react-native';

const TOP_INSET = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 24);
const BOTTOM_INSET = Platform.OS === 'ios' ? 28 : 12;
const GAP = 4;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: TOP_INSET + 6,
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CED0D4',
    backgroundColor: '#fff',
  },
  headerSide: {
    width: 80,
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#050505',
  },
  postButton: {
    minWidth: 64,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#0866FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#E4E6EB',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: '#BCC0C4',
  },

  scrollContent: {
    paddingBottom: 24,
  },

  // Author
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E4E6EB',
  },
  authorInfo: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 4,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#050505',
  },
  privacyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#EBF5FF',
  },
  privacyChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0866FF',
  },

  // Editor
  richEditor: {
    marginHorizontal: 12,
    minHeight: 100,
  },

  // Media
  mediaGrid: {
    marginTop: 8,
  },
  mediaGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: GAP,
  },
  mediaTile: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F0F2F5',
  },
  mediaTileFull: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  mediaTileHalf: {
    width: '49.6%',
    aspectRatio: 1,
  },
  mediaFill: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer "Thêm vào bài viết của bạn"
  footer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: BOTTOM_INSET,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CED0D4',
  },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CED0D4',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 1, backgroundColor: '#fff' },
    }),
  },
  addBarLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#050505',
  },
  addBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  addIcon: {
    padding: 2,
  },

  // Privacy sheet
  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: BOTTOM_INSET + 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CED0D4',
    marginTop: 8,
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#050505',
    marginBottom: 8,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  sheetOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E4E6EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionIconActive: {
    backgroundColor: '#EBF5FF',
  },
  sheetOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#050505',
  },
  sheetOptionDesc: {
    fontSize: 13,
    color: '#65676B',
    marginTop: 2,
  },
});
