import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Image,
    Dimensions,
    Platform,
    ToastAndroid,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = CARD_WIDTH * 0.6;
const CARD_RATIO = CARD_WIDTH / 340;

function formatCardNumber(number, hidden) {
    const cleaned = number.replace(/\s/g, '');
    if (hidden) {
        const last4 = cleaned.slice(-4);
        return `•••• •••• •••• ${last4}`;
    }
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

function formatDate(dateStr) {
    if (!dateStr) return '••/••';
    if (dateStr.length <= 5) return dateStr;
    const d = new Date(dateStr);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}/${yy}`;
}

export default function CardInfo({ card }) {
    if (!card) return null;

    const {
        number = '',
        type = '',
        start_date = '',
        end_date = '',
        image,
        active = false,
        holder_name = '',
    } = card;

    const [hidden, setHidden] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const [copied, setCopied] = useState(false);

    const toggleVisibility = () => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0.4,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
        setHidden(prev => !prev);
    };

    const displayNumber = formatCardNumber(number, hidden);
    const displayExpiry = hidden ? '••/••' : formatDate(end_date);
    const displayStart = hidden ? '••/••' : formatDate(start_date);
    const displayName = hidden
        ? (holder_name ? holder_name.charAt(0) + '••••••' : '••••••')
        : (holder_name || '---');

    // Copy card number to clipboard (not hidden)
    const handleCopyNumber = async () => {
        if (hidden) return; // Prevent copy when hidden
        await Clipboard.setStringAsync(formatCardNumber(number, false));
        setCopied(true);
        if (Platform.OS === 'android') {
            ToastAndroid.show('Card number copied', ToastAndroid.SHORT);
        }
        // Optionally, auto-hide copied state after a moment
        setTimeout(() => setCopied(false), 1600);
    };

    return (
        <View style={styles.container}>
            {/* Card */}
            <View style={[styles.card]}>
                {image && (
                    <Image
                        source={{ uri: image }}
                        style={active ? styles.cardBgImage : styles.cardBgImageInactive}
                        resizeMode="cover"
                    />
                )}

                {/* Top row: chip + brand + toggle */}
                <View style={styles.cardTopRow}>
                    <View style={styles.chipContainer}>
                        <View style={styles.chip}>
                            <View style={styles.chipLine} />
                            <View style={[styles.chipLine, styles.chipLineShort]} />
                        </View>
                        {type ? (
                            <Text style={styles.brandBadge}>{type.toUpperCase()}</Text>
                        ) : null}
                    </View>
                    <TouchableOpacity
                        onPress={toggleVisibility}
                        style={styles.toggleBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={hidden ? 'eye-off-outline' : 'eye-outline'}
                            size={20 * CARD_RATIO}
                            color="rgba(255,255,255,0.8)"
                        />
                    </TouchableOpacity>
                </View>

                {/* Card number + copy */}
                <Animated.View style={[styles.numberContainer, { opacity: fadeAnim, flexDirection: 'row', alignItems: 'center' }]}>
                    <Text style={styles.cardNumber}>{displayNumber}</Text>
                    {!hidden && !!number && (
                        <TouchableOpacity
                            style={styles.copyBtn}
                            onPress={handleCopyNumber}
                            accessibilityLabel="Copy card number"
                            activeOpacity={0.7}
                        >
                            {copied ? (
                                <MaterialIcons name="check" size={16 * CARD_RATIO} color="#8EE08A" />
                            ) : (
                                <MaterialIcons name="content-copy" size={16 * CARD_RATIO} color="#fff" />
                            )}
                        </TouchableOpacity>
                    )}
                </Animated.View>

                {/* Bottom row: dates + holder */}
                <View style={styles.cardBottomRow}>
                    <View style={styles.dateGroup}>
                        {start_date ? (
                            <View style={styles.dateItem}>
                                <Text style={styles.dateLabel}>VALID FROM</Text>
                                <Text style={styles.dateValue}>{displayStart}</Text>
                            </View>
                        ) : null}
                        <View style={styles.dateItem}>
                            <Text style={styles.dateLabel}>VALID THRU</Text>
                            <Text style={styles.dateValue}>{displayExpiry}</Text>
                        </View>
                    </View>
                    <View style={styles.holderGroup}>
                        <Text style={styles.holderLabel}>CARD HOLDER</Text>
                        <Text style={styles.holderName} numberOfLines={1}>
                            {displayName}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 16,
        padding: 20 * CARD_RATIO,
        justifyContent: 'space-between',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    cardBgImage: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        opacity: 0.9,
    },
    cardBgImageInactive: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        opacity: 0.2,
    },
    circle: {
        position: 'absolute',
        width: 180 * CARD_RATIO,
        height: 180 * CARD_RATIO,
        borderRadius: 90 * CARD_RATIO,
        opacity: 0.08,
    },
    circleTopRight: {
        top: -60 * CARD_RATIO,
        right: -40 * CARD_RATIO,
    },
    circleBottomLeft: {
        bottom: -80 * CARD_RATIO,
        left: -50 * CARD_RATIO,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10 * CARD_RATIO,
    },
    chip: {
        width: 36 * CARD_RATIO,
        height: 26 * CARD_RATIO,
        borderRadius: 4,
        backgroundColor: '#d4af37',
        justifyContent: 'center',
        paddingHorizontal: 4 * CARD_RATIO,
        gap: 3 * CARD_RATIO,
    },
    chipLine: {
        height: 2,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 1,
    },
    chipLineShort: {
        width: '60%',
    },
    brandBadge: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14 * CARD_RATIO,
        fontWeight: '700',
        letterSpacing: 2,
    },
    toggleBtn: {
        width: 36 * CARD_RATIO,
        height: 36 * CARD_RATIO,
        borderRadius: 18 * CARD_RATIO,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberContainer: {
        marginVertical: 4 * CARD_RATIO,
        flexDirection: "row",
        alignItems: "center"
    },
    cardNumber: {
        color: '#fff',
        fontSize: 20 * CARD_RATIO,
        fontWeight: '600',
        letterSpacing: 3,
        fontVariant: ['tabular-nums'],
    },
    copyBtn: {
        marginLeft: 8 * CARD_RATIO,
        width: 22 * CARD_RATIO,
        height: 22 * CARD_RATIO,
        borderRadius: 11 * CARD_RATIO,
        backgroundColor: 'rgba(255,255,255,0.10)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    dateGroup: {
        flexDirection: 'row',
        gap: 16 * CARD_RATIO,
    },
    dateItem: {},
    dateLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 8 * CARD_RATIO,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 2,
    },
    dateValue: {
        color: '#fff',
        fontSize: 13 * CARD_RATIO,
        fontWeight: '600',
        letterSpacing: 1,
    },
    holderGroup: {
        alignItems: 'flex-end',
        maxWidth: '45%',
    },
    holderLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 8 * CARD_RATIO,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 2,
    },
    holderName: {
        color: '#fff',
        fontSize: 13 * CARD_RATIO,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statusRow: {
        position: 'absolute',
        top: 20 * CARD_RATIO,
        right: 60 * CARD_RATIO,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 15 * CARD_RATIO,
        fontWeight: '700',
    },
});
