import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const SkeletonLoader = ({ width, height, style, borderRadius = 4 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

const ChatItemSkeleton = () => (
  <View style={styles.chatItemContainer}>
    <SkeletonLoader width={50} height={50} borderRadius={25} />
    <View style={styles.chatItemContent}>
      <SkeletonLoader width="60%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="80%" height={14} />
    </View>
    <SkeletonLoader width={40} height={12} />
  </View>
);

const ContactItemSkeleton = () => (
  <View style={styles.contactItemContainer}>
    <SkeletonLoader width={50} height={50} borderRadius={25} />
    <View style={styles.chatItemContent}>
      <SkeletonLoader width="60%" height={16} />
    </View>
    <View style={styles.contactActions}>
      <SkeletonLoader width={36} height={36} borderRadius={18} />
      <SkeletonLoader width={36} height={36} borderRadius={18} />
    </View>
  </View>
);

const SearchResultSkeleton = () => (
  <View style={styles.searchResultItem}>
    <SkeletonLoader width={40} height={40} borderRadius={20} />
    <View style={styles.searchResultContent}>
      <SkeletonLoader width="70%" height={16} />
    </View>
    <SkeletonLoader width={34} height={34} borderRadius={17} />
  </View>
);

const SkeletonList = ({ type = 'chat', count = 8 }) => {
  const SkeletonComponent = 
    type === 'contact' ? ContactItemSkeleton :
    type === 'search' ? SearchResultSkeleton :
    ChatItemSkeleton;

  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  chatItemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 14,
  },
  chatItemContent: {
    flex: 1,
  },
  contactItemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 14,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
    gap: 12,
  },
  searchResultContent: {
    flex: 1,
  },
});

export { SkeletonLoader, ChatItemSkeleton, ContactItemSkeleton, SearchResultSkeleton, SkeletonList };

