import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import styles from "../../styles/global";
import { useLang, useProfile } from "../../shared/hooks";
import { AccountImage, CustomImage } from "../images";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect, useMemo, useCallback } from "react";
import { deactiveAccount, fetchCard, fetchHistoryPoint, fetchPin } from "../../fetcher/api";
import useConfirmDialog from "../confirm";
import HomeHeader from "./components/header";
import { useGlobal } from "../../state/global";
import { useNavigation } from "@react-navigation/native";
import { APP_VERSION } from "../../constants/home";
import CardInfo from "./card-info";

function HomeProfile() {
    const { state, dispatch } = useGlobal();
    const { profile } = state;
    const { clearProfile } = useProfile();
    const { featureToggle } = state;
    const toggleOS = useMemo(() => {
        if (Platform.OS == 'android') return true;
        return featureToggle.ios ? parseInt(featureToggle.ios ?? '0') >= APP_VERSION : false
    }, [featureToggle])

    const navigation = useNavigation();

    const confirmDialog = useConfirmDialog();
    const { lang, value, changeLanguage } = useLang();
    const [pin, setPin] = useState('');
    const [point, setPoint] = useState(0);
    const defaultSeconds = 60;
    const [seconds, setSeconds] = useState(0);
    const [loadingPin, setLoadingPin] = useState(false);
    const [loadingPoint, setLoadingPoint] = useState(false);
    const [card, setCard] = useState(null);

    const getCard = useCallback(async () => {
        if (!profile.token) return;
        const response = await fetchCard(profile.token);
        if (response.success) {
            setCard(response.card);
        }
    }, [profile.token]);

    const getPin = useCallback(async () => {
        if (!profile.token) return;
        setLoadingPin(true);
        const response = await fetchPin(profile.token);
        if (response.success) {
            setPin(response.otp);
            setSeconds(defaultSeconds);
        }
        setLoadingPin(false);
    }, [profile.token]);

    const getPoint = useCallback(async () => {
        if (!profile.token) return;
        setLoadingPoint(true);
        const response = await fetchHistoryPoint(profile.token);
        if (response.success) {
            setPoint(response.point);
        }
        setLoadingPoint(false);
    }, [profile.token]);

    useEffect(() => {
        if (seconds > 0) {
            const timer = setTimeout(() => {
                setSeconds(prev => prev - 1);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [seconds]);

    useEffect(() => {
        if (profile.token) {
            getPoint();
            getCard();
        }
    }, [profile.token]);

    useEffect(() => {
        if (profile.token && seconds === 0) {
            getPin();
        }
    }, [seconds, profile.token, getPin]);

    const onDeleteAccount = () => {
        confirmDialog(lang.deactive_account, lang.confirm_deactive_account, async () => {
            const response = await deactiveAccount(profile.token);
            if (response.success) {
                Alert.alert(lang.deactive_account, lang.deactive_account_desc);
            }
        })
    }

    const onLogoutHanlder = async () => {
        confirmDialog(lang.logout, lang.confirm_logout, onLogout)
    }

    const onLogout = () => {
        clearProfile();
        dispatch({ type: 'SET_PROFILE', payload: {} });
        navigation.navigate('Login');
    }
    return (
        <>
            <HomeHeader />
            <ScrollView style={{ flex: 1, flexDirection: 'collumns', backgroundColor: "#eee" }}>
                <View style={styles.profileRow}>
                    <View style={styles.profileRowLeft}>
                        {profile.avatar && (<CustomImage source={{uri : profile.avatar}} style={{ width: 70, height: 70, borderRadius: 35 }} />)}
                        {!profile.avatar && (<CustomImage source={AccountImage} style={{ width: 70, height: 70 }} />)}
                    </View>
                    <View style={styles.profileRowCenter}>
                        <Text style={styles.valueProfile}>
                            {profile.fullname}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Point', { profile: profile })}>
                            <Text style={[styles.valueProfile, { color: '#094C9C', fontWeight: '700', textAlign: 'left', padding: 5, paddingLeft: 0, borderRadius: 30, fontSize: 14 }]}>
                                {loadingPoint ? `${lang.loading ?? 'Loading'}...` : `${point} ${lang.point}`}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.labelProfile}>{profile.code}</Text>
                    </View>
                </View>
                <View style={styles.homeBarcode}>
                    <View>
                        <Text style={[styles.textNormal, { fontWeight: '600' }]}>
                            {lang.give_code_to_casher}
                        </Text>
                        <Text style={[styles.textHeading]}>
                            {loadingPin ? '...' : pin}
                        </Text>
                    </View>
                    <Text style={[styles.textHeading, { fontSize: 15 }]}>
                        {lang.time_remaining}: {seconds} {lang.second}
                    </Text>
                </View>
                {card && (
                    <CardInfo card={card} />
                )}
                <CardInfo card={profile.card} />

                <View style={styles.profileRow}>
                    <View style={styles.profileRowCenter}>
                        <Text style={styles.labelProfile}>{profile.email}</Text>
                    </View>
                    <View style={styles.profileRowRight}>
                        <Ionicons name="mail" size={32} color={'#094C9C'} />
                    </View>
                </View>
                {toggleOS && (
                    <TouchableOpacity style={styles.profileRow} onPress={() => navigation.navigate('EditProfile', { profile: profile })}>
                        <View style={styles.profileRowCenter}>
                            <Text style={styles.labelProfile}>{lang.edit_profile}</Text>
                        </View>
                        <View style={styles.profileRowRight}>
                            <Ionicons name="person-circle" size={24} color={'#094C9C'} />
                        </View>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.profileRow} onPress={() => navigation.navigate('InviteFriend', { profile: profile })}>
                    <View style={styles.profileRowCenter}>
                        <Text style={styles.labelProfile}>{lang.invite_friend}</Text>
                    </View>
                    <View style={styles.profileRowRight}>
                        <Ionicons name="chevron-forward" size={32} color={'#094C9C'} />
                    </View>
                </TouchableOpacity>
                {toggleOS && (
                    <TouchableOpacity style={styles.profileRow} onPress={() => navigation.navigate('IdentityNumber', { profile: profile, mode: 1 })}>
                        <View style={styles.profileRowCenter}>
                            <Text style={styles.labelProfile}>{lang.update_identity_photo}</Text>
                        </View>
                        <View style={styles.profileRowRight}>
                            <Ionicons name="chevron-forward" size={32} color={'#094C9C'} />
                        </View>
                    </TouchableOpacity>
                )}
                {profile.phone != null && (
                    <View style={styles.profileRow}>
                        <View style={styles.profileRowLeft}>
                            <Ionicons name="call" size={32} color={'#094C9C'} />
                        </View>
                        <View style={styles.profileRowCenter}>
                            <Text style={styles.labelProfile}>{profile.phone}</Text>
                        </View>
                    </View>
                )}
                {toggleOS ? (
                    <>
                        <View style={[styles.profileRow, { gap: 20 }]}>
                            <TouchableOpacity onPress={onLogoutHanlder}>
                                <Text style={[styles.valueProfile, styles.textDanger]}>{lang.logout}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.profileRow, { gap: 20 }]}>
                            <TouchableOpacity onPress={onDeleteAccount}>
                                <Text style={[styles.valueProfile, styles.textDanger]}>{lang.deactive_account}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.langRow, { marginBottom: 10 }]}>
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
                    </>
                ) : (
                    <>
                        <View style={[styles.profileRow, { gap: 20 }]}>
                            <TouchableOpacity onPress={onDeleteAccount}>
                                <Text style={[styles.valueProfile, styles.textDanger]}>{lang.deactive_account}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.profileRow, { gap: 20 }]}>
                            <TouchableOpacity onPress={onLogoutHanlder}>
                                <Text style={[styles.valueProfile, styles.textDanger]}>{lang.logout}</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>
        </>
    )
}

export default HomeProfile;