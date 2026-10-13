import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';

const ChatSkeleton = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7]
    });

    return (
        <View style={styles.container}>
            {/* Header Skeleton */}
            <View style={styles.header}>
                <Animated.View style={[styles.avatarSkeleton, { opacity }]} />
                <View style={styles.headerTextContainer}>
                    <Animated.View style={[styles.nameSkeleton, { opacity }]} />
                    <Animated.View style={[styles.statusSkeleton, { opacity }]} />
                </View>
            </View>

            {/* Message Skeletons */}
            <View style={styles.messagesContainer}>
                {/* Received Message 1 */}
                <View style={styles.receivedMessageRow}>
                    <Animated.View style={[styles.smallAvatarSkeleton, { opacity }]} />
                    <Animated.View style={[styles.receivedMessageSkeleton, { opacity, width: '60%' }]} />
                </View>

                {/* Sent Message 1 */}
                <View style={styles.sentMessageRow}>
                    <Animated.View style={[styles.sentMessageSkeleton, { opacity, width: '50%' }]} />
                </View>

                {/* Received Message 2 */}
                <View style={styles.receivedMessageRow}>
                    <Animated.View style={[styles.smallAvatarSkeleton, { opacity }]} />
                    <Animated.View style={[styles.receivedMessageSkeleton, { opacity, width: '70%' }]} />
                </View>

                {/* Sent Message 2 */}
                <View style={styles.sentMessageRow}>
                    <Animated.View style={[styles.sentMessageSkeleton, { opacity, width: '45%' }]} />
                </View>

                {/* Received Message 3 */}
                <View style={styles.receivedMessageRow}>
                    <Animated.View style={[styles.smallAvatarSkeleton, { opacity }]} />
                    <Animated.View style={[styles.receivedMessageSkeleton, { opacity, width: '65%' }]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#1976D2',
    },
    avatarSkeleton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 12,
    },
    headerTextContainer: {
        flex: 1,
    },
    nameSkeleton: {
        width: 120,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 6,
    },
    statusSkeleton: {
        width: 80,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    messagesContainer: {
        flex: 1,
        padding: 16,
    },
    receivedMessageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    sentMessageRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 16,
    },
    smallAvatarSkeleton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#d1d5db',
        marginRight: 8,
    },
    receivedMessageSkeleton: {
        height: 60,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    sentMessageSkeleton: {
        height: 60,
        borderRadius: 12,
        backgroundColor: '#C6E8F8',
    },
});

export default ChatSkeleton;

