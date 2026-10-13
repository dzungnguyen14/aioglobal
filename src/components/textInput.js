import { TextInput, View, Text, SafeAreaView, TouchableOpacity, Platform } from "react-native";
import styles from "../styles/global";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useGlobal } from "../state/global";
import { IOS_VERSION } from "../constants/home";

function TextField({ label, value, onChange, required, placeholder, customStyle, type, hideLabel, keyboardType, disabled }) {
    const { state } = useGlobal();
    const featureToggle = parseInt(state.featureToggle.ios) >= IOS_VERSION;
    const [showPassword, setShowPassword] = useState(Platform.OS === 'android' || !featureToggle);
    const toggleVisibility = () => {
        setShowPassword(!showPassword);
    }
    return (
        <SafeAreaView>
            <View style={styles.inputContainer}>
                {!hideLabel && (
                    <View style={{ ...styles.rowFlex, marginTop: 20 }}>
                        {required && <Text style={styles.textDanger}>*</Text>}
                        {label && (<Text style={styles.inputLabel}>{label}</Text>)}
                    </View>
                )}
                {type == "password" ? (
                    <View style={{ position: 'relative' }}>
                        <TextInput
                            autoCorrect={false}
                            style={[styles.textInput, customStyle]}
                            value={value}
                            onChangeText={onChange}
                            required={required}
                            placeholder={placeholder}
                            secureTextEntry={showPassword}
                            disabled={disabled ?? false}
                        />
                        <TouchableOpacity onPress={() => toggleVisibility(!showPassword)} style={{ position: 'absolute', right: 10, top: 30 }}>
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TextInput
                        style={[styles.textInput, customStyle]}
                        value={value}
                        onChangeText={onChange}
                        required={required}
                        placeholder={placeholder}
                        keyboardType={keyboardType ?? 'default'}
                        disabled={disabled ?? false}
                    />
                )}

            </View>
        </SafeAreaView>
    )
}

export default TextField;