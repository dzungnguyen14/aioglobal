import { Text, View, TouchableOpacity, Alert, StatusBar, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, TextInput } from "react-native";
import { useMemo, useState } from "react";
import styles from "../styles/global";
import { CoverImage } from "../components/images";
import TextField from "../components/textInput";

function TrackingScreen({ navigation }) {
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);

    const disabledButton = useMemo(() => {
        return title == '';
    }, [title]);


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
                        Kiểm tra đơn hàng
                    </Text>
                </View>
            </View>
            <ScrollView style={[styles.colFlex, { padding: 10, marginTop: 220 }]}>
                <View style={styles.colFlex}>
                    <TextField
                        label={"Mã đơn hàng"}
                        value={title}
                        onChange={(value) => setTitle(value)}
                        placeholder="Mã đơn hàng"
                        required
                    />
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity onPress={onSubmit} style={disabledButton ? styles.inActiveButton : styles.button}>
                        {loading && <ActivityIndicator size="small" color={"blue"} />}
                        {!loading && <Text style={styles.buttonLabel}>Xác nhận</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default TrackingScreen;