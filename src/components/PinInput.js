import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Animated,
    Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PinInput = ({ 
    title, 
    subtitle, 
    onComplete, 
    error, 
    onClear,
    disabled = false,
    showForgot = false,
    onForgot
}) => {
    const [pin, setPin] = useState('');
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (error) {
            shake();
        }
    }, [error]);

    useEffect(() => {
        if (onClear) {
            setPin('');
        }
    }, [onClear]);

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
        Vibration.vibrate(100);
    };

    const handleNumberPress = (number) => {
        if (disabled || pin.length >= 6) return;
        
        const newPin = pin + number;
        setPin(newPin);
        
        if (newPin.length === 6) {
            onComplete(newPin);
        }
    };

    const handleDelete = () => {
        if (disabled) return;
        setPin(pin.slice(0, -1));
    };

    const handleClear = () => {
        setPin('');
    };

    // Expose clear method
    useEffect(() => {
        if (window.clearPinInput) {
            window.clearPinInput = handleClear;
        }
    }, []);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {/* PIN Display */}
            <Animated.View 
                style={[
                    styles.pinContainer,
                    { transform: [{ translateX: shakeAnimation }] }
                ]}
            >
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <View
                        key={index}
                        style={[
                            styles.pinDot,
                            pin.length > index && styles.pinDotFilled,
                            error && styles.pinDotError
                        ]}
                    >
                        {pin.length > index && (
                            <View style={styles.pinDotInner} />
                        )}
                    </View>
                ))}
            </Animated.View>

            {/* Error Message */}
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <View style={styles.errorPlaceholder} />
            )}

            {/* Number Pad */}
            <View style={styles.numberPad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                    <TouchableOpacity
                        key={number}
                        style={[styles.numberButton, disabled && styles.numberButtonDisabled]}
                        onPress={() => handleNumberPress(number.toString())}
                        activeOpacity={0.7}
                        disabled={disabled}
                    >
                        <Text style={[styles.numberText, disabled && styles.numberTextDisabled]}>
                            {number}
                        </Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={handleClear} style={styles.numberButton} >
                    <Ionicons name="trash-outline" size={28} color={disabled ? "#ccc" : "#333"} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.numberButton, disabled && styles.numberButtonDisabled]}
                    onPress={() => handleNumberPress('0')}
                    activeOpacity={0.7}
                    disabled={disabled}
                >
                    <Text style={[styles.numberText, disabled && styles.numberTextDisabled]}>0</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.numberButton, disabled && styles.numberButtonDisabled]}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                    disabled={disabled}
                >
                    <Ionicons name="backspace-outline" size={28} color={disabled ? "#ccc" : "#333"} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    pinContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        marginBottom: 8,
    },
    pinDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pinDotFilled: {
        borderColor: '#667eea',
        backgroundColor: '#667eea',
    },
    pinDotError: {
        borderColor: '#F44336',
        backgroundColor: '#F44336',
    },
    pinDotInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    errorText: {
        color: '#F44336',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        minHeight: 20,
    },
    errorPlaceholder: {
        height: 20,
        marginBottom: 16,
    },
    numberPad: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 300,
    },
    numberButton: {
        width: '30%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: '1.5%',
        borderRadius: 50,
        backgroundColor: '#f5f5f5',
    },
    numberButtonDisabled: {
        backgroundColor: '#f9f9f9',
        opacity: 0.5,
    },
    numberText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#333',
    },
    numberTextDisabled: {
        color: '#ccc',
    },
});

export default PinInput;

