import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import styles from "../../styles/global";
import BackButton from "../../components/home/backButton";
import ScanningLottie from '../../../assets/qr-scanner.json';
import LottieView from 'lottie-react-native';
import { useLang } from '../../shared/hooks';

const { width } = Dimensions.get('window');

function BarcodeScannerScreen({ navigation, route }) {
    const { lang } = useLang();
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    const animation = useRef(null);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getCameraPermissions();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        navigation.navigate('WithdrawWallet', { barcode: data });
    };

    const toggleTorch = () => {
        setTorchOn(!torchOn);
    };

    if (hasPermission === null) {
        return (
            <View style={scannerStyles.container}>
                <Text style={scannerStyles.permissionText}>Requesting camera permission...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={scannerStyles.container}>
                <View style={[styles.homeHeader, { zIndex: 999 }]}>
                    <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                        <BackButton onBack={() => navigation.goBack()} />
                        <Text style={[styles.homeName]}>
                            {lang.scanner || "Scanner"}
                        </Text>
                    </View>
                </View>
                <View style={scannerStyles.permissionContainer}>
                    <Ionicons name="camera-off" size={64} color="#999" />
                    <Text style={scannerStyles.permissionText}>No access to camera</Text>
                    <Text style={scannerStyles.permissionSubtext}>
                        Please enable camera permissions in your device settings
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={scannerStyles.container}>
            {/* Header */}
            <View style={[styles.homeHeader, { zIndex: 999, position: 'absolute', top: 0, left: 0, right: 0 }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <BackButton onBack={() => navigation.goBack()} />
                    <Text style={[styles.homeName]}>
                        {lang.scanner || "Quét mã QR"}
                    </Text>
                </View>
            </View>
            <CameraView
                style={scannerStyles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: [
                        "qr",
                        "pdf417",
                        "aztec",
                        "ean13",
                        "ean8",
                        "code39",
                        "code93",
                        "code128",
                        "datamatrix",
                        "itf14",
                        "upc_e",
                        "upc_a"
                    ],
                }}
                enableTorch={torchOn}
            >
                {/* Scan Frame Overlay */}
                <View style={scannerStyles.overlay}>
                    <View style={scannerStyles.unfocusedContainer}>
                        <LottieView
                            autoPlay
                            ref={animation}
                            style={{
                                width: width * 0.7,
                                height: width * 0.7,
                            }}
                            source={ScanningLottie}
                        />
                    </View>
                    
                    <Text style={scannerStyles.instructionText}>
                        Điều chỉnh mã QR hoặc barcode vào khung
                    </Text>
                </View>

                {/* Torch Button */}
                <TouchableOpacity 
                    style={scannerStyles.torchButton}
                    onPress={toggleTorch}
                >
                    <Ionicons 
                        name={torchOn ? "flash" : "flash-off"} 
                        size={24} 
                        color="#fff" 
                    />
                </TouchableOpacity>
            </CameraView>
        </View>
    );
}

const scannerStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    permissionText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    permissionSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    unfocusedContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    scanFrame: {
        width: width * 0.7,
        height: width * 0.7,
        position: 'relative',
    },
    instructionText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 24,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: 12,
        borderRadius: 8,
    },
    torchButton: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 16,
        borderRadius: 50,
    },
    resultContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 16,
    },
    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
    },
    resultHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginTop: 12,
    },
    resultContent: {
        marginBottom: 20,
    },
    dataRow: {
        marginBottom: 16,
    },
    dataLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
        fontWeight: '600',
    },
    dataValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    dataValueLarge: {
        fontSize: 14,
        color: '#333',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 8,
        fontFamily: 'monospace',
    },
    buttonContainer: {
        flexDirection: 'row',
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
        borderWidth: 2,
        borderColor: '#667eea',
        gap: 8,
    },
    secondaryButtonText: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default BarcodeScannerScreen;

