import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, Animated, ActivityIndicator } from "react-native";
import { useLang, useProfile } from "../shared/hooks";
import styles from "../styles/global";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback, memo, useRef, useMemo } from "react";
import { joinChat, sendMessage, initRoom, postTyping, toggleFavorite } from "../components/home/zoom/api";
import ChatInput from "../components/chat/chat-input";
import ChatSkeleton from "../components/chat/chat-skeleton";
import { Alert } from "react-native";
import { formatDateToTime } from "../shared/utils";
import { useGlobal } from "../state/global"
import { ZOOM_API_HOST } from "../shared/constant";
import { CustomImage } from "../components/images";
import { ContactAvatar } from "../components/home/zoom/constants";
import { SafeAreaView } from "react-native-safe-area-context";

const MessageItem = memo(({ message, sender, receiver, lang, isNextMessageOwner, index, onMakeCall }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 80,
                friction: 8,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const isShowAvatar = message.author && message.author._id !== sender?._id;

    if (message.type === 'call' && message.author._id === sender._id) {
        return null;
    }
    return (
        <Animated.View
            style={[
                message.author._id === sender?._id ? {} : { flexDirection: 'row' },
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}
        >
            {isShowAvatar && isNextMessageOwner && (
                <View style={[styles.avatarContainer, { paddingTop: 10 }]}>
                    <ContactAvatar account={receiver} width={20} height={20} />
                </View>
            )}
            {isShowAvatar && !isNextMessageOwner && (
                <View style={styles.avatarSpacer} />
            )}
            {sender && message && (
                <View style={[
                    message.author._id === sender._id ? styles.ownMessage : styles.otherMessage,
                    styles.messageContainer,
                    {
                        alignSelf: message.author._id === sender._id ? 'flex-end' : 'flex-start',
                        backgroundColor: message.author._id === sender._id ? '#C6E8F8' : '#fff',
                        marginLeft: !isNextMessageOwner ? 20 : 0
                    }
                ]}>
                    <View style={styles.messageContent}>
                        <Text style={styles.messageText}>
                            {message.content}
                        </Text>
                        {message.type === 'call' && (
                            <View style={{ marginVertical: 10, justifyContent:'center', flexDirection: 'row', }}>
                                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }} onPress={onMakeCall}>
                                    <Ionicons name="call-outline" size={15} color="#000" />
                                    <Text style={{ fontSize: 15, fontWeight: '500', color: '#000' }}>Gọi lại</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <Text style={styles.messageTime}>
                            {formatDateToTime(message.date, lang)}
                        </Text>
                    </View>
                </View>
            )}
        </Animated.View>
    );
}, (prevProps, nextProps) => {
    return prevProps.message._id === nextProps.message._id &&
        prevProps.message.content === nextProps.message.content;
});

const ChatboxScreen = memo(({ navigation, route }) => {
    const { state, dispatch } = useGlobal();
    const { onlineUsers, historyMessages, currentRoom, isTyping, favoriteList, newMessage } = state;
    const { lang } = useLang();
    const { profile } = state;
    const { room_id, _sender, _receiver, counterpart } = route.params;

    const [initialLoading, setInitialLoading] = useState(true);
    const [messages, setMessages] = useState(historyMessages?.[room_id] ?? []);
    const [sender, setSender] = useState(_sender ?? null);
    const [receiver, setReceiver] = useState(_receiver ?? null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const flatListRef = useRef(null);
    const previousMessageCount = useRef(messages.length);
    const isInitialMount = useRef(true);

    const typing = useMemo(() => isTyping && isTyping.roomID === room_id, [isTyping]);
    useEffect(() => {
        setIsFavorite(favoriteList.some(item => item._id === room_id));
    }, [favoriteList, room_id]);

    const onLoadMessages = useCallback(async (isInitial = false) => {
        if (!room_id || !counterpart || !profile.token) return;

        try {
            const response = await joinChat({ id: room_id, counterpart }, profile.token);
            const { room: data, owner_id } = response;

            if (!data?.people) return;

            dispatch({ type: 'SET_CURRENT_ROOM', payload: data });

            const newSender = data.people.find(item => item._id === owner_id);
            const newReceiver = data.people.find(item => item._id !== owner_id);

            setSender(newSender);
            setReceiver(newReceiver);

            const reversedMessages = data.messages?.reverse() ?? [];

            // Only update messages if there are new ones or it's the initial load
            if (isInitial) {
                setMessages(reversedMessages);
                setInitialLoading(false);
            } else {
                // Smart update: only add new messages
                setMessages(prevMessages => {
                    if (reversedMessages.length > prevMessages.length) {
                        const newMessagesCount = reversedMessages.length - prevMessages.length;
                        const newMessages = reversedMessages.slice(-newMessagesCount);
                        return [...prevMessages, ...newMessages];
                    }
                    return prevMessages;
                });
            }

            dispatch({
                type: 'SET_HISTORY_MESSAGES_BY_ROOM_ID',
                payload: { room_id, messages: data.messages }
            });
        } catch (error) {
            console.error('Error loading messages:', error);
            if (isInitial) {
                Alert.alert(lang.error, error.message);
            }
        }
    }, [room_id, counterpart, profile.token, dispatch, lang]);

    const onMakeCall = useCallback(async () => {
        if (!sender || !receiver || isLoading) return;

        setIsLoading(true);
        dispatch({ type: 'SET_END_CALL', payload: false });

        try {
            const params = {
                startedAsCall: true,
                caller: sender._id,
                callee: receiver._id,
                callToGroup: false,
                group: room_id,
            };

            const response = await initRoom(params, profile.token);

            if (response._id) {
                navigation.navigate('OnCall', {
                    room_id,
                    meeting_id: response._id,
                    counterpart: receiver
                });
            } else {
                Alert.alert(lang.error, response.msg);
            }
        } catch (error) {
            Alert.alert(lang.error, error.message);
        } finally {
            setIsLoading(false);
        }
    }, [sender, receiver, room_id, profile.token, dispatch, navigation, lang, isLoading]);

    const onTyping = useCallback(async () => {
        if (!currentRoom || !profile.token) return;

        try {
            await postTyping({
                room: currentRoom,
                isTyping: true,
            }, profile.token);
        } catch (error) {
            console.error('Error posting typing status:', error);
        }
    }, [currentRoom, profile.token]);

    const onSend = useCallback(async (message) => {
        if (!message.trim() || !sender || isSending) return;

        setIsSending(true);

        // Optimistic UI update - add message immediately with temporary ID
        const tempId = `temp_${Date.now()}`;
        const optimisticMessage = {
            _id: tempId,
            author: sender,
            content: message,
            date: new Date(),
            sending: true
        };

        setMessages(prev => [optimisticMessage, ...prev]);
        try {
            await sendMessage({
                room_id,
                author_id: sender._id,
                content: message,
                content_type: 'text',
            }, profile.token);

            onLoadMessages(false);

        } catch (error) {
            setMessages(prev => prev.filter(msg => msg._id !== tempId));
            Alert.alert(lang.error, error.message);
        } finally {
            setIsSending(false);
        }
    }, [sender, room_id, profile.token, onLoadMessages, lang, isSending]);

    const onToggleFavorite = useCallback(async () => {
        try {
            setIsFavorite(prev => !prev);
            const response = await toggleFavorite({ room_id }, profile.token);
            dispatch({ type: 'SET_FAVORITE_LIST', payload: response.favorites ?? [] });
        } catch (error) {
            Alert.alert(lang.error, error.message);
        }
    }, [room_id, profile.token, dispatch, lang]);

    useEffect(() => {
        if (!room_id || !counterpart || !profile.token) return;
        // Initial load
        if (isInitialMount.current) {
            onLoadMessages(true);
            isInitialMount.current = false;
        }

        // Poll for new messages every 3 seconds (background updates)
        return () => {
            isInitialMount.current = true;
        };
    }, [room_id, counterpart, profile.token, onLoadMessages]);


    useEffect(() => {
        if (newMessage && newMessage.room === room_id) {
            setMessages(prev => [newMessage, ...prev]);
            dispatch({ type: 'newMessage', payload: false });
        }
    }, [newMessage]);
    // Track new messages for smooth scroll
    useEffect(() => {
        if (messages.length > previousMessageCount.current && !initialLoading) {
            previousMessageCount.current = messages.length;
        }
    }, [messages.length, initialLoading]);

    const navigateToHome = useCallback(() => {
        navigation.navigate('Home', { item: profile, tab: 'zoom' });
    }, [navigation, profile]);

    const renderItem = useCallback(({ item: message, index }) => {
        const isNextMessageOwner = index === 0 ||
            index === messages.length - 1 ||
            (index > 0 && messages[index + 1]?.author._id === sender?._id);

        return (
            <MessageItem
                onMakeCall={onMakeCall}
                message={message}
                sender={sender}
                receiver={receiver}
                lang={lang}
                isNextMessageOwner={isNextMessageOwner}
                index={index}
            />
        );
    }, [messages, sender, receiver, lang]);

    const keyExtractor = useCallback((item, index) => item._id?.toString() || index.toString(), []);

    const getItemLayout = useCallback((data, index) => ({
        length: 80, // Approximate height
        offset: 80 * index,
        index,
    }), []);

    const renderFooter = useCallback(() => {
        if (initialLoading) {
            return (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#1976D2" />
                    <Text style={{ marginTop: 10, color: '#666' }}>{lang.loading || 'Loading...'}</Text>
                </View>
            );
        }
        return null;
    }, [initialLoading, lang]);

    // Show skeleton while loading initial messages
    if (initialLoading) {
        return <ChatSkeleton />;
    }

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, { backgroundColor: '#eee' }]}>
                {receiver && (
                    <View style={[styles.contactChat, {   backgroundColor: '#1976D2' }]}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity onPress={navigateToHome} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.headerCenter}>
                            <Text style={styles.headerName}>
                                {receiver.firstName} {receiver.lastName}
                            </Text>
                            <Text style={styles.headerStatus}>
                                {onlineUsers.find(item => item.id === receiver._id)
                                    ? lang.online
                                    : formatDateToTime(receiver.lastOnline, lang)}
                            </Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity onPress={onMakeCall}>
                                <Ionicons name="call-outline" size={25} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onMakeCall}>
                                <Ionicons name="videocam-outline" size={30} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        getItemLayout={getItemLayout}
                        ListFooterComponent={renderFooter}
                        inverted
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        initialNumToRender={15}
                        updateCellsBatchingPeriod={50}
                        maintainVisibleContentPosition={{
                            minIndexForVisible: 0,
                            autoscrollToTopThreshold: 10
                        }}
                    />
                </View>
                {typing && receiver && (
                    <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', backgroundColor: '#eee', justifyContent: "flex-start", padding: 10, }}>
                        {receiver.picture ? (
                            <CustomImage source={{ uri: ZOOM_API_HOST + '/api/images/' + receiver.picture.shieldedID + '/256' }} style={{ width: 20, height: 20, borderRadius: 10 }} />
                        ) : (
                            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#e9e9e9', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 10, fontWeight: '500', color: '#fff' }}>{receiver.firstName.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={[
                            styles.otherMessage,
                            {
                                maxWidth: '80%',
                                alignSelf: 'flex-end',
                                padding: 10,
                                borderRadius: 10,
                                backgroundColor: '#eee',
                                marginVertical: 5,
                                marginHorizontal: 10
                            }
                        ]}>
                            <View style={{ flexDirection: 'collumns', gap: 5 }}>
                                <Text style={{ color: '#000' }}>
                                    {receiver.firstName} {receiver.lastName}{lang.typing}
                                </Text>
                            </View>
                        </View>

                    </View>
                )}
                {currentRoom &&  (
                    <View style={{ flex: 0.1 }}>
                        <ChatInput
                            onSend={onSend}
                            lang={lang}
                            loading={isSending}
                            onTyping={onTyping}
                        />
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
});

export default ChatboxScreen;