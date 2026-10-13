import { Text, View, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import TextField from "../components/textInput";
import { useEffect, useMemo, useState } from "react";
import { login } from "../fetcher/auth";
import styles from "../styles/global";
import { CoverImage, CustomImage, FacebookIcon, GoogleIcon } from "../components/images";
import { clearItem, getLangFromStore, setItem } from "../shared/utils";
import { USER_TOKEN_KEY, USER_LANG } from "../shared/constant";
import { useLang } from "../shared/hooks";
import { TabRoute } from "./home";
import { reloadAppAsync } from "expo";
import { useGlobal } from "../state/global";
// import Constants from 'expo-constants';
// import * as AuthSession from 'expo-auth-session';

function LoginScreen({ navigation }) {
    const { dispatch } = useGlobal();
    const { lang, value, changeLanguage } = useLang();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const disabledButton = useMemo(() => {
        return loading || !email || !password;
    }, [loading, email, password]);

    useEffect(() => {
        const loadLang = async () => {
            const _lang = await getLangFromStore();
            if (_lang) setLang(_lang);
        }
        loadLang();
    }, []);

    const reset = () => {
        setEmail('');
        setPassword('');
    }

    useEffect(() => {
        clearItem(USER_TOKEN_KEY);
        reset()
    }, [navigation]);

    const onSubmit = async () => {
        if (disabledButton) return;
        setLoading(true);
        const response = await login({
            email: email,
            pin: password,
            platform: Platform.OS.toLocaleLowerCase(),
        })
        setLoading(false);
        
        if (response.success) {
            reset();
            dispatch({ type: 'SET_PROFILE', payload: response });
            await setItem(USER_TOKEN_KEY, JSON.stringify(response));
            navigation.navigate("Home", { item: response, screen: TabRoute.TabHome });
        } else {
            Alert.alert(lang.error, response.msg);
        }
    }

    // const discoveryGoogle = AuthSession.useAutoDiscovery('https://accounts.google.com');
    // const GoogleAuth = AuthSession.useAuthRequest(
    //     {
    //       clientId: Constants.expoConfig.extra.expoClientId,
    //       iosClientId: Constants.expoConfig.extra.iosClientId,
    //       androidClientId: Constants.expoConfig.extra.androidClientId,
    //       redirectUri: AuthSession.makeRedirectUri({
    //         scheme: Constants.expoConfig.scheme,
    //       }),
    //       scopes: ['openid', 'profile', 'email'],
    //     },
    //     discoveryGoogle
    // );
    // const discoveryFacebook = AuthSession.useAutoDiscovery({
    //     authorizationEndpoint: 'https://www.facebook.com/v17.0/dialog/oauth',
    //     tokenEndpoint: 'https://graph.facebook.com/v17.0/oauth/access_token',
    // });
    // const FacebookAuth = AuthSession.useAuthRequest(
    //     {
    //         clientId: '844114241760305',
    //         scopes: ['public_profile', 'email'],
    //         redirectUri: AuthSession.makeRedirectUri({
    //             scheme: Constants.expoConfig.scheme,
    //         }),
    //         responseType: 'token',
    //     },
    //     discoveryFacebook
    // );
    // useEffect(() => {
    //     if (GoogleAuth.response?.type === 'success') {
    //         const { authentication } = GoogleAuth.response;
    //         console.log('Access token:', authentication.accessToken);
    //         // 👉 Bạn có thể gọi Google API hoặc xác thực với backend tại đây
    //     }
    // }, [GoogleAuth.response]);

    // useEffect(() => {
    //     if (FacebookAuth.response?.type === 'success') {
    //         const { authentication } = FacebookAuth.response;
    //         console.log('Access token:', authentication.accessToken);
    //         // 👉 Bạn có thể gọi Google API hoặc xác thực với backend tại đây
    //     }
    // }, [FacebookAuth.response]);

    
    return (
        <KeyboardAvoidingView
            behavior={"padding"}
            style={styles.container}>
            <ImageBackground source={CoverImage} style={styles.image} />
            <ScrollView style={[styles.colFlex, { padding: 10, paddingTop: 180 }]}>
                <View style={{ flex: 1, flexDirection: 'column', gap: 10, justifyContent: 'center', marginTop: 50 }}>
                    <Text style={styles.textHeading}>{lang.login}</Text>
                </View>
                {/* <View style={{ flex: 1, flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => GoogleAuth.promptAsync()} style={styles.socialButton}>
                        <CustomImage source={GoogleIcon} style={{ width: 20, height: 20 }} />
                    </TouchableOpacity>
                    <TouchableOpacity  style={styles.socialButton}>
                        <CustomImage source={FacebookIcon} style={{ width: 30, height: 30 }} />
                    </TouchableOpacity>
                </View> */}
                <View style={[styles.colFlex, { gap: 10 }]}>
                    <TextField
                        label={lang.enter_your_account_placeholder}
                        value={email}
                        onChange={(value) => setEmail(value.toLowerCase())}
                        placeholder={lang.enter_your_account_placeholder}
                        required
                    />
                    <TextField
                        hideLabel
                        value={password}
                        onChange={(v) => setPassword(v)}
                        placeholder={lang.your_password}
                        type={"password"}
                        required
                    />
                    <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} >
                        <Text style={[styles.buttonLabel, { color: 'black', textAlign: 'right' }]}>{lang.forgot_password}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onSubmit} style={disabledButton ? styles.inActiveButton : styles.button}>
                        {loading && <ActivityIndicator size="small" color={"blue"} />}
                        {!loading && <Text style={styles.buttonLabel}>{lang.login}</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                        <Text style={[styles.buttonLabel, { color: 'black', marginTop: 20 }]}>{lang.register}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.footer}>
                    <View style={{ flex: 1, flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 50 }}>
                        <Text style={[styles.normalLabel, { fontWeight: 600 }]}>{lang.language}:</Text>
                    </View>
                    <View style={styles.langRow}>
                        <TouchableOpacity
                            onPress={() => changeLanguage('vn')}>
                            <Text style={value == 'vn' ? styles.langRowTextActive : styles.langRowText}>VN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => changeLanguage('en')}>
                            <Text style={value == 'en' ? styles.langRowTextActive : styles.langRowText}>EN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => changeLanguage('cn')}>
                            <Text style={value == 'cn' ? styles.langRowTextActive : styles.langRowText}>CN</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default LoginScreen;