import { TextInput, View, Text, SafeAreaView } from "react-native";
import styles from "../styles/global";
function TextareaField({ label, value, onChange, required, placeholder, customStyle, type, hideLabel, onPressEnter }) {
    return (
        <SafeAreaView>
            <View style={styles.inputContainer}>
                {!hideLabel && (
                    <View style={{ ...styles.rowFlex, marginTop: 20 }}>
                        {required && <Text style={styles.textDanger}>*</Text>}
                        {label && (<Text style={styles.inputLabel}>{label}</Text>)}
                    </View>
                )}
                <TextInput
                    multiline
                    numberOfLines={5}
                    style={[customStyle, styles.textInput, { paddingVertical: 15, fontSize: 14}]}
                    value={value}
                    onChangeText={onChange}
                    required={required}
                    placeholder={placeholder}
                    onPressEnter={() => {
                        if(onPressEnter) onPressEnter()
                    }}
                />

            </View>
        </SafeAreaView>
    )
}

export default TextareaField;