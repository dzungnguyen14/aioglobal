import { Platform, StyleSheet } from 'react-native';

// Modern color palette
const COLORS = {
  primary: '#1976D2',        // Indigo
  secondary: '#8B5CF6',      // Purple
  background: '#F8FAFC',     // Light gray background
  surface: '#FFFFFF',        // White surface
  text: {
    primary: '#1E293B',      // Dark slate
    secondary: '#64748B',    // Slate gray
    light: '#94A3B8',        // Light slate
  },
  border: {
    light: '#F1F5F9',        // Very light gray
    medium: '#E2E8F0',       // Light gray
  },
  accent: '#10B981',         // Green accent
  error: '#EF4444',          // Red
  warning: '#F59E0B',        // Yellow warning
  info: '#3B82F6',          // Blue info
};

export const zoomStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    height: Platform.OS == 'ios' ? 80 : 70,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: Platform.OS == 'ios' ? 45 : 25,
    paddingBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 50,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: COLORS.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  searchText: {
    color: COLORS.surface,
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  searchButton: {
    padding: 6,
    borderRadius: 8,
  },
  toolbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    flex: 1,
  },
  toolbarButton: {
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
    padding: 5,
  },
  toolbarButtonText: {
    color: '#fff',
    fontSize: 9,
  },
  contactBarContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    width: '100%',
    height: 50,
    gap: 15,
  },
  contactBarText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '600',
  },
  chatItemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    gap: 14,
  },
  chatItemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  chatItemMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  chatItemTime: {
    fontSize: 11,
    color: COLORS.text.light,
    fontWeight: '500',
  },
  contactItemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    gap: 14,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactActionButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  recentContactItem: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  recentContactName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: COLORS.text.primary,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    marginBottom: 8,
    gap: 12,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    letterSpacing: 0.2,
  },
  searchResultActions: {
    alignItems: 'flex-end',
  },
  callButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.surface,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  recentContactsSection: {
    maxHeight: 190,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  searchResultsSection: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  searchContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  addFriendText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },  
  addFriendButton: {
    borderColor: COLORS.info,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButton: {
    borderColor: COLORS.info,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
});