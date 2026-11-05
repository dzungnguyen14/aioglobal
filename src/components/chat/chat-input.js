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
                        size={22}
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

                {/* Takes its own room in the row, so the text never runs under the buttons */}
                <View style={[componentStyles.trailingButtons, { width: text ? BUTTON_SIZE : BUTTON_SIZE * 2 }]}>
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
                            <Ionicons name="image-outline" size={22} color="#6B7280" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={componentStyles.iconButton}
                            onPress={() => handleActionPress('mic')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="mic-outline" size={22} color="#6B7280" />
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
                            <Ionicons name="send" size={16} color="#fff" />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
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

// Height of one line of input, and of each icon button
const BUTTON_SIZE = 36;

const componentStyles = StyleSheet.create({
    container: {
        // backgroundColor: '#fff',
        // borderTopWidth: 1,
        // borderTopColor: '#E5E7EB',
        paddingHorizontal: 10,
        width: '100%',
    },
    inputWrapper: {
        flexDirection: 'row',
        // buttons stay on the last line as the text grows
        alignItems: 'flex-end',
        // backgroundColor: '#F3F4F6',
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 2,
        paddingVertical: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        width: '100%',
    },
    inputWrapperFocused: {
        borderColor: '#1976D2',
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        lineHeight: 20,
        color: '#1F2937',
        paddingHorizontal: 6,
        paddingTop: 8,
        paddingBottom: 8,
        maxHeight: 100,
        minHeight: BUTTON_SIZE,
    },
    iconButton: {
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    trailingButtons: {
        height: BUTTON_SIZE,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        right: 0,
    },
    sendButtonContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1976D2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#93C5FD',
    },
});

export default ChatInput;
