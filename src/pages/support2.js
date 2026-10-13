import { Text, View, TouchableOpacity, Alert, StatusBar, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, TextInput } from "react-native";
import { useMemo, useState } from "react";
import styles from "../styles/global";
import { CoverImage } from "../components/images";
import TextareaField from "../components/textarea";
import TextField from "../components/textInput";
import BackButton from "../components/home/backButton";

function Support2Screen({ navigation }) {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const disabledButton = useMemo(() => {
        return content == '' || title == '';
    }, [content, title]);


    const onSubmit = async () => {
        Alert.alert("Nội dung của bạn đã được gửi đi");
        setTitle("");
        setContent("");
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <ImageBackground source={CoverImage} style={styles.image} />
            <StatusBar style="auto" />
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <BackButton onBack={() => navigation.goBack()} top={0} />
                    <Text style={[styles.homeName]}>
                        Bảo hành, bảo dưỡng
                    </Text>
                </View>
            </View>
            <ScrollView style={[styles.colFlex, { padding: 10, marginTop: 220 }]}>
                <View style={styles.colFlex}>
                    <TextField
                        label={"Tiêu đề"}
                        value={title}
                        onChange={(value) => setTitle(value)}
                        placeholder="Tiêu đề"
                        required
                    />
                    <TextareaField
                        label={"Nội dung hỗ trợ"}
                        value={content}
                        onChange={(value) => setContent(value)}
                        placeholder={"Nội dung hỗ trợ"}
                        required
                    />
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity onPress={onSubmit} style={disabledButton ? styles.inActiveButton : styles.button}>
                        {loading && <ActivityIndicator size="small" color={"blue"} />}
                        {!loading && <Text style={styles.buttonLabel}>Gửi đi</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default Support2Screen;