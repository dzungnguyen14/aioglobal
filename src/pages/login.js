import {
    Text, View, TouchableOpacity, Alert, ActivityIndicator,
    KeyboardAvoidingView, Platform, ScrollView, Image,
    StyleSheet, TextInput, Dimensions,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { login, register } from "../fetcher/auth";
import { GoogleIcon, LogoImage } from "../components/images";
import { clearItem, getLangFromStore, setItem } from "../shared/utils";
import { USER_TOKEN_KEY } from "../shared/constant";
import { useLang } from "../shared/hooks";
import { TabRoute } from "./home";
import { useGlobal } from "../state/global";
import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

function LoginScreen({ navigation }) {
    const { dispatch } = useGlobal();
    const { lang, value, changeLanguage } = useLang();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [mode, setMode] = useState('waiting'); // waiting, login , register

    const disabledButton = useMemo(() => {
        return loading || !email || !password;
    }, [loading, email, password]);

    useEffect(() => {
        const loadLang = async () => {
            const _lang = await getLangFromStore();
        }
        loadLang();
    }, []);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '893918871770-1r5dcu04br3soaiqro76054t9auc4cdm.apps.googleusercontent.com',
            offlineAccess: true,
        });
    }, []);

    const signInGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            console.log('User Info: ', userInfo);
            Alert.alert('Đăng nhập thành công!', `Chào ${userInfo.user.name}`);

            // Bạn có thể lấy userInfo.idToken để gửi lên Backend xác thực lại
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // Người dùng hủy tiến trình đăng nhập
                console.log('User cancelled the login flow');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // Tiến trình đăng nhập đang diễn ra
                console.log('Signing in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // Google Play Services không có sẵn hoặc bị cũ
                Alert.alert('Lỗi', 'Google Play Services không khả dụng');
            } else {
                // Các lỗi khác
                console.log('Error Code:', error.code, error.message);
                Alert.alert('Lỗi đăng nhập', error.message);
            }
        }
    };

    const reset = () => {
        setEmail('');
        setPassword('');
    }

    useEffect(() => {
        clearItem(USER_TOKEN_KEY);
        reset();
    }, [navigation]);

    const onSubmit = async () => {
        if (disabledButton) return;
        setLoading(true);
        const response = await login({
            email: email,
            pin: password,
            platform: Platform.OS.toLocaleLowerCase(),
        });
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

    const onRegister = async () => {
        if (disabledButton) return;
        setLoading(true);
        const response = await register({
            email: email,
            password: password,
            phone: phone,
            fullname: '',
            ref_by: '',
            birthday: '',
            account_type: '1',
        })
        setLoading(false);
        console.log('Response: ', response);    
        if (response.success) {
            Alert.alert(lang.register_success);
            setMode('login');
        } else {
            Alert.alert(lang.error, response.msg);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={S.root}>

            {/* ── Top brand panel ── */}
            <View style={S.topPanel}>
                {/* Decorative circles */}
                <View style={S.circle1} />
                <View style={S.circle2} />
                <View style={S.circle3} />
            </View>

            {/* ── White card sheet ── */}
            <ScrollView
                style={S.sheet}
                contentContainerStyle={S.sheetContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Image source={LogoImage} style={[S.logo, { flex: 0.2, marginRight: 15 }]} resizeMode="contain" />
                    <Text style={S.heading}>{mode === 'login' ? lang.welcome_to_our_app ?? 'Login' : lang.register_account ?? 'Register'} AIOGlobal</Text>
                </View>

                {/* Email input */}
                <View style={S.inputWrap}>
                    <Ionicons name="mail-outline" size={20} color="#94A3B8" style={S.inputIcon} />
                    <TextInput
                        style={S.input}
                        value={email}
                        onChangeText={(v) => setEmail(v.toLowerCase())}
                        placeholder={lang.enter_your_account_placeholder ?? 'Email'}
                        placeholderTextColor="#94A3B8"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
                {['register'].includes(mode) && (
                    <View style={S.inputWrap}>
                        <Ionicons name="call-outline" size={20} color="#94A3B8" style={S.inputIcon} />
                        <TextInput
                            keyboardType="phone-pad"
                            style={[S.input, { flex: 1 }]}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder={lang.enter_your_phone ?? 'Enter your phone'}
                            placeholderTextColor="#94A3B8"
                        />
                    </View>
                )}

                {/* Password input */}
                {['login', 'register'].includes(mode) && (
                    <View style={S.inputWrap}>
                        <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={S.inputIcon} />
                        <TextInput
                            style={[S.input, { flex: 1 }]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder={lang.your_password ?? 'Password'}
                            placeholderTextColor="#94A3B8"
                            secureTextEntry={!showPassword}
                            autoCorrect={false}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={S.eyeBtn}>
                            <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Forgot password */}
                {mode == 'login' && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate("ForgotPassword")}
                        style={S.forgotWrap}>
                        <Text style={S.forgotText}>{lang.forgot_password ?? 'Forgot password?'}</Text>
                    </TouchableOpacity>
                )}

                {/* Sign in button */}
                {mode == 'login' && (
                    <TouchableOpacity
                        onPress={onSubmit}
                        style={[S.signInBtn, disabledButton && S.signInBtnDisabled]}
                        activeOpacity={0.85}>
                        {loading
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Text style={S.signInText}>{lang.login ?? 'Sign in'}</Text>}
                    </TouchableOpacity>
                )}

                {/* Sign up button */}
                {mode == 'register' && (
                    <TouchableOpacity
                        onPress={onRegister}
                        style={[S.signInBtn]}
                        activeOpacity={0.85}>
                        {loading
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Text style={S.signInText}>{lang.register ?? 'Sign up'}</Text>}
                    </TouchableOpacity>
                )}

                {mode == 'waiting' && (
                    <TouchableOpacity
                        onPress={() => setMode('login')}
                        style={[S.signInBtn]}
                        activeOpacity={0.85}>
                        <Text style={S.signInText}>{lang.next_step}</Text>
                    </TouchableOpacity>
                )}
                { }
                <View style={S.dividerRow}>
                    <View style={S.dividerLine} />
                    <Text style={S.dividerLabel}>{lang.login_with ?? 'Or sign in with'}</Text>
                    <View style={S.dividerLine} />
                </View>

                {/* Social buttons */}
                <View style={S.socialRow}>
                    <TouchableOpacity style={S.socialBtn} activeOpacity={0.75} onPress={signInGoogle}>
                        <Image source={GoogleIcon} style={{ width: 22, height: 22 }} resizeMode="contain" />
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={S.socialBtn} activeOpacity={0.75}>
                        <FontAwesome name="facebook-f" size={20} color="#1877F2" />
                    </TouchableOpacity>
                    <TouchableOpacity style={S.socialBtn} activeOpacity={0.75}>
                        <FontAwesome name="twitter" size={20} color="#1DA1F2" />
                    </TouchableOpacity> */}
                </View>

                {/* Sign up */}
                
                {['waiting', 'login'].includes(mode) && (
                    <View style={S.signupRow}>
                        <Text style={S.signupText}>{lang.dont_have_an_account ?? lang.dont_have_an_account}</Text>
                        <TouchableOpacity onPress={() => setMode('register')}>
                            <Text style={S.signupLink}>{lang.register ?? 'Sign up'}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {['register'].includes(mode) && (
                    <View style={S.signupRow}>
                        <Text style={S.signupText}>{lang.already_have_an_account ?? 'Already have an account? '}</Text>
                        <TouchableOpacity onPress={() => setMode('login')}>
                            <Text style={S.signupLink}>{lang.login ?? 'Sign in'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* Language switcher */}
                <View style={S.langRow}>
                    {['vn', 'en', 'cn'].map((l) => (
                        <TouchableOpacity key={l} onPress={() => changeLanguage(l)} style={S.langBtn}>
                            <Text style={value === l ? S.langActive : S.langInactive}>
                                {l.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const PRIMARY = '#1E3A8A';
const PRIMARY_LIGHT = '#3B5BDB';

const S = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#1E3A8A',
    },
    topPanel: {
        height: 120,
        backgroundColor: '#1E3A8A',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    circle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.06)',
        top: -60,
        left: -40,
    },
    circle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.08)',
        bottom: -40,
        right: -30,
    },
    circle3: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.05)',
        top: 20,
        right: 40,
    },
    logo: {
        width: 220,
        height: 80,
    },
    brandTagline: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    brandSub: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 13,
        marginTop: 4,
    },

    /* ── White card sheet ── */
    sheet: {
        flex: 1,
        backgroundColor: '#F8FAFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -20,
    },
    sheetContent: {
        paddingHorizontal: 28,
        paddingTop: 32,
        paddingBottom: 40,
    },
    heading: {
        fontSize: 17,
        fontWeight: '600',
        color: '#0F172A',
    },

    /* ── Inputs ── */
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 14,
        height: 56,
        marginBottom: 16,
        shadowColor: '#94A3B8',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1E293B',
    },
    eyeBtn: {
        padding: 4,
        marginLeft: 6,
    },

    /* ── Forgot password ── */
    forgotWrap: {
        alignSelf: 'flex-end',
        marginBottom: 24,
        marginTop: -4,
    },
    forgotText: {
        color: PRIMARY_LIGHT,
        fontSize: 13,
        fontWeight: '600',
    },

    /* ── Sign in button ── */
    signInBtn: {
        backgroundColor: PRIMARY,
        borderRadius: 14,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        shadowColor: PRIMARY,
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
    signInBtnDisabled: {
        backgroundColor: '#CBD5E1',
        shadowOpacity: 0,
        elevation: 0,
    },
    signInText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
    },

    /* ── Divider ── */
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    dividerLabel: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },

    /* ── Social buttons ── */
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 32,
    },
    socialBtn: {
        width: 70,
        height: 52,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#94A3B8',
        shadowOpacity: 0.07,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    /* ── Sign up ── */
    signupRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
    },
    signupText: {
        fontSize: 14,
        color: '#64748B',
    },
    signupLink: {
        fontSize: 14,
        color: PRIMARY_LIGHT,
        fontWeight: '700',
    },

    /* ── Language switcher ── */
    langRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    langBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    langActive: {
        fontSize: 13,
        fontWeight: '800',
        color: PRIMARY,
    },
    langInactive: {
        fontSize: 13,
        fontWeight: '500',
        color: '#94A3B8',
    },
});

export default LoginScreen;
