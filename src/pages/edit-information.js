import { Text, View, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, } from "react-native";
import styles from "../styles/global";
import { useLang, useProfile } from "../shared/hooks";
import { useEffect, useState } from "react";
import TextField from "../components/textInput";
import { getProfile, updateProfile, uploadAvatar } from "../fetcher/api";
import * as ImagePicker from "expo-image-picker";
import { CustomImage } from "../components/images";
import BackButton from "../components/home/backButton";
import { useGlobal } from "../state/global";

function EditInformationScreen({ navigation }) {
    const { lang } = useLang();
    const { state, dispatch } = useGlobal();
    const { profile } = state;
    const { setProfile } = useProfile();
    const [value, setValue] = useState(profile ?? {});
    const [image, setImage] = useState();

    const onLoadProfile = async () => {
        const resp = await getProfile(profile.token);
        if (resp.success && resp.profile) {
            setValue(resp.profile);
            setImage(resp.profile.avatar);
        }
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const previousImage = image;
            setImage(result.assets[0].uri);
            const resp = await uploadAvatar(result.assets[0], profile.token);
            if (resp.result) {
                setImage(resp.image);
                const newProfile = { ...profile, avatar: resp.image };
                dispatch({ type: 'SET_PROFILE', payload: newProfile });
                await setProfile(newProfile);
                Alert.alert(lang.success);
            } else {
                setImage(previousImage);
                Alert.alert(lang.error, resp.msg);
            }
        }
    };

    const onSubmit = async () => {
        const resp = await updateProfile({
            fullname: value.fullname,
            phone_number: value.phone_number,
            address: value.address,
            ic_number: value.ic_number,
        }, profile.token);

        if (resp.result) {
            const newProfile = {
                ...profile,
                avatar: image,
                fullname: value.fullname,
                phone_number: value.phone_number,
                address: value.address,
                ic_number: value.ic_number,
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
            console.log(profile);
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
                        {lang.edit_profile}
                    </Text>
                </View>
            </View>
            <ScrollView style={{ padding: 20 }}>
                <View style={[styles.colFlex, { gap: 10, marginBottom: 50 }]}>
                    <View style={{ flex: 1, flexDirection: 'collumns', justifyContent: 'center', alignContent: 'center', alignItems: 'center', gap: 10, paddingLeft: 10, paddingRight: 10 }}>
                        {/* <Text style={styles.inputLabel}>{lang.avatar}</Text> */}
                        {image && <CustomImage source={image} style={{ width: 200, height: 200, borderRadius: 100 }} />}
                        {/* <TouchableOpacity style={[styles.buttonNormal, { width: 50, height: 50, borderRadius: 25 }]} onPress={pickImage}>
                            <Ionicons name="cloud-upload" size={32} color={"#fff"} />
                        </TouchableOpacity> */}
                    </View>
                    {/* <TextField
                        label={"Email"}
                        value={value.email}
                        onChange={(email) => setValue({
                            ...value,
                            email: email
                        })}
                        keyboardType="email-address"
                        disabled
                    /> */}
                    <TextField
                        label={lang.fullname}
                        value={value.fullname}
                        onChange={(fullname) => setValue({
                            ...value,
                            fullname: fullname
                        })}
                    />
                    <TextField
                        label={lang.phone}
                        value={value.phone_number}
                        onChange={(phone) => setValue({
                            ...value,
                            phone_number: phone
                        })}
                    />
                    <TextField
                        label={lang.address}
                        value={value.address}
                        onChange={(address) => setValue({
                            ...value,
                            address: address
                        })}
                    />
                    <TextField
                        label={lang.ic_number}
                        value={value.ic_number}
                        onChange={(ic_number) => setValue({
                            ...value,
                            ic_number: ic_number
                        })}
                    />
                    <TouchableOpacity style={styles.button} onPress={onSubmit}>
                        <Text style={[styles.buttonLabel, { color: 'white' }]}>{lang.send}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default EditInformationScreen;