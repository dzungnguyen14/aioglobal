import { Text, View, KeyboardAvoidingView, Platform, Dimensions, } from "react-native";
import styles from "../styles/global";
import IframeScreen from "../components/webview";
import { useLang } from "../shared/hooks";
import BackButton from "../components/home/backButton";
import { useEffect, useState } from "react";
import { getPointIntructionUrl } from "../fetcher/api";
import { useGlobal } from "../state/global";

function PointIntructionScreen({ navigation, route }) {
    const { lang } = useLang();
    const { state } = useGlobal();
    const { profile } = state;
    const [url, setUrl] = useState('');

    const loadUrl = async () => {
        const data = await getPointIntructionUrl(profile.token);
        setUrl(data.url);
    }
    useEffect(() => {
        loadUrl();
    }, []);
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <BackButton onBack={() => navigation.goBack()} />
                    <Text style={[styles.homeName]}>
                        {lang.point_intruction}
                    </Text>
                </View>
            </View>
            {url && (
                <View style={{ position: 'absolute', top: 0, left: 0, height: Dimensions.get('screen').height, width: Dimensions.get('screen').width }}>
                    <IframeScreen url={url} />
                </View>
            )}
        </KeyboardAvoidingView>
    )
}

export default PointIntructionScreen;