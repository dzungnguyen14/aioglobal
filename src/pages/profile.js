import { Text, View, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Dimensions, } from "react-native";
import styles from "../styles/global";
import IframeScreen from "../components/webview";
import { useLang } from "../shared/hooks";
import BackButton from "../components/home/backButton";

function ProfileScreen({ navigation, route }) {
    const { lang } = useLang();
    const { profile } = route.params;
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <BackButton onBack={() => navigation.goBack()} top={0} />
                    <Text style={[styles.homeName]}>
                        {lang.profile}
                    </Text>
                </View>
            </View>
            <View style={{ position: 'absolute', top: 0, left: 0, height: Dimensions.get('screen').height, width: Dimensions.get('screen').width }}>
                <IframeScreen url={`https://profile.aioglobal.org/${profile.code}?mode=app`} />
            </View>
        </KeyboardAvoidingView>
    )
}

export default ProfileScreen;