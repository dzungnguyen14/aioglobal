import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal, 
    TouchableOpacity, 
    Dimensions,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const CompletedPopup = ({ visible, onClose }) => {
    const navigation = useNavigation();
    const [currentStep, setCurrentStep] = useState(0);

    const onboardingSteps = [
        {
            title: 'Chuyển đổi thành Fiat',
            description: 'Chuyển đổi crypto của bạn thành VNĐ và xác thực giao dịch block chain của bạn',
            color: '#667eea',
        },
        {
            title: 'Chuyển tiền',
            description: 'Chuyển đổi crypto của bạn thành VNĐ và xác thực giao dịch block chain của bạn',
            color: '#4CAF50',
        },
        {
            title: 'Thanh toán',
            description: 'Chuyển đổi crypto của bạn thành VNĐ và xác thực giao dịch block chain của bạn',
            color: '#4CAF50',
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(step => step + 1);
        }, 2000);
        return () => clearInterval(interval);
    }, [])


    useEffect(() => {
        if(currentStep > 2) {
            onClose();
        }
    }, [currentStep])


    if(currentStep > 2) return <></>;
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => {}}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                     <ActivityIndicator size="large" color="#667eea" />
                    {/* Content */}
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.content}>

                            {/* Title */}
                            <Text style={styles.title}>
                                {onboardingSteps[currentStep]?.title ?? ''}
                            </Text>

                            {/* Description */}
                            <Text style={styles.description}>
                                {onboardingSteps[currentStep]?.description ?? ''}
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

export default CompletedPopup;

