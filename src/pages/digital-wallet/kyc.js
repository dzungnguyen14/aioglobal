import React, { useState } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from "../../styles/global";
import { useLang } from "../../shared/hooks";
import BackButton from "../../components/home/backButton";
import { createKYCRequest, uploadFile } from './fetcher';
import { WALLET_STORAGE_TOKEN_KEY } from '../../shared/constant';
import { getItem } from '../../shared/utils';

const KYCStep = {
    FRONT_ID: 1,
    BACK_ID: 2,
    FACE: 3,
    REVIEW: 4
};

function KYCScreen({ navigation, route }) {
    const { lang } = useLang();
    const [currentStep, setCurrentStep] = useState(KYCStep.FRONT_ID);
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState({
        frontId: null,
        backId: null,
        face: null
    });
    const [token, setToken] = useState(null);
    React.useEffect(() => {
        getItem(WALLET_STORAGE_TOKEN_KEY).then(token => {
            setToken(token);
        });
    }, []);


    // Request camera and media library permissions
    const requestPermissions = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
            Alert.alert(
                'Yêu cầu quyền truy cập',
                'Ứng dụng cần quyền truy cập camera và thư viện ảnh để thực hiện xác thực KYC.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    // Pick image from library
    const pickImage = async (imageType) => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: imageType === 'face' ? [1, 1] : [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImages(prev => ({
                    ...prev,
                    [imageType]: result.assets[0].uri
                }));
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
        }
    };

    // Take photo with camera
    const takePhoto = async (imageType) => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: imageType === 'face' ? [1, 1] : [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImages(prev => ({
                    ...prev,
                    [imageType]: result.assets[0].uri
                }));
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
        }
    };

    // Show image picker options
    const showImageOptions = (imageType) => {
        Alert.alert(
            'Chọn ảnh',
            'Bạn muốn chụp ảnh mới hay chọn từ thư viện?',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Chụp ảnh', onPress: () => takePhoto(imageType) },
                { text: 'Chọn từ thư viện', onPress: () => pickImage(imageType) }
            ]
        );
    };

    // Handle next step
    const handleNext = () => {
        if (currentStep === KYCStep.FRONT_ID && !images.frontId) {
            Alert.alert('Thông báo', 'Vui lòng tải lên ảnh mặt trước CCCD');
            return;
        }
        if (currentStep === KYCStep.BACK_ID && !images.backId) {
            Alert.alert('Thông báo', 'Vui lòng tải lên ảnh mặt sau CCCD');
            return;
        }
        if (currentStep === KYCStep.FACE && !images.face) {
            Alert.alert('Thông báo', 'Vui lòng tải lên ảnh khuôn mặt');
            return;
        }

        if (currentStep < KYCStep.REVIEW) {
            setCurrentStep(currentStep + 1);
        }
    };

    // Handle previous step
    const handlePrevious = () => {
        if (currentStep > KYCStep.FRONT_ID) {
            setCurrentStep(currentStep - 1);
        }
    };

    const sendKYCRequest = async (kycRequests) => {
        let urlencoded = new URLSearchParams();
        Object.keys(kycRequests).forEach(key => {
            urlencoded.append(key, kycRequests[key]);
        });
        const response = await createKYCRequest(urlencoded, token);
        const { success, message } = response;
        if (success === false) {
            Alert.alert(
                'Lỗi',
                message,
                [
                    {
                        text: 'OK',
                        onPress: () => setCurrentStep(KYCStep.FRONT_ID)
                    }
                ]
            );
        } else {
            Alert.alert(
                'Thành công',
                'Thông tin KYC đã được gửi thành công. Chúng tôi sẽ xác minh trong vòng 24-48 giờ.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
          
        }
    }

    // Handle submit KYC
    const handleSubmit = async () => {
        if (!images.frontId || !images.backId || !images.face) {
            Alert.alert('Thông báo', 'Vui lòng hoàn thành tất cả các bước');
            return;
        }
        setIsLoading(true);
        try {
            let form = new FormData();
            form.append(`images[]`, {
                uri: images.frontId,
                type: 'image/jpeg',
                name: `${new Date().getTime()}_frontId.jpg`,
            });
            form.append(`images[]`, {
                uri: images.backId,
                type: 'image/jpeg',
                name: `${new Date().getTime()}_backId.jpg`,
            });
            form.append(`images[]`, {
                uri: images.face,
                type: 'image/jpeg',
                name: `${new Date().getTime()}_face.jpg`,
            });

            const response = await uploadFile(form, token);
            console.log("response", response);
            const { success, files } = response;
            if (success && files.length === 3) {
                sendKYCRequest({
                    front_id_image: files[0],
                    back_id_image: files[1],
                    selfie_image: files[2],
                    type_document: 'id_card',
                });
            } else {
                Alert.alert('Lỗi', 'Không thể tải lên ảnh. Vui lòng thử lại.');
            }
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            Alert.alert('Lỗi', 'Không thể gửi thông tin KYC. Vui lòng thử lại.');
        } 
    };

    // Render upload section
    const renderUploadSection = (imageType, title, description, icon) => {
        const imageUri = images[imageType];

        return (
            <View style={kycStyles.uploadSection}>
                <View style={kycStyles.uploadHeader}>
                    <Ionicons name={icon} size={32} color="#667eea" />
                    <Text style={kycStyles.uploadTitle}>{title}</Text>
                </View>

                <Text style={kycStyles.uploadDescription}>{description}</Text>

                {imageUri ? (
                    <View style={kycStyles.imagePreviewContainer}>
                        <Image source={{ uri: imageUri }} style={kycStyles.imagePreview} />
                    </View>
                ) : (
                    <TouchableOpacity
                        style={kycStyles.uploadButton}
                        onPress={() => showImageOptions(imageType)}
                    >
                        <Ionicons name="cloud-upload-outline" size={48} color="#667eea" />
                        <Text style={kycStyles.uploadButtonText}>Tải ảnh lên</Text>
                        <Text style={kycStyles.uploadButtonSubtext}>Chụp ảnh hoặc chọn từ thư viện</Text>
                    </TouchableOpacity>
                )}

                {imageUri && (
                    <TouchableOpacity
                        style={kycStyles.changeImageButton}
                        onPress={() => showImageOptions(imageType)}
                    >
                        <Ionicons name="camera-outline" size={20} color="#667eea" />
                        <Text style={kycStyles.changeImageText}>Thay đổi ảnh</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    // Render review section
    const renderReviewSection = () => {
        return (
            <View style={kycStyles.reviewContainer}>
                <Text style={kycStyles.reviewTitle}>Xác nhận thông tin</Text>
                <Text style={kycStyles.reviewSubtitle}>
                    Vui lòng kiểm tra lại thông tin trước khi gửi
                </Text>

                <View style={kycStyles.reviewSection}>
                    <Text style={kycStyles.reviewLabel}>Mặt trước CCCD</Text>
                    <Image source={{ uri: images.frontId }} style={kycStyles.reviewImage} />
                </View>

                <View style={kycStyles.reviewSection}>
                    <Text style={kycStyles.reviewLabel}>Mặt sau CCCD</Text>
                    <Image source={{ uri: images.backId }} style={kycStyles.reviewImage} />
                </View>

                <View style={kycStyles.reviewSection}>
                    <Text style={kycStyles.reviewLabel}>Ảnh khuôn mặt</Text>
                    <Image source={{ uri: images.face }} style={kycStyles.reviewImage} />
                </View>

                <View style={kycStyles.noteContainer}>
                    <Ionicons name="information-circle" size={20} color="#ff9800" />
                    <Text style={kycStyles.noteText}>
                        Thông tin của bạn sẽ được bảo mật và chỉ sử dụng cho mục đích xác thực tài khoản.
                    </Text>
                </View>
            </View>
        );
    };

    // Render progress indicator
    const renderProgressIndicator = () => {
        const steps = [
            { step: KYCStep.FRONT_ID, label: 'Mặt trước' },
            { step: KYCStep.BACK_ID, label: 'Mặt sau' },
            { step: KYCStep.FACE, label: 'Khuôn mặt' },
            { step: KYCStep.REVIEW, label: 'Xác nhận' }
        ];

        return (
            <View style={kycStyles.progressContainer}>
                {steps.map((item, index) => (
                    <React.Fragment key={item.step}>
                        <View style={kycStyles.progressStep}>
                            <View style={[
                                kycStyles.progressCircle,
                                currentStep >= item.step && kycStyles.progressCircleActive,
                                currentStep > item.step && kycStyles.progressCircleCompleted
                            ]}>
                                {currentStep > item.step ? (
                                    <Ionicons name="checkmark" size={16} color="#fff" />
                                ) : (
                                    <Text style={[
                                        kycStyles.progressNumber,
                                        currentStep >= item.step && kycStyles.progressNumberActive
                                    ]}>
                                        {item.step}
                                    </Text>
                                )}
                            </View>
                            <Text style={[
                                kycStyles.progressLabel,
                                currentStep >= item.step && kycStyles.progressLabelActive
                            ]}>
                                {item.label}
                            </Text>
                        </View>
                        {index < steps.length - 1 && (
                            <View style={[
                                kycStyles.progressLine,
                                currentStep > item.step && kycStyles.progressLineActive
                            ]} />
                        )}
                    </React.Fragment>
                ))}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {/* Header */}
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <BackButton onBack={() => navigation.goBack()} />
                    <Text style={[styles.homeName]}>
                        Xác thực KYC
                    </Text>
                </View>
            </View>

            <ScrollView style={kycStyles.content} showsVerticalScrollIndicator={false}>
                {/* Progress Indicator */}
                {renderProgressIndicator()}

                {/* Content based on current step */}
                {currentStep === KYCStep.FRONT_ID && renderUploadSection(
                    'frontId',
                    'Mặt trước CCCD',
                    'Chụp hoặc tải lên ảnh mặt trước của CCCD. Đảm bảo ảnh rõ ràng, không bị mờ hoặc chói sáng.',
                    'card-outline'
                )}

                {currentStep === KYCStep.BACK_ID && renderUploadSection(
                    'backId',
                    'Mặt sau CCCD',
                    'Chụp hoặc tải lên ảnh mặt sau của CCCD. Đảm bảo ảnh rõ ràng và đầy đủ thông tin.',
                    'card-outline'
                )}

                {currentStep === KYCStep.FACE && renderUploadSection(
                    'face',
                    'Ảnh khuôn mặt',
                    'Chụp hoặc tải lên ảnh khuôn mặt của bạn. Đảm bảo khuôn mặt rõ ràng, không đeo kính đen hoặc khẩu trang.',
                    'person-circle-outline'
                )}

                {currentStep === KYCStep.REVIEW && renderReviewSection()}

                {/* Guidelines */}
                {currentStep !== KYCStep.REVIEW && (
                    <View style={kycStyles.guidelinesContainer}>
                        <Text style={kycStyles.guidelinesTitle}>Hướng dẫn:</Text>
                        <View style={kycStyles.guidelineItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                            <Text style={kycStyles.guidelineText}>Ảnh phải rõ ràng, không bị mờ</Text>
                        </View>
                        <View style={kycStyles.guidelineItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                            <Text style={kycStyles.guidelineText}>Đảm bảo đầy đủ thông tin trong khung hình</Text>
                        </View>
                        <View style={kycStyles.guidelineItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                            <Text style={kycStyles.guidelineText}>Không chụp ảnh từ màn hình hoặc photocopy</Text>
                        </View>
                        <View style={kycStyles.guidelineItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                            <Text style={kycStyles.guidelineText}>Định dạng: JPG, PNG (tối đa 10MB)</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={kycStyles.bottomNavigation}>
                {currentStep > KYCStep.FRONT_ID && (
                    <TouchableOpacity
                        style={kycStyles.secondaryButton}
                        onPress={handlePrevious}
                        disabled={isLoading}
                    >
                        <Ionicons name="arrow-back" size={20} color="#667eea" />
                        <Text style={kycStyles.secondaryButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                )}

                {currentStep < KYCStep.REVIEW ? (
                    <TouchableOpacity
                        style={[kycStyles.primaryButton, currentStep === KYCStep.FRONT_ID && { flex: 1 }]}
                        onPress={handleNext}
                        disabled={isLoading}
                    >
                        <Text style={kycStyles.primaryButtonText}>Tiếp tục</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={kycStyles.primaryButton}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={kycStyles.primaryButtonText}>Gửi xác thực</Text>
                                <Ionicons name="checkmark" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const kycStyles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: '#fff',
        marginBottom: 16,
    },
    progressStep: {
        alignItems: 'center',
        flex: 1,
    },
    progressCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressCircleActive: {
        backgroundColor: '#667eea',
    },
    progressCircleCompleted: {
        backgroundColor: '#4CAF50',
    },
    progressNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
    },
    progressNumberActive: {
        color: '#fff',
    },
    progressLabel: {
        fontSize: 11,
        color: '#999',
        textAlign: 'center',
    },
    progressLabelActive: {
        color: '#667eea',
        fontWeight: '600',
    },
    progressLine: {
        height: 2,
        flex: 0.3,
        backgroundColor: '#e0e0e0',
        marginHorizontal: -10,
        marginBottom: 24,
    },
    progressLineActive: {
        backgroundColor: '#4CAF50',
    },
    uploadSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 20,
    },
    uploadHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    uploadTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    uploadDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 20,
    },
    uploadButton: {
        borderWidth: 2,
        borderColor: '#667eea',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9ff',
    },
    uploadButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#667eea',
        marginTop: 12,
    },
    uploadButtonSubtext: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: 240,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    removeImageButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#fff',
        borderRadius: 16,
    },
    changeImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#f8f9ff',
        gap: 8,
    },
    changeImageText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#667eea',
    },
    guidelinesContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 20,
    },
    guidelinesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    guidelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    guidelineText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    reviewContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    reviewTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    reviewSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    reviewSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    reviewLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    reviewImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    noteContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff3cd',
        padding: 16,
        borderRadius: 12,
        gap: 12,
        alignItems: 'flex-start',
    },
    noteText: {
        flex: 1,
        fontSize: 13,
        color: '#856404',
        lineHeight: 18,
    },
    bottomNavigation: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: Platform.OS === 'ios' ? 32 : 52,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        gap: 12,
    },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#667eea',
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#667eea',
        gap: 8,
    },
    secondaryButtonText: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default KYCScreen;

