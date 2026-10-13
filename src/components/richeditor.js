import { View, Text, SafeAreaView } from "react-native";
import styles from "../styles/global";
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { useEffect, useRef, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto } from "../fetcher/api";
import { useGlobal } from "../state/global";

function RichEditorField({ label, value, onChange, required, placeholder, customStyle, type, hideLabel, onPressEnter }) {
    const richTextRef = useRef(null);
    const [init, setInit] = useState(false);
    const { state } = useGlobal();
    const { profile } = state;
    const [status, requestPermission] = ImagePicker.useCameraPermissions();

    useEffect(() => {
        if (status && status.status == 'undetermined') {
            requestPermission();
        }
    }, [status])
    useEffect(() => {
        if (value && !init) {
            richTextRef.current.setContentHTML(value);
            setInit(true);
        }
    }, [value]);

    const handleImagePicker = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.4,
          });

        if (!result.canceled) {
            const resp = await uploadPhoto(result.assets[0].uri, profile.token);
            if (resp.url) {
                richTextRef.current.insertImage(resp.url); 
                richTextRef.current.insertText("<br/>"); 
            }
        }
    };

    return (
        <SafeAreaView>
            <View style={[styles.inputContainer, { minHeight: 400 }]}>
                {!hideLabel && (
                    <View style={{ ...styles.rowFlex, marginTop: 20, marginBottom: 10 }}>
                        {required && <Text style={styles.textDanger}>*</Text>}
                        {label && (<Text style={styles.inputLabel}>{label}</Text>)}
                    </View>
                )}
                <RichToolbar
                    editor={richTextRef}
                    actions={['bold', 'italic', 'underline', 'unorderedList', 'orderedList', 'link', 'insertImage', 'clear']}
                    iconMap={{
                        insertImage: require('../../assets/upload.png')
                    }}
                    insertImage={handleImagePicker}
                />
                <RichEditor
                    initialContentHTML={value}
                    onChange={onChange}
                    ref={richTextRef}
                    style={styles.richEditor}
                    placeholder={placeholder}
                    useContainer={true}
                />


            </View>
        </SafeAreaView>
    )
}

export default RichEditorField;