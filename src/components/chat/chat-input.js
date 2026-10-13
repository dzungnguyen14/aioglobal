import { View, TouchableOpacity, TextInput, Platform, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useRef, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import EmoPicker from './emo-picker';
import { debounce } from '../../shared/hooks';

const ChatInput = ({ onSend, lang, loading, onTyping }) => {
    const [text, setText] = useState('');
    const [emoPicker, setEmoPicker] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const sendButtonScale = useRef(new Animated.Value(0)).current;
    const actionButtonsOpacity = useRef(new Animated.Value(1)).current;

    const sendEventInChating = useCallback(
        debounce(() => onTyping(), 1000),
        [onTyping]
    );

    useEffect(() => {
        Animated.parallel([
            Animated.spring(sendButtonScale, {
                toValue: text ? 1 : 0,
                friction: 8,
                tension: 100,
                useNativeDriver: true,
            }),
            Animated.timing(actionButtonsOpacity, {
                toValue: text ? 0 : 1,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
    }, [text]);

    const onChangeText = useCallback((value) => {
        setText(value);
        sendEventInChating();
    }, [sendEventInChating]);

    const onHandleSend = useCallback(() => {
        if (!text.trim() || loading) return;
        onSend(text);
        setText('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, [text, onSend, loading]);

    const handleActionPress = useCallback((action) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // Add action handlers here
        if (action === 'emoji') {
            setEmoPicker(!emoPicker);
        }
    }, [emoPicker]);

    return (
        <View style={componentStyles.container}>
            <View style={[
                componentStyles.inputWrapper,
                isFocused && componentStyles.inputWrapperFocused
            ]}>
                <TouchableOpacity 
                    style={componentStyles.iconButton}
                    onPress={() => handleActionPress('emoji')}
                    activeOpacity={0.7}
                >
                    <Ionicons 
                        name={emoPicker ? "happy" : "happy-outline"} 
                        size={24} 
                        color={emoPicker ? "#1976D2" : "#6B7280"} 
                    />
                </TouchableOpacity>

                <TextInput
                    multiline
                    style={componentStyles.textInput}
                    value={text}
                    onChangeText={onChangeText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholderTextColor="#9CA3AF"
                    placeholder={"Nhập tin nhắn..."}
                    maxLength={1000}
                    textAlignVertical="center"
                />

                <Animated.View 
                    style={[
                        componentStyles.actionButtonsContainer,
                        { 
                            opacity: actionButtonsOpacity,
                            transform: [{ scale: actionButtonsOpacity }]
                        }
                    ]}
                    pointerEvents={text ? 'none' : 'auto'}
                >
                    <TouchableOpacity 
                        style={componentStyles.iconButton}
                        onPress={() => handleActionPress('image')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="image-outline" size={24} color="#6B7280" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={componentStyles.iconButton}
                        onPress={() => handleActionPress('mic')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="mic-outline" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View 
                    style={[
                        componentStyles.sendButtonContainer,
                        {
                            opacity: sendButtonScale,
                            transform: [
                                { scale: sendButtonScale },
                                { 
                                    translateX: sendButtonScale.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0]
                                    })
                                }
                            ]
                        }
                    ]}
                    pointerEvents={text ? 'auto' : 'none'}
                >
                    <TouchableOpacity
                        style={[
                            componentStyles.sendButton,
                            loading && componentStyles.sendButtonDisabled
                        ]}
                        onPress={onHandleSend}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </Animated.View>
            </View>
            
            <EmoPicker 
                selectEmoji={(emoji) => {
                    setText(text => text + emoji);
                    setEmoPicker(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }} 
                setEmoPicker={setEmoPicker} 
                lang={lang}  
                emoPicker={emoPicker} 
            />
        </View>
    );
};

const componentStyles = StyleSheet.create({
    container: {
        // backgroundColor: '#fff',
        // borderTopWidth: 1,
        // borderTopColor: '#E5E7EB',
        paddingHorizontal: 16,
        width: '100%',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#F3F4F6',
        backgroundColor: '#fff',
        borderRadius: 24,
        paddingHorizontal: 4,
        paddingVertical: 4,
        minHeight: 48,
        maxHeight: 120,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        width: '100%',
    },
    inputWrapperFocused: {
        backgroundColor: '#fff',
        borderColor: '#1976D2',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        lineHeight: 20,
        color: '#1F2937',
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxHeight: 100,
        minHeight: 40,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        right: 4,
    },
    sendButtonContainer: {
        position: 'absolute',
        right: 4,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1976D2',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1976D2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    sendButtonDisabled: {
        backgroundColor: '#93C5FD',
        shadowOpacity: 0.1,
    },
});

export default ChatInput;
