import { WebView } from 'react-native-webview';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLang } from '../shared/hooks';
import { requestMediaPermissions } from '../shared/permissions';

function IframeScreen({ url, requirePermissions = true }) {
    const { lang } = useLang();
    const [permissionsGranted, setPermissionsGranted] = useState(!requirePermissions);
    const [isCheckingPermissions, setIsCheckingPermissions] = useState(requirePermissions);
    const [permissionError, setPermissionError] = useState(null);
    const webViewRef = useRef(null);

    useEffect(() => {
        if (requirePermissions && url) {
            checkAndRequestPermissions();
        }
    }, [url, requirePermissions]);

    const checkAndRequestPermissions = async () => {
        try {
            setIsCheckingPermissions(true);
            const result = await requestMediaPermissions(lang);
            
            if (result.allGranted) {
                setPermissionsGranted(true);
                setPermissionError(null);
            } else {
                setPermissionsGranted(false);
                setPermissionError(
                    result.camera !== 'granted' 
                        ? lang.camera_permission_denied 
                        : lang.microphone_permission_denied
                );
            }
        } catch (error) {
            console.error('Error requesting permissions:', error);
            setPermissionError(lang.error || 'Permission error');
        } finally {
            setIsCheckingPermissions(false);
        }
    };

    if (!url) return <></>;

    if (isCheckingPermissions) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#1976D2" />
                <Text style={styles.loadingText}>
                    {lang.requesting_permissions || 'Requesting permissions...'}
                </Text>
            </View>
        );
    }

    if (!permissionsGranted && permissionError) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{permissionError}</Text>
                <Text style={styles.hintText}>
                    {lang.open_settings || 'Please open settings to grant permissions'}
                </Text>
            </View>
        );
    }

    return (
        <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            style={styles.webview}
            source={{ uri: url }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            allowsFullscreenVideo={true}
            mediaCapture="camera;microphone"
            cameraPermissionGranted={permissionsGranted}
            microphonePermissionGranted={permissionsGranted}
            allowsAudioRecording={true}
            onMessage={(event) => {
                // Listen for audio/recording events from page
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === 'MEDIA_PERMISSION') {
                    console.log('Media permission status:', data.status, data);
                  } else if (data.type === 'AUDIO_RECORD_START') {
                    console.log('Audio record started:', data);
                  } else if (data.type === 'AUDIO_RECORD_STOP') {
                    console.log('Audio record stopped:', data);
                  } else {
                    console.log('WebView message:', data);
                  }
                } catch (e) {
                  console.log('WebView message:', event.nativeEvent.data);
                }
            }}
            onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('WebView error:', nativeEvent);
            }}
 
            injectedJavaScript={`
                (function() {
                    // Override getUserMedia to use native permissions
                    const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
                    
                    navigator.mediaDevices.getUserMedia = function(constraints) {
                        console.log('getUserMedia called with constraints:', constraints);
                        return originalGetUserMedia(constraints)
                            .then(stream => {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'MEDIA_PERMISSION',
                                    status: 'GRANTED',
                                    constraints: constraints
                                }));
                                return stream;
                            })
                            .catch(error => {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'MEDIA_PERMISSION',
                                    status: 'DENIED',
                                    error: error.message
                                }));
                                throw error;
                            });
                    };
                    
                    // Notify that permissions are ready
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'READY',
                        permissionsGranted: ${permissionsGranted}
                    }));
                })();
                true;
            `}
        />
    );
}

const styles = StyleSheet.create({
    webview: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: '600',
    },
    hintText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default IframeScreen;