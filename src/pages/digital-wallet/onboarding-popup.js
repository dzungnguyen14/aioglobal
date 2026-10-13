import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal, 
    TouchableOpacity, 
    Dimensions,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../shared/hooks';

const { width, height } = Dimensions.get('window');

const OnboardingPopup = ({ visible, onComplete, onSkip }) => {
    const { lang } = useLang();
    const [currentStep, setCurrentStep] = useState(0);

    const onboardingSteps = [
        {
            icon: 'wallet',
            title: 'Ví điện tử an toàn',
            description: 'Quản lý tài chính của bạn một cách dễ dàng và bảo mật với công nghệ mã hóa tiên tiến',
            color: '#667eea',
        },
        {
            icon: 'shield-checkmark',
            title: 'Bảo mật tối đa',
            description: 'Mã PIN 6 số giúp bảo vệ tài khoản của bạn khỏi các truy cập trái phép',
            color: '#4CAF50',
        },
    ];

    const handleNext = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onSkip();
    };

    const handleDotPress = (index) => {
        setCurrentStep(index);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleSkip}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Skip Button */}
                    {currentStep < onboardingSteps.length - 1 && (
                        <TouchableOpacity 
                            style={styles.skipButton}
                            onPress={handleSkip}
                        >
                            <Text style={styles.skipText}>Bỏ qua</Text>
                        </TouchableOpacity>
                    )}

                    {/* Content */}
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.content}>
                            {/* Icon */}
                            <View style={[styles.iconContainer, { backgroundColor: onboardingSteps[currentStep].color + '20' }]}>
                                <Ionicons 
                                    name={onboardingSteps[currentStep].icon} 
                                    size={80} 
                                    color={onboardingSteps[currentStep].color} 
                                />
                            </View>

                            {/* Title */}
                            <Text style={styles.title}>
                                {onboardingSteps[currentStep].title}
                            </Text>

                            {/* Description */}
                            <Text style={styles.description}>
                                {onboardingSteps[currentStep].description}
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Pagination Dots */}
                    <View style={styles.pagination}>
                        {onboardingSteps.map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleDotPress(index)}
                                style={[
                                    styles.dot,
                                    currentStep === index && styles.activeDot,
                                    { backgroundColor: currentStep === index ? onboardingSteps[currentStep].color : '#ddd' }
                                ]}
                            />
                        ))}
                    </View>

                    {/* Next/Get Started Button */}
                    <TouchableOpacity 
                        style={[styles.nextButton, { backgroundColor: onboardingSteps[currentStep].color }]}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextButtonText}>
                            {currentStep < onboardingSteps.length - 1 ? 'Tiếp tục' : 'Bắt đầu'}
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.9,
        maxHeight: height * 0.8,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        paddingTop: 16,
    },
    skipButton: {
        alignSelf: 'flex-end',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '600',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 24,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ddd',
    },
    activeDot: {
        width: 24,
        height: 8,
        borderRadius: 4,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#667eea',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default OnboardingPopup;

