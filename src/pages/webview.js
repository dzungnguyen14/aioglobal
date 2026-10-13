import { Text, View, KeyboardAvoidingView, Platform, Dimensions, } from "react-native";
import styles from "../styles/global";
import IframeScreen from "../components/webview";
import { useLang } from "../shared/hooks";
import BackButton from "../components/home/backButton";

function WebviewScreen({ navigation, route }) {
    const { lang } = useLang();
    const { url, name } = route.params;
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <BackButton onBack={() => navigation.goBack()} />
                    <Text style={[styles.homeName]}>
                        {name}
                    </Text>
                </View>
            </View>
            <View style={{ position: 'absolute', top: 0, left: 0, height: Dimensions.get('screen').height, width: Dimensions.get('screen').width }}>
                <IframeScreen url={url} />
            </View>
        </KeyboardAvoidingView>
    )
}

export default WebviewScreen;