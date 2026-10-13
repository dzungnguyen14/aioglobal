import { Text, View, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, } from "react-native";
import styles from "../styles/global";
import { useLang, useProfile } from "../shared/hooks";
import { useEffect, useState } from "react";
import TextField from "../components/textInput";
import { getProfile, updateProfile } from "../fetcher/api";
import BackButton from "../components/home/backButton";
import SelectField from "../components/select";
import RichEditorField from "../components/richeditor";
import { useGlobal } from "../state/global";

function EditProfileIdScreen({ navigation }) {
    const { lang } = useLang();
    const { state, dispatch } = useGlobal();  
    const { profile } = state;
    const { setProfile } = useProfile();
    const [value, setValue] = useState(profile ?? {});

    const onLoadProfile = async () => {
        const resp = await getProfile(profile.token);
        if (resp.success && resp.profile) {
            setValue(resp.profile);
        }
    }

    const onSubmit = async () => {
        const resp = await updateProfile({
            education_level: value.education_level,
            education_process: value.education_process,
            facebook_link: value.facebook_link,
            tiktok_link: value.tiktok_link,
            amazon_link: value.amazon_link,
            shopee_link: value.shopee_link,
            lazada_link: value.lazada_link,
            alibaba_link: value.alibaba_link,
            youtube: value.youtube,
            website: value.website,
            introduce: value.introduce,
            wallet_address: value.wallet_address,
            position: value.position,
            title: value.title,
            skills: value.skills,
            work_exp: value.work_exp,
            rewards: value.rewards,
            extra_info: value.extra_info,
            education_level: value.education_level,
            education_process: value.education_process,
            hobby: value.hobby,
        }, profile.token);

        if (resp.result) {
            const newProfile = {
                ...profile,
                education_level: value.education_level,
                education_process: value.education_process,
                facebook_link: value.facebook_link,
                tiktok_link: value.tiktok_link,
                amazon_link: value.amazon_link,
                shopee_link: value.shopee_link,
                lazada_link: value.lazada_link,
                alibaba_link: value.alibaba_link,
                youtube: value.youtube,
                website: value.website,
                introduce: value.introduce,
                wallet_address: value.wallet_address,
                position: value.position,
                title: value.title,
                skills: value.skills,
                work_exp: value.work_exp,
                rewards: value.rewards,
                extra_info: value.extra_info,
                education_level: value.education_level,
                education_process: value.education_process,
                hobby: value.hobby,
            };
            dispatch({ type: 'SET_PROFILE', payload: newProfile });
            await setProfile(newProfile);
            Alert.alert(lang.success);
        } else {
            Alert.alert(lang.error)
        }
    }

    useEffect(() => {
        if (profile && profile.token) {
            onLoadProfile();
        }
    }, [profile]);


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <View style={[styles.homeHeader, { zIndex: 999 }]}>
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <BackButton onBack={() => navigation.goBack()} top={0} />
                    <Text style={[styles.homeName]}>
                        {lang.edit_profile_id}
                    </Text>
                </View>
            </View>
            <ScrollView style={{ paddingHorizontal: 20 }}>
                <View style={[styles.colFlex, { gap: 10, marginBottom: 50 }]}>
                    <SelectField
                        label={lang.education_level}
                        value={value.education_level}
                        onChange={(education_level) => setValue({
                            ...value,
                            education_level
                        })}
                        options={[
                            { label: lang.select_education_level, value: "" },
                            { label: lang.primary, value: "Tiểu học" },
                            { label: lang.secondary, value: "Trung học" },
                            { label: lang.university, value: "Đại học" },
                            { label: lang.postgraduate, value: "Sau đại học" },
                        ]}
                    />
                    <RichEditorField
                        label={lang.education_process}
                        value={value.education_process}
                        onChange={(education_process) => setValue({
                            ...value,
                            education_process
                        })}
                    />
                    <TextField
                        label="Facebook"
                        value={value.facebook_link}
                        onChange={(facebook_link) => setValue({
                            ...value,
                            facebook_link
                        })}
                    />
                    <TextField
                        label="TikTok"
                        value={value.tiktok_link}
                        onChange={(tiktok_link) => setValue({
                            ...value,
                            tiktok_link
                        })}
                    />
                    <TextField
                        label="Amazon"
                        value={value.amazon_link}
                        onChange={(amazon_link) => setValue({
                            ...value,
                            amazon_link
                        })}
                    />
                    <TextField
                        label="Shopee"
                        value={value.shopee_link}
                        onChange={(shopee_link) => setValue({
                            ...value,
                            shopee_link
                        })}
                    />
                    <TextField
                        label="Lazada"
                        value={value.lazada_link}
                        onChange={(lazada_link) => setValue({
                            ...value,
                            lazada_link
                        })}
                    />
                    <TextField
                        label="Alibaba"
                        value={value.alibaba_link}
                        onChange={(alibaba_link) => setValue({
                            ...value,
                            alibaba_link
                        })}
                    />
                    <TextField
                        label={lang.website}
                        value={value.website}
                        onChange={(website) => setValue({
                            ...value,
                            website
                        })}
                    />
                    <TextField
                        label="YouTube"
                        value={value.youtube}
                        onChange={(youtube) => setValue({
                            ...value,
                            youtube
                        })}
                    />
                    <TextField
                        label={lang.wallet_address}
                        value={value.wallet_address}
                        onChange={(wallet_address) => setValue({
                            ...value,
                            wallet_address
                        })}
                    />
                    <RichEditorField
                        label={lang.introduce}
                        value={value.introduce}
                        onChange={(introduce) => setValue({
                            ...value,
                            introduce
                        })}
                    />
                    <TextField
                        label={lang.position}
                        value={value.position}
                        onChange={(position) => setValue({
                            ...value,
                            position
                        })}
                    />
                    <TextField
                        label={lang.title}
                        value={value.title}
                        onChange={(title) => setValue({
                            ...value,
                            title
                        })}
                    />
                    <RichEditorField
                        label={lang.skills}
                        value={value.skills}
                        onChange={(skills) => setValue({
                            ...value,
                            skills
                        })}
                    />
                    <RichEditorField
                        label={lang.work_exp}
                        value={value.work_exp}
                        onChange={(work_exp) => setValue({
                            ...value,
                            work_exp
                        })}
                    />
                    <RichEditorField
                        label={lang.rewards}
                        value={value.rewards}
                        onChange={(rewards) => setValue({
                            ...value,
                            rewards
                        })}
                    />
                    <RichEditorField
                        label={lang.extra_info}
                        value={value.extra_info}
                        onChange={(extra_info) => setValue({
                            ...value,
                            extra_info
                        })}
                        multiline={true}
                        numberOfLines={4}
                    />
                    <RichEditorField
                        label={lang.hobby}
                        value={value.hobby}
                        onChange={(hobby) => setValue({
                            ...value,
                            hobby
                        })}
                        multiline={true}
                        numberOfLines={4}
                    />
                    <TouchableOpacity style={styles.button} onPress={onSubmit}>
                        <Text style={[styles.buttonLabel, { color: 'white' }]}>{lang.send}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default EditProfileIdScreen;