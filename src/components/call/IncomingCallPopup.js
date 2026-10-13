import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import LottieView from "lottie-react-native";

import RingingLottie from '../../../assets/ringing.json';

export default function IncomingCallPopup({ callerName, onAccept, onReject }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const animation = useRef(null);

    useEffect(() => {
        Animated.spring(fadeAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
            <View style={styles.card}>
                <View style={styles.info}>
                    <Text style={styles.title}>Cuộc gọi đến</Text>
                    <Text style={styles.caller}>{callerName}</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.accept} onPress={onAccept}>
                        <LottieView
                            autoPlay
                            ref={animation}
                            style={{
                                width: 65,
                                height: 65,
                            }}
                            source={RingingLottie}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.reject} onPress={onReject}>
                        <Ionicons name="call-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-start",
        alignItems: "center",
        zIndex: 999,
    },
    info: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "center", 
        alignContent: 'center',
        padding: 10,
        paddingLeft: 20,
        gap: 5,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 50,
        flexDirection: "row",
        gap: 20,
        padding: 5,
        width: "80%",
        alignItems: "center",
        marginTop: 40
    },
    title: {
        fontSize: 13,
        colors: "#d9d9d9",
        fontWeight: "600",
    },
    caller: {
        fontSize: 18,
    },
    actions: {
        flexDirection: "row",
        gap: 10,
        paddingRight: 20,
    },
    accept: {
        backgroundColor: "green",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    reject: {
        backgroundColor: "red",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
});
