import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { requestMediaPermissions, checkMediaPermissions } from '../../utils/permissions';
import { useLang } from '../../hooks';

/**
 * Permission Check Component
 * 
 * A reusable component that checks and requests camera/microphone permissions
 * Shows appropriate UI based on permission status
 * 
 * @param {Function} onPermissionsGranted - Callback when all permissions are granted
 * @param {Function} onPermissionsDenied - Callback when permissions are denied
 * @param {boolean} autoCheck - Automatically check permissions on mount (default: true)
 */
const PermissionCheck = ({ 
    onPermissionsGranted, 
    onPermissionsDenied,
    autoCheck = true,
    children 
}) => {
    const { lang } = useLang();
    const [checking, setChecking] = useState(autoCheck);
    const [permissionStatus, setPermissionStatus] = useState({
        camera: 'undetermined',
        microphone: 'undetermined',
        allGranted: false
    });

    useEffect(() => {
        if (autoCheck) {
            checkPermissions();
        }
    }, [autoCheck]);

    const checkPermissions = async () => {
        setChecking(true);
        try {
            const status = await checkMediaPermissions();
            setPermissionStatus(status);
            
            if (status.allGranted && onPermissionsGranted) {
                onPermissionsGranted();
            } else if (!status.allGranted && onPermissionsDenied) {
                onPermissionsDenied(status);
            }
        } catch (error) {
            console.error('Error checking permissions:', error);
        } finally {
            setChecking(false);
        }
    };

    const requestPermissions = async () => {
        setChecking(true);
        try {
            const result = await requestMediaPermissions(lang);
            setPermissionStatus(result);
            
            if (result.allGranted && onPermissionsGranted) {
                onPermissionsGranted();
            } else if (!result.allGranted && onPermissionsDenied) {
                onPermissionsDenied(result);
            }
        } catch (error) {
            console.error('Error requesting permissions:', error);
        } finally {
            setChecking(false);
        }
    };

    if (checking) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#1976D2" />
                <Text style={styles.checkingText}>
                    {lang.requesting_permissions || 'Checking permissions...'}
                </Text>
            </View>
        );
    }

    if (permissionStatus.allGranted) {
        // All permissions granted - render children or success message
        return children || (
            <View style={styles.container}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                <Text style={styles.successText}>
                    {lang.permissions_granted || 'Permissions granted'}
                </Text>
            </View>
        );
    }

    // Permissions not granted - show request UI
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name="videocam-outline" size={48} color="#1976D2" />
                <Ionicons name="mic-outline" size={48} color="#1976D2" />
            </View>
            
            <Text style={styles.title}>
                {lang.permission_required || 'Permission Required'}
            </Text>
            
            <Text style={styles.description}>
                {lang.camera_permission_denied || 
                 'We need access to your camera and microphone for video calls.'}
            </Text>

            <View style={styles.permissionList}>
                <View style={styles.permissionItem}>
                    <Ionicons 
                        name={permissionStatus.camera === 'granted' ? 'checkmark-circle' : 'close-circle'} 
                        size={24} 
                        color={permissionStatus.camera === 'granted' ? '#4CAF50' : '#f44336'} 
                    />
                    <Text style={styles.permissionText}>Camera</Text>
                </View>
                
                <View style={styles.permissionItem}>
                    <Ionicons 
                        name={permissionStatus.microphone === 'granted' ? 'checkmark-circle' : 'close-circle'} 
                        size={24} 
                        color={permissionStatus.microphone === 'granted' ? '#4CAF50' : '#f44336'} 
                    />
                    <Text style={styles.permissionText}>Microphone</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.button}
                onPress={requestPermissions}
            >
                <Text style={styles.buttonText}>
                    {lang.confirm || 'Grant Permissions'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f5f5f5',
    },
    checkingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    successText: {
        marginTop: 16,
        fontSize: 18,
        color: '#4CAF50',
        fontWeight: '600',
    },
    iconContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    permissionList: {
        width: '100%',
        marginBottom: 32,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 8,
    },
    permissionText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#1976D2',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        minWidth: 200,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PermissionCheck;

