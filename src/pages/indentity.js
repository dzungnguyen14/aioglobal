import {
    Text,
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import styles from "../styles/global";
import { useLang } from "../shared/hooks";
import { useEffect, useState } from "react";
import { fetchIdentityPhoto, uploadIdentityPhoto } from "../fetcher/api";
import * as ImagePicker from "expo-image-picker";
import { CustomImage } from "../components/images";
import BackButton from "../components/home/backButton";
import { Ionicons } from "@expo/vector-icons";

const VIEW_MODE = {
    VIEW: 0,
    UPLOAD: 1,
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_SIZE = SCREEN_WIDTH * 0.7;

function IdentityScreen({ navigation, route }) {
    const [status, requestPermission] = ImagePicker.useCameraPermissions();
    const { lang } = useLang();
    const { profile, mode } = route.params;
    const viewMode = mode ? parseInt(mode) : VIEW_MODE.VIEW;

    const [image, setImage] = useState();
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 0.4,
        });

        if (!result.canceled) {
            setUploading(true);
            setImage(result.assets[0].uri);
            try {
                await uploadIdentityPhoto(result.assets[0].uri, profile.token);
                Alert.alert(lang.success);
            } catch {
                Alert.alert("Error", "Upload failed. Please try again.");
            } finally {
                setUploading(false);
            }
        }
    };

    const onLoadPhoto = async () => {
        setLoading(true);
        try {
            const resp = await fetchIdentityPhoto(profile.token);
            if (resp.vneid_qr && resp.vneid_qr !== "") {
                setImage(resp.vneid_qr);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === VIEW_MODE.UPLOAD) {
            if (status && status.status === "undetermined") {
                requestPermission();
            }
        }
        onLoadPhoto();
    }, [viewMode]);

    const renderPlaceholder = () => (
        <View style={local.placeholderContainer}>
            <View style={local.placeholderCircle}>
                <Ionicons name="id-card-outline" size={64} color="#b0c4de" />
            </View>
            <Text style={local.placeholderTitle}>
                {viewMode === VIEW_MODE.VIEW
                    ? "Chưa có hình ảnh"
                    : lang.introduce_to_upload_vneid}
            </Text>
            <Text style={local.placeholderSubtitle}>
                {viewMode === VIEW_MODE.VIEW
                    ? "Hình VNEID sẽ hiển thị tại đây"
                    : "Chọn ảnh từ thư viện để tải lên"}
            </Text>
        </View>
    );

    const renderImage = () => (
        <View style={local.imageWrapper}>
            <CustomImage
                source={image}
                style={[
                    local.image,
                    viewMode === VIEW_MODE.VIEW && { borderRadius: 20 },
                ]}
            />
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            {/* Header */}
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignContent: "center",
                        alignItems: "center",
                        position: "relative",
                    }}
                >
                    <BackButton onBack={() => navigation.goBack()} top={0} />
                    <Text style={[styles.homeName]}>VNEID</Text>
                </View>
            </View>

            {/* Body */}
            <View style={local.body}>
                {/* Card */}
                <View style={local.card}>
                    <View style={local.cardHeader}>
                        <Ionicons name="shield-checkmark" size={22} color="#094C9C" />
                        <Text style={local.cardTitle}>
                            {viewMode === VIEW_MODE.VIEW
                                ? "Ảnh VNeID của bạn"
                                : "Tải ảnh VNeID"}
                        </Text>
                    </View>

                    <View style={local.cardBody}>
                        {loading ? (
                            <View style={local.loadingContainer}>
                                <ActivityIndicator size="large" color="#094C9C" />
                                <Text style={local.loadingText}>Đang tải...</Text>
                            </View>
                        ) : image ? (
                            renderImage()
                        ) : (
                            renderPlaceholder()
                        )}
                    </View>

                    {viewMode === VIEW_MODE.UPLOAD && (
                        <View style={local.cardFooter}>
                            {image && (
                                <Text style={local.uploadHint}>
                                    {lang.introduce_to_upload_vneid}
                                </Text>
                            )}
                            <TouchableOpacity
                                style={[local.uploadButton, uploading && local.uploadButtonDisabled]}
                                onPress={pickImage}
                                disabled={uploading}
                                activeOpacity={0.7}
                            >
                                {uploading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                                )}
                                <Text style={local.uploadButtonText}>
                                    {uploading ? "Đang tải lên..." : lang.upload_image}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Info note */}
                <View style={local.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#094C9C" />
                    <Text style={local.infoText}>
                        {viewMode === VIEW_MODE.VIEW
                            ? "Ảnh VNEID được sử dụng để xác minh danh tính của bạn."
                            : "Vui lòng tải ảnh rõ ràng để quá trình xác minh nhanh hơn."}
                    </Text>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const local = StyleSheet.create({
    body: {
        flex: 1,
        backgroundColor: "#f4f6fa",
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        overflow: "hidden",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a1a2e",
    },
    cardBody: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 24,
        paddingHorizontal: 20,
        minHeight: 280,
    },
    cardFooter: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 12,
    },
    loadingContainer: {
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#888",
    },
    placeholderContainer: {
        alignItems: "center",
        gap: 12,
        paddingVertical: 20,
    },
    placeholderCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#eef3fb",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    placeholderTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#555",
    },
    placeholderSubtitle: {
        fontSize: 13,
        color: "#999",
        textAlign: "center",
    },
    imageWrapper: {
        alignItems: "center",
        width: "100%",
    },
    image: {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        borderRadius: 12,
    },
    uploadHint: {
        fontSize: 13,
        color: "#666",
        textAlign: "center",
        lineHeight: 20,
    },
    uploadButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#094C9C",
        paddingVertical: 14,
        borderRadius: 12,
    },
    uploadButtonDisabled: {
        backgroundColor: "#7aa5d1",
    },
    uploadButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: "#eef3fb",
        borderRadius: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: "#555",
        lineHeight: 20,
    },
});

export default IdentityScreen;
