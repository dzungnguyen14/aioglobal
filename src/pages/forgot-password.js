import { Text, View, TouchableOpacity, Alert, StatusBar, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import TextField from "../components/textInput";
import { useMemo, useState } from "react";
import { forgotPassword, resetPassword, verifyOTP } from "../fetcher/auth";
import styles from "../styles/global";
import { CoverImage } from "../components/images";
import { useLang } from "../shared/hooks";
import OTPTextInput from "react-native-otp-textinput";

const STEP = {
    FORGOT_PASSWORD: 1,
    ENTER_OTP: 2,
    RESET_PASSWORD: 3
}

function ForgotPasswordScreen({ navigation }) {
    const { lang } = useLang();
    const [email, setEmail] = useState('');
    const [otp, setOTP] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(STEP.FORGOT_PASSWORD);
    const [loading, setLoading] = useState(false);

    const disabledButton = useMemo(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return loading || !emailRegex.test(email);
    }, [loading, email]);


    const onSubmit = async () => {
        setLoading(true);
        const response = await resetPassword({
            email: email,
            otp: otp,
            password: password,
            lang: lang
        })
        setLoading(false);
        if (response.success) {
            Alert.alert(response.msg)
            navigation.navigate("Login");
        } else {
            Alert.alert("Lỗi", response.msg);
        }
    }

    const onEnterOTP = async (val) => {
        setLoading(true);
        const response = await verifyOTP({
            email: email,
            otp: val,
            lang: lang
        })
        setLoading(false);
        if (response.success) {
            setStep(STEP.RESET_PASSWORD);
        } else {
            Alert.alert("Lỗi", response.msg);
        }
    }

    const onForgotPassword = async () => {
        setLoading(true);
        const response = await forgotPassword({
            email: email,
            lang: lang
        })
        setLoading(false);
        setOTP('');
        if (response.success) {
            setStep(STEP.ENTER_OTP);
        } else {
            Alert.alert("Lỗi", response.msg);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <ImageBackground source={CoverImage} style={styles.image} />
            <StatusBar style="auto" />
            {step === STEP.FORGOT_PASSWORD && (
                <ScrollView style={[styles.colFlex, { padding: 10, marginTop: 160 }]}>
                    <View style={styles.colFlex}>
                        <Text style={styles.textHeading}>{lang.forgot_password}</Text>
                        <TextField
                            label={lang.enter_your_email}
                            value={email}
                            onChange={(value) => setEmail(value.toLowerCase())}
                            placeholder={lang.enter_your_email}
                            required
                        />
                    </View>
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={onForgotPassword} style={disabledButton ? styles.inActiveButton : styles.button}>
                            {loading && <ActivityIndicator size="small" color={"blue"} />}
                            {!loading && <Text style={styles.buttonLabel}>{lang.confirm}</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.buttonLabel, { color: 'black', marginTop: 20 }]}>{lang.back} {lang.login}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
            {step === STEP.ENTER_OTP && (
                <ScrollView style={[styles.colFlex, { padding: 10, marginTop: 250 }]}>
                    <View style={[styles.colFlex, { textAlign: 'center' }]}>
                        <Text style={[styles.textNormal, { fontWeight: 'bold', textAlign: 'center' }]}>{lang.otp_code}</Text>
                        <Text style={[styles.textNormal, { textAlign: 'center' }]}>{lang.otp_message}</Text>
                        <OTPTextInput
                            tintColor={"#094C9C"}
                            defaultValue={otp}
                            inputCount={6}
                            handleTextChange={(value) => {
                                setOTP(value)
                                if (value.length === 6) {
                                    setTimeout(() => {
                                        onEnterOTP(value);
                                    }, 1000);
                                }
                            }}
                            required
                        />
                    </View>
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => onForgotPassword()} style={{ margin: 20 }}>
                            <Text style={[styles.buttonLabel, { color: 'black', marginTop: 20 }]}>{lang.send_otp_again}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onEnterOTP(otp)} style={disabledButton ? styles.inActiveButton : styles.button}>
                            {loading && <ActivityIndicator size="small" color={"blue"} />}
                            {!loading && <Text style={styles.buttonLabel}>{lang.confirm}</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setStep(STEP.FORGOT_PASSWORD)}>
                            <Text style={[styles.buttonLabel, { color: 'black', marginTop: 20 }]}>{lang.back}</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            )}
            {step === STEP.RESET_PASSWORD && (
                <ScrollView style={[styles.colFlex, { padding: 10, marginTop: 160 }]}>
                    <View style={styles.colFlex}>
                        <Text style={styles.textHeading}>{lang.forgot_password}</Text>
                        <TextField
                            label={lang.confirm_new_password}
                            value={password}
                            onChange={(value) => setPassword(value)}
                            placeholder={lang.confirm_new_password}
                            secureTextEntry
                            type="password"
                            required
                        />
                    </View>
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={onSubmit} style={disabledButton ? styles.inActiveButton : styles.button}>
                            {loading && <ActivityIndicator size="small" color={"blue"} />}
                            {!loading && <Text style={styles.buttonLabel}>{lang.confirm}</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setStep(STEP.ENTER_OTP)}>
                            <Text style={[styles.buttonLabel, { color: 'black', marginTop: 20 }]}>{lang.back}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </KeyboardAvoidingView>
    )
}

export default ForgotPasswordScreen;