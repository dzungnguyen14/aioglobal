import { Text, View, TouchableOpacity, Alert, StatusBar, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import TextField from "../components/textInput";
import { useMemo, useState } from "react";
import { register } from "../fetcher/auth";
import styles from "../styles/global";
import { CoverImage } from "../components/images";
import { useLang } from "../shared/hooks";
import SelectField from "../components/select";
const ACCOUNT_TYPE = {
    INDIVIDUAL: '1',
    COMPANY: '2',
}
const GENDER = {
    MALE: '1',
    FEMALE: '2',
}


function RegisterScreen({ navigation }) {
    const { lang } = useLang();
    const [email, setEmail] = useState('');
    const [fullname, setFullname] = useState('');
    const [phone, setPhone] = useState('');
    const [ref, setRef] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const day = new Date().getDate();
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    const [birthday, setBirthday] = useState(day + "-" + month + "-" + year);
    const [account_type, setAccountType] = useState(ACCOUNT_TYPE.INDIVIDUAL);
    const [gender, setGender] = useState(GENDER.MALE);
    const disabledButton = useMemo(() => {
        return loading || !email || !password || !phone || !fullname;
    }, [loading, email, phone, password, fullname]);

    const onSubmit = async () => {
        if (!disabledButton) {
            setLoading(true);
            const response = await register({
                email: email,
                password: password,
                phone: phone,
                fullname: fullname,
                ref_by: ref,
                birthday: birthday,
                account_type: account_type,
                gender: gender,
            })
            setLoading(false);
            if (response.success) {
                Alert.alert(lang.register_success);
                navigation.navigate("Login");
            } else {
                Alert.alert(lang.error, response.msg);
            }
        } else {
            // Alert.alert(lang.error, lang.enter_info_for_register);
            Alert.alert(lang.error_register, lang.enter_info_for_register);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={'padding'}
            style={styles.container}>
            <ImageBackground source={CoverImage} style={[styles.image, {
                opacity: 0.4,
            }]} />
            <StatusBar style="auto" />
            <ScrollView style={[styles.colFlex, { padding: 10, marginTop: 50, marginBottom: 50 }]}>
                <View style={styles.colFlex}>
                    <Text style={styles.textHeading}>{lang.register_account}</Text>
                    <TextField
                        label={lang.enter_your_phone}
                        value={phone}
                        type={'tel'}
                        onChange={(value) => {
                            value = value.replace(/\D/g, '');
                            if (value.length <= 11) {
                                if (value.startsWith('84')) {
                                    setPhone(value);
                                } else if (value.startsWith('0')) {
                                    setPhone(value);
                                } else if (value.length > 0) {
                                    setPhone('0' + value);
                                } else {
                                    setPhone('');
                                }
                            }
                        }}
                        placeholder={lang.enter_your_phone}
                        keyboardType={'phone-pad'}
                        required
                    />
                    <TextField
                        label={lang.enter_your_email}
                        value={email}
                        onChange={(value) => setEmail(value.toLowerCase())}
                        placeholder={lang.enter_your_email}
                        required
                    />
                    <TextField
                        label={lang.enter_your_name}
                        value={fullname}
                        onChange={(value) => setFullname(value)}
                        placeholder={lang.enter_your_name}
                        required
                    />
                    {/* <TextField
                        label={lang.enter_your_birthday}
                        value={birthday}
                        onChange={(value) => {
                            value = value.replace(/[^\d-]/g, '');
                            if (value.length === 2 && birthday.length !== 3) {
                                value = value + '-';
                            }
                            if (value.length === 5 && birthday.length !== 6) {
                                value = value + '-';
                            }
                            if (value.length <= 10) {
                                setBirthday(value);
                            }
                        }}
                        placeholder="dd-mm-yyyy"
                        keyboardType="numeric"
                        required
                    /> */}
                    {/* <SelectField
                        label={lang.select_account_type}
                        value={account_type}
                        onChange={(value) => setAccountType(value)}
                        options={[
                            { label: lang.individual, value: ACCOUNT_TYPE.INDIVIDUAL },
                            { label: lang.company, value: ACCOUNT_TYPE.COMPANY },
                        ]}
                    /> */}
                    {/* <SelectField
                        label={lang.gender}
                        value={gender}
                        onChange={(value) => setGender(value)}
                        options={[
                            { label: lang.male, value: GENDER.MALE },
                            { label: lang.female, value: GENDER.FEMALE },
                        ]}
                    /> */}
                    <TextField
                        label={lang.your_password}
                        value={password}
                        onChange={(v) => setPassword(v)}
                        placeholder={lang.your_password}
                        type={"password"}
                        required
                    />
                    <TextField
                        label={lang.enter_your_ref}
                        value={ref}
                        onChange={(value) => setRef(value)}
                        placeholder={lang.enter_your_ref}
                    />
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity onPress={onSubmit} style={disabledButton ? styles.inActiveButton : styles.button}>
                        {loading && <ActivityIndicator size="small" color={"blue"} />}
                        {!loading && <Text style={styles.buttonLabel}>{lang.confirm}</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={[styles.buttonLabel, { color: 'black', marginTop: 20 }]}>{lang.back} {lang.login}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default RegisterScreen;